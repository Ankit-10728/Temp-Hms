const Razorpay = require('razorpay');
const Appointment = require('../models/Appointment');
const crypto = require('crypto');

// Initialize Razorpay instance with keys from .env.
// NOTE: if keys are missing, keep server bootable (useful for Postman testing of non-payment APIs).
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });
}
exports.createPaymentOrder = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body; // Amount should be passed in standard currency (e.g., INR 500)

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Razorpay expects the amount in the smallest currency sub-unit (e.g., paise for INR)
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${appointmentId}`,
      payment_capture: 1 // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// POST /api/payments/webhook -> Razorpay background confirmation
exports.verifyRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify the cryptographic signature from Razorpay
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature === signature) {
      const event = req.body.event;

      if (event === 'payment.captured') {
        const paymentEntity = req.body.payload.payment.entity;

        // Extract the Appointment ID we passed during createOrder 
        // (Assuming you pass it in the notes object when creating the order)
        const appointmentId = paymentEntity.notes.appointmentId;

        if (appointmentId) {
          await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'PAID' });
          console.log(`[Webhook] Payment verified and captured for Appointment: ${appointmentId}`);
        }
      }

      // Always return 200 OK to Razorpay so they stop pinging the webhook
      return res.status(200).json({ status: 'ok' });
    } else {
      return res.status(400).json({ status: 'invalid signature' });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/payments/invoices -> List owner's past invoices
exports.getOwnerInvoices = async (req, res) => {
  try {
    const ownerId = req.user.id; // Pulled from the mobile app's JWT token

    const invoices = await Appointment.find({ ownerId, paymentStatus: { $in: ['PAID', 'REFUNDED'] } })
      .populate('clinicId', 'name address')
      .populate('doctorId', 'name')
      .select('appointmentDate paymentStatus type clinicId doctorId')
      .sort({ appointmentDate: -1 });

    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
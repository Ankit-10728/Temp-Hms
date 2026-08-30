const axios = require('axios');
const crypto = require('crypto');

// Generate a 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS API
exports.sendSMS = async (mobile, otp) => {
  try {
    const message = `Your login OTP for the Veterinary HMS is ${otp}. Valid for 5 minutes.`;
    // Replace with your actual SMS Gateway API details (e.g., Twilio, Fast2SMS)
    /*
    await axios.post(process.env.SMS_API_URL, {
      apiKey: process.env.SMS_API_KEY,
      numbers: mobile,
      message: message
    });
    */
    console.log(`[SMS] Sent to ${mobile}: ${otp}`);
  } catch (error) {
    console.error('SMS Failed:', error);
  }
};

// Send OTP via WhatsApp API
exports.sendWhatsApp = async (mobile, otp) => {
  try {
    // Replace with actual WhatsApp API (e.g., Meta Cloud API, Interakt)
    /*
    await axios.post(process.env.WHATSAPP_API_URL, {
      messaging_product: "whatsapp",
      to: mobile,
      type: "template",
      template: { name: "otp_verification", language: { code: "en_US" } }
    }, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
    });
    */
    console.log(`[WhatsApp] Sent to ${mobile}: ${otp}`);
  } catch (error) {
    console.error('WhatsApp Failed:', error);
  }
};
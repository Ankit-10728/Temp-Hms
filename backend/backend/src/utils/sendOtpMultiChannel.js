const { generateOTP, sendSMS, sendWhatsApp } = require('./otpService');
const { loginOtpEmail } = require('./emailTemplates');

/**
 * Generates OTPs for email + mobile and sends them.
 * Mobile sending uses SMS (WhatsApp code kept in otpService).
 */
async function sendOtpMultiChannel({
  email,
  mobile,
  otpEmail,
  otpMobile,
  emailSender,
  smsChannel = 'SMS',
}) {
  const emailContent = loginOtpEmail(otpEmail);
  const deliveryTasks = [
    emailSender({
      email,
      subject: 'Your HMS Login OTP',
      ...emailContent,
    }),
  ];

  if (mobile) {
    deliveryTasks.push(
      smsChannel === 'WHATSAPP'
        ? sendWhatsApp(mobile, otpMobile)
        : sendSMS(mobile, otpMobile)
    );
  }

  const results = await Promise.allSettled(deliveryTasks);
  const failures = results.filter((result) => result.status === 'rejected');

  // Log failures but don't crash - allow login to proceed even if OTP delivery fails
  if (failures.length) {
    failures.forEach((result) => {
      console.warn('OTP delivery failed:', result.reason?.message || result.reason);
    });
  }
}

function createOtpPair() {
  const otp = generateOTP();
  return {
    // A login challenge has one code, delivered through both channels.
    otpEmail: otp,
    otpMobile: otp,
  };
}

module.exports = { sendOtpMultiChannel, createOtpPair };


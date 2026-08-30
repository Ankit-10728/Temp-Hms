const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const emailLayout = (content) => `
  <div style="background:#f5f7f6;padding:32px 16px;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      <div style="background:#0c3d2e;padding:22px 28px;color:#ffffff;">
        <strong style="font-size:20px;">HMS</strong>
        <span style="float:right;font-size:13px;opacity:.9;">Account notification</span>
      </div>
      <div style="padding:28px;line-height:1.55;">${content}</div>
      <div style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:12px;">
        This is an automated message from HMS. Please do not reply to this email.
      </div>
    </div>
  </div>`;

const credentialEmail = ({ name, email, password, accountLabel = 'HMS' }) => ({
  message: `Hello ${name},\n\nYour ${accountLabel} account has been created.\n\nLogin email: ${email}\nTemporary password: ${password}\n\nPlease sign in and change your password immediately after your first login. Do not share these credentials with anyone.\n\nRegards,\nHMS Team`,
  html: emailLayout(`
    <h2 style="margin:0 0 16px;color:#0c3d2e;">Welcome to HMS</h2>
    <p>Hello ${escapeHtml(name)},</p>
    <p>Your <strong>${escapeHtml(accountLabel)} account has been created</strong>. Use the credentials below to sign in.</p>
    <div style="margin:20px 0;padding:18px;background:#f0f7f3;border-left:4px solid #0c3d2e;border-radius:6px;">
      <div style="margin-bottom:10px;"><strong>Login email:</strong> ${escapeHtml(email)}</div>
      <div><strong>Temporary password:</strong> ${escapeHtml(password)}</div>
    </div>
    <p style="margin-bottom:0;"><strong>Important:</strong> Change your password immediately after your first login and never share your credentials with anyone.</p>
  `),
});

const loginOtpEmail = (otp) => ({
  message: `Your HMS login OTP is ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`,
  html: emailLayout(`
    <h2 style="margin:0 0 16px;color:#0c3d2e;">Verify your sign-in</h2>
    <p>Use the following one-time password to complete your HMS login:</p>
    <div style="margin:22px 0;padding:18px;text-align:center;background:#f0f7f3;border:1px dashed #0c3d2e;border-radius:8px;font-size:28px;letter-spacing:6px;font-weight:700;color:#0c3d2e;">${escapeHtml(otp)}</div>
    <p><strong>This OTP expires in 5 minutes.</strong></p>
    <p style="margin-bottom:0;"><strong>Security notice:</strong> Never share this code with anyone. HMS staff will never ask you for it.</p>
  `),
});

const passwordResetOtpEmail = (otp) => ({
  message: `Your HMS password reset OTP is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
  html: emailLayout(`
    <h2 style="margin:0 0 16px;color:#0c3d2e;">Reset your password</h2>
    <p>Use the following one-time password to reset your HMS account password:</p>
    <div style="margin:22px 0;padding:18px;text-align:center;background:#f0f7f3;border:1px dashed #0c3d2e;border-radius:8px;font-size:28px;letter-spacing:6px;font-weight:700;color:#0c3d2e;">${escapeHtml(otp)}</div>
    <p><strong>This OTP expires in 10 minutes.</strong></p>
    <p style="margin-bottom:0;"><strong>Security notice:</strong> If you did not request a password reset, you can safely ignore this email. Never share this code with anyone.</p>
  `),
});

const clinicVerificationEmail = ({ clinicName, approved, rejectionReason }) => {
  if (approved) {
    return {
      message: `Your clinic "${clinicName}" has been verified and is now active. You can log in with your clinic admin email.`,
      html: emailLayout(`
        <h2 style="margin:0 0 16px;color:#0c3d2e;">Clinic account activated</h2>
        <p>Good news! Your clinic <strong>${escapeHtml(clinicName)}</strong> has been verified and is now active.</p>
        <div style="margin:20px 0;padding:18px;background:#f0f7f3;border-left:4px solid #0c3d2e;border-radius:6px;">
          You can now sign in with your clinic admin email to get started.
        </div>
        <p style="margin-bottom:0;">Thank you for registering with HMS.</p>
      `),
    };
  }

  return {
    message: `Your clinic "${clinicName}" registration was rejected. Reason: ${rejectionReason || 'Not provided'}`,
    html: emailLayout(`
      <h2 style="margin:0 0 16px;color:#b91c1c;">Clinic registration rejected</h2>
      <p>Your clinic <strong>${escapeHtml(clinicName)}</strong> registration could not be approved.</p>
      <div style="margin:20px 0;padding:18px;background:#fef2f2;border-left:4px solid #b91c1c;border-radius:6px;">
        <strong>Reason:</strong> ${escapeHtml(rejectionReason || 'Not provided')}
      </div>
      <p style="margin-bottom:0;">If you believe this is a mistake, please contact HMS support.</p>
    `),
  };
};

module.exports = { credentialEmail, loginOtpEmail, passwordResetOtpEmail, clinicVerificationEmail };

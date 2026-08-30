const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config();
exports.sendContactMessage = async (req, res) => {
    try {
        const { fullName, email, phone, subject, message } = req.body

        if (!fullName || !email || !phone || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fiends are required"
            })
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        })
        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: process.env.CONTACT_RECEIVER_EMAIL,
            subject: `new contact form submission - ${subject}`,
            html: `
        <h2>New Contact Form Submission</h2>

        <table border="1" cellpadding="10" cellspacing="0">
          <tr>
            <td><strong>Full Name</strong></td>
            <td>${fullName}</td>
          </tr>

          <tr>
            <td><strong>Email</strong></td>
            <td>${email}</td>
          </tr>

          <tr>
            <td><strong>Phone</strong></td>
            <td>${phone}</td>
          </tr>

          <tr>
            <td><strong>Subject</strong></td>
            <td>${subject}</td>
          </tr>

          <tr>
            <td><strong>Message</strong></td>
            <td>${message}</td>
          </tr>
        </table>
      `
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Message sent successFully"
        })

    } catch (err) {
        console.log("ERROR : " + err)
        res.status(500).json({
            success: false,
            message: "Failed to send message"
        })

    }
}
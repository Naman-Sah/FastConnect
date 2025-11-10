// utils/sendOTP.js
const nodemailer = require("nodemailer");

async function sendOTP(email, otp) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your FastConnect OTP",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOTP;

require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 587, // Try 587
  secure: false, // TLS
  auth: {
    user: process.env.GODADDY_EMAIL,
    pass: process.env.GODADDY_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Test Failed:", error.message);
  } else {
    console.log("✅ SMTP Server is Ready 🚀");
  }
});

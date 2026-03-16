require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// Basic configuration
const PORT = process.env.PORT || 3000;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_TO = process.env.MAIL_TO;
const MAIL_FROM = process.env.MAIL_FROM || process.env.MAIL_TO;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, styles.css, script.js) from project root
app.use(express.static(path.join(__dirname)));

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// Simple health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Contact endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Basic server-side validation (mirrors front-end)
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required." });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.toLowerCase())) {
      return res.status(400).json({ error: "Invalid email address." });
    }
    if (!service || !service.trim()) {
      return res.status(400).json({ error: "Service type is required." });
    }
    if (!message || !message.trim() || message.trim().length < 20) {
      return res
        .status(400)
        .json({ error: "Please include at least 20 characters in the message." });
    }

    const safeName = name.trim();
    const safeEmail = email.trim();
    const safePhone = (phone || "").trim();
    const safeService = service.trim();
    const safeMessage = message.trim();

    const subject = `New enquiry from Marchewka Tech website - ${safeService}`;
    const textBody = [
      `You have received a new enquiry from the Marchewka Tech website:`,
      "",
      `Name: ${safeName}`,
      `Email: ${safeEmail}`,
      safePhone ? `Phone: ${safePhone}` : "",
      `Service type: ${safeService}`,
      "",
      "Message:",
      safeMessage
    ]
      .filter(Boolean)
      .join("\n");

    const htmlBody = `
      <p>You have received a new enquiry from the Marchewka Tech website:</p>
      <ul>
        <li><strong>Name:</strong> ${safeName}</li>
        <li><strong>Email:</strong> ${safeEmail}</li>
        ${safePhone ? `<li><strong>Phone:</strong> ${safePhone}</li>` : ""}
        <li><strong>Service type:</strong> ${safeService}</li>
      </ul>
      <p><strong>Message:</strong></p>
      <p>${safeMessage.replace(/\n/g, "<br>")}</p>
    `;

    const mailOptions = {
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: safeEmail,
      subject,
      text: textBody,
      html: htmlBody
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (err) {
    console.error("Error handling contact form:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while sending your request." });
  }
});

// Fallback: serve index.html for root if needed
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Marchewka Tech website running on http://localhost:${PORT}`);
});

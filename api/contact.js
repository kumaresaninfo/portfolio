const nodemailer = require("nodemailer");

const DEFAULT_EMAIL = "kumaresanpvi23@gmail.com";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").trim();

  return {
    host,
    port,
    secure: String(process.env.SMTP_SECURE || port === 465).toLowerCase() === "true",
    auth: user && pass ? { user, pass } : null,
    from: process.env.SMTP_FROM || `"Portfolio Contact" <${user || DEFAULT_EMAIL}>`,
    to: process.env.CONTACT_TO_EMAIL || DEFAULT_EMAIL,
  };
}

function cleanInput(value = "") {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderResponse(res, statusCode, title, message) {
  res.status(statusCode).setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} | Kumaresan Rajendran</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <main class="form-response">
      <section class="form-response-card">
        <p class="section-kicker">Contact Form</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
        <a class="button primary" href="/index.html#contact">Back to portfolio</a>
      </section>
    </main>
  </body>
</html>`);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    renderResponse(res, 405, "Invalid request", "Please submit the contact form from the portfolio page.");
    return;
  }

  if (req.body?._honey) {
    renderResponse(res, 200, "Message sent", "Thank you. I will review your message and respond soon.");
    return;
  }

  const name = cleanInput(req.body?.name);
  const email = cleanInput(req.body?.email);
  const subject = cleanInput(req.body?.subject);
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !subject || !message) {
    renderResponse(res, 400, "Missing details", "Please complete every field in the contact form.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    renderResponse(res, 400, "Invalid email", "Please enter a valid email address.");
    return;
  }

  const smtp = getSmtpConfig();

  if (!smtp.auth) {
    const missing = [
      !smtp.auth && !process.env.SMTP_USER && !process.env.GMAIL_USER ? "SMTP_USER" : "",
      !smtp.auth && !process.env.SMTP_PASS && !process.env.GMAIL_APP_PASSWORD ? "SMTP_PASS" : "",
    ].filter(Boolean).join(" and ");

    renderResponse(
      res,
      500,
      "Email is not configured",
      `The contact form cannot read ${missing || "SMTP credentials"} in the deployed Vercel environment.`
    );
    return;
  }

  const emailText = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });

  try {
    await transporter.sendMail({
      from: smtp.from,
      to: smtp.to,
      replyTo: email,
      subject: `Portfolio contact: ${subject}`,
      text: emailText,
    });
  } catch (error) {
    console.error("Contact email failed:", error);
    renderResponse(
      res,
      502,
      "Message not sent",
      "The email service could not send the message. Please contact me directly at kumaresanpvi23@gmail.com."
    );
    return;
  }

  renderResponse(res, 200, "Message sent", "Thank you. I will review your message and respond soon.");
};

const nodemailer = require("nodemailer");

const DEFAULT_EMAIL = "kumaresanpvi23@gmail.com";
const DEFAULT_ORIGIN = "https://kumaresan.coderfolio.in";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map();

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

function nl2br(value = "") {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const recentRequests = (requestLog.get(ip) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  recentRequests.push(now);
  requestLog.set(ip, recentRequests);
  return recentRequests.length > RATE_LIMIT_MAX_REQUESTS;
}

function isAllowedRequest(req) {
  const source = req.headers.origin || req.headers.referer;

  if (!source) {
    return process.env.VERCEL_ENV !== "production";
  }

  const allowedOrigins = new Set(
    [DEFAULT_ORIGIN, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "", ...(process.env.ALLOWED_ORIGINS || "").split(",")]
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

  try {
    return allowedOrigins.has(new URL(source).origin);
  } catch {
    return false;
  }
}

function renderResponse(res, statusCode, title, message) {
  res.status(statusCode);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
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

  if (!isAllowedRequest(req)) {
    renderResponse(res, 403, "Request blocked", "This contact request did not originate from the portfolio website.");
    return;
  }

  if (isRateLimited(getClientIp(req))) {
    res.setHeader("Retry-After", String(RATE_LIMIT_WINDOW_MS / 1000));
    renderResponse(res, 429, "Too many requests", "Please wait a few minutes before sending another message.");
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

  if (name.length > 100 || email.length > 254 || subject.length > 160 || message.length > 5000) {
    renderResponse(res, 400, "Message too long", "Please shorten the submitted contact details and try again.");
    return;
  }

  const smtp = getSmtpConfig();

  if (!smtp.auth) {
    const hasUser = Boolean(((process.env.SMTP_USER || process.env.GMAIL_USER || "").trim()));
    const hasPass = Boolean(((process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").trim()));
    const missing = [
      !hasUser ? "SMTP_USER" : "",
      !hasPass ? "SMTP_PASS" : "",
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
    "New portfolio contact form submission",
    "",
    `Sender Name: ${name}`,
    `Sender Email: ${email}`,
    `Inquiry Subject: ${subject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const emailHtml = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7f9;font-family:Arial,Helvetica,sans-serif;color:#121724;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f9;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dde6ed;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:22px 26px;background:#075855;color:#ffffff;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0;text-transform:uppercase;">Portfolio Contact</p>
                <h1 style="margin:0;font-size:22px;line-height:1.3;">New inquiry from ${escapeHtml(name)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 26px;">
                <p style="margin:0 0 18px;color:#647084;font-size:15px;line-height:1.6;">
                  Someone submitted the contact form on your portfolio website. The details are below.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:22px;">
                  <tr>
                    <td style="padding:10px 0;width:130px;color:#647084;font-size:14px;border-bottom:1px solid #eef2f5;">Name</td>
                    <td style="padding:10px 0;color:#121724;font-size:14px;border-bottom:1px solid #eef2f5;font-weight:700;">${escapeHtml(name)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;width:130px;color:#647084;font-size:14px;border-bottom:1px solid #eef2f5;">Email</td>
                    <td style="padding:10px 0;color:#121724;font-size:14px;border-bottom:1px solid #eef2f5;font-weight:700;">
                      <a href="mailto:${escapeHtml(email)}" style="color:#0c7c78;text-decoration:none;">${escapeHtml(email)}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;width:130px;color:#647084;font-size:14px;border-bottom:1px solid #eef2f5;">Subject</td>
                    <td style="padding:10px 0;color:#121724;font-size:14px;border-bottom:1px solid #eef2f5;font-weight:700;">${escapeHtml(subject)}</td>
                  </tr>
                </table>

                <h2 style="margin:0 0 10px;font-size:16px;line-height:1.4;color:#121724;">Message</h2>
                <div style="padding:16px;background:#f9fbfd;border:1px solid #dde6ed;border-radius:8px;color:#121724;font-size:15px;line-height:1.7;">
                  ${nl2br(message)}
                </div>

                <p style="margin:22px 0 0;color:#647084;font-size:13px;line-height:1.5;">
                  You can reply directly to this email to respond to ${escapeHtml(name)}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

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
      html: emailHtml,
    });
  } catch (error) {
    console.error("Contact email failed:", error);
    renderResponse(
      res,
      502,
      "Message not sent",
      `The email service could not send the message. Please contact me directly at ${DEFAULT_EMAIL}.`
    );
    return;
  }

  renderResponse(res, 200, "Message sent", "Thank you. I will review your message and respond soon.");
};

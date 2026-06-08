function hasValue(name) {
  return Boolean((process.env[name] || "").trim());
}

module.exports = function handler(req, res) {
  res.status(200).json({
    SMTP_HOST: hasValue("SMTP_HOST"),
    SMTP_PORT: hasValue("SMTP_PORT"),
    SMTP_SECURE: hasValue("SMTP_SECURE"),
    SMTP_USER: hasValue("SMTP_USER"),
    SMTP_PASS: hasValue("SMTP_PASS"),
    SMTP_FROM: hasValue("SMTP_FROM"),
    CONTACT_TO_EMAIL: hasValue("CONTACT_TO_EMAIL"),
    GMAIL_USER: hasValue("GMAIL_USER"),
    GMAIL_APP_PASSWORD: hasValue("GMAIL_APP_PASSWORD"),
    VERCEL_ENV: process.env.VERCEL_ENV || null,
    VERCEL_URL: process.env.VERCEL_URL || null,
  });
};

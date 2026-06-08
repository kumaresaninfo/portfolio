# Kumaresan Rajendran Portfolio

Static portfolio website for Kumaresan Rajendran, Software Engineering Lead, deployed on Vercel with a serverless Gmail SMTP contact form.

## Files

- `index.html` - Main portfolio page.
- `styles.css` - Layout, responsive styling, and visual design.
- `script.js` - Mobile navigation and dynamic footer year.
- `api/contact.js` - Vercel serverless contact form email handler using Gmail SMTP.
- `package.json` and `package-lock.json` - Node dependency configuration for reproducible Vercel installs.
- `assets/` - Local assets used by the site.
- `robots.txt` and `sitemap.xml` - Search-engine discovery files.
- `vercel.json` - Production security headers.

## Local Preview

Open `index.html` directly in a browser for a static preview. The contact form requires the Vercel function and will not work from a `file://` URL.

To preview the complete site locally:

```bash
npm install
npx vercel dev
```

Copy `.env.example` to `.env.local` and provide local-only SMTP values when testing email delivery. Never commit `.env` or `.env.local`.

## Sections

- Hero and career snapshot
- About
- Skills
- Proficiency
- Work experience
- Projects
- Achievements and certifications
- AI-assisted engineering workflow
- Contact form and direct contact links

## Contact form

The contact form posts to `/api/contact` and sends messages to:

```text
kumaresanpvi23@gmail.com
```

The Vercel function uses SMTP through Nodemailer. Add these environment variables in Vercel Project Settings -> Environment Variables:

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=kumaresanpvi23@gmail.com
SMTP_PASS=your_google_app_password
SMTP_FROM=Portfolio Contact <kumaresanpvi23@gmail.com>
CONTACT_TO_EMAIL=kumaresanpvi23@gmail.com
ALLOWED_ORIGINS=https://kumaresan.coderfolio.in
```

Use a Google App Password, not your normal Gmail password. The Google account usually needs 2-Step Verification enabled before App Passwords are available.

`SMTP_USER` and `SMTP_PASS` are required. The remaining values have Gmail-friendly defaults. `ALLOWED_ORIGINS` accepts a comma-separated list when preview or custom domains also need to submit the form.

The contact endpoint validates the production origin, limits submission length, uses a honeypot, and applies best-effort per-instance rate limiting. For high-volume abuse protection, add a durable rate-limit service or CAPTCHA.

## Deployment

This site is ready for Vercel. The `/api/contact.js` file is deployed as a Vercel serverless function, and Vercel installs `nodemailer` from `package.json`.

After changing Vercel environment variables, redeploy the site so the new function deployment receives them.

## Quality Checks

```bash
npm run check
```

## Profile Data

Contact and profile information is used in `index.html`, `api/contact.js`, `.env.example`, `sitemap.xml`, and this README. Treat the contact section in `index.html` as the source of truth and update the other files in the same change.

## Security

- Keep real credentials only in local ignored env files and Vercel environment variables.
- Rotate any credential that has been committed, shared, or pasted into an untrusted location.
- Never add environment-diagnostic endpoints to production.

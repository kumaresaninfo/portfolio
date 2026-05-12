# Kumaresan Rajendran Portfolio

Static portfolio website for Kumaresan Rajendran, Software Engineering Lead.

## Files

- `index.html` - Main portfolio page.
- `styles.css` - Layout, responsive styling, and visual design.
- `script.js` - Mobile navigation and dynamic footer year.
- `api/contact.js` - Vercel serverless contact form email handler using Gmail SMTP.
- `package.json` - Node dependency configuration for Vercel.
- `assets/` - Local assets used by the site.

## Preview

Open `index.html` directly in a browser to preview the static page:

```text
D:\kumaresan_portfolio\index.html
```

No build step or package install is required.

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

The Vercel function uses SMTP through Nodemailer. For Gmail, add these environment variables in Vercel project settings:

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=kumaresanpvi23@gmail.com
SMTP_PASS=your_google_app_password
SMTP_FROM=Portfolio Contact <kumaresanpvi23@gmail.com>
CONTACT_TO_EMAIL=kumaresanpvi23@gmail.com
```

Use a Google App Password, not your normal Gmail password. The Google account usually needs 2-Step Verification enabled before App Passwords are available.

`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM`, and `CONTACT_TO_EMAIL` have Gmail-friendly defaults. The required values are `SMTP_USER` and `SMTP_PASS`. The function also accepts the older aliases `GMAIL_USER` and `GMAIL_APP_PASSWORD`.

## Deployment

This site is ready for Vercel. The `/api/contact.js` file is deployed as a Vercel serverless function, and Vercel installs `nodemailer` from `package.json`.

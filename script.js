/* ── Footer year ───────────────────────────────────────────── */
const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

/* ── Mobile navigation ──────────────────────────────────────── */
const navToggle = document.querySelector(".nav-toggle");
const navLinks  = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  const closeMenu = () => {
    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

/* ── Contact form — validation + fetch submit + loading state ── */
(function () {
  const form       = document.getElementById("contact-form");
  const submitBtn  = document.getElementById("contact-submit");
  const statusBox  = document.getElementById("form-status");

  if (!form) return;

  /* ---- Validation rules ---- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules = [
    {
      id:      "contact-name",
      errorId: "contact-name-error",
      validate(v) {
        if (!v)         return "Name is required.";
        if (v.length < 2) return "Name must be at least 2 characters.";
        return "";
      },
    },
    {
      id:      "contact-email",
      errorId: "contact-email-error",
      validate(v) {
        if (!v)               return "Email is required.";
        if (!EMAIL_RE.test(v)) return "Please enter a valid email address.";
        return "";
      },
    },
    {
      id:      "contact-subject",
      errorId: "contact-subject-error",
      validate(v) {
        if (!v)           return "Subject is required.";
        if (v.length < 3) return "Subject must be at least 3 characters.";
        return "";
      },
    },
    {
      id:      "contact-message",
      errorId: "contact-message-error",
      validate(v) {
        if (!v)            return "Message is required.";
        if (v.length < 10) return "Message must be at least 10 characters.";
        return "";
      },
    },
  ];

  /* ---- Validate a single field ---- */
  function validateField(rule) {
    const input = document.getElementById(rule.id);
    const error = document.getElementById(rule.errorId);
    if (!input || !error) return true;

    const msg = rule.validate(input.value.trim());
    error.textContent = msg;
    input.classList.toggle("is-invalid", Boolean(msg));
    input.classList.toggle("is-valid",   !msg);
    return !msg;
  }

  /* ---- Live validation: check field on blur ---- */
  rules.forEach((rule) => {
    const input = document.getElementById(rule.id);
    if (input) {
      input.addEventListener("blur",  () => validateField(rule));
      input.addEventListener("input", () => {
        if (input.classList.contains("is-invalid")) validateField(rule);
      });
    }
  });

  /* ---- Status banner helpers ---- */
  function showStatus(type, message) {
    statusBox.textContent = message;
    statusBox.className   = `form-status status-${type}`;
    statusBox.hidden      = false;
    statusBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideStatus() {
    statusBox.hidden    = true;
    statusBox.className = "form-status";
  }

  /* ---- Loading state helpers ---- */
  function setLoading(on) {
    if (on) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      submitBtn.innerHTML =
        '<span class="btn-spinner" aria-hidden="true"></span>Sending…';
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove("is-loading");
      submitBtn.textContent = "Send Message";
    }
  }

  /* ---- Form submit ---- */
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideStatus();

    /* Run all validations */
    const allValid = rules.map(validateField).every(Boolean);
    if (!allValid) {
      /* Focus the first invalid field */
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(form.action, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body:    JSON.stringify({
          _honey:  form._honey?.value  || "",
          name:    document.getElementById("contact-name").value.trim(),
          email:   document.getElementById("contact-email").value.trim(),
          subject: document.getElementById("contact-subject").value.trim(),
          message: document.getElementById("contact-message").value.trim(),
        }),
      });

      if (response.ok) {
        showStatus("success", "✓ Message sent! Thank you — I will get back to you soon.");
        form.reset();
        rules.forEach((rule) => {
          const input = document.getElementById(rule.id);
          if (input) {
            input.classList.remove("is-valid", "is-invalid");
          }
        });
      } else {
        const text = await response.text().catch(() => "");
        const hint = response.status === 429
          ? "Too many requests — please wait a few minutes and try again."
          : response.status === 400
          ? "Please check your details and try again."
          : `Something went wrong (${response.status}). Please email me directly at kumaresanpvi23@gmail.com`;
        showStatus("error", hint);
      }
    } catch {
      showStatus(
        "error",
        "Could not reach the server. Please check your connection or email me at kumaresanpvi23@gmail.com"
      );
    } finally {
      setLoading(false);
    }
  });
}());

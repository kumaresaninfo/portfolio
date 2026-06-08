/* ── Dark mode ─────────────────────────────────────────────── */
(function () {
  const root   = document.documentElement;
  const btn    = document.getElementById("dark-toggle");
  const KEY    = "kr-theme";

  function applyTheme(dark) {
    root.setAttribute("data-theme", dark ? "dark" : "");
    localStorage.setItem(KEY, dark ? "dark" : "light");
  }

  // Restore saved preference or system preference
  const saved  = localStorage.getItem(KEY);
  const prefer = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved ? saved === "dark" : prefer);

  if (btn) {
    btn.addEventListener("click", () => {
      applyTheme(root.getAttribute("data-theme") !== "dark");
    });
  }
}());

/* ── Scroll fade-up (IntersectionObserver) ──────────────────── */
(function () {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".fade-up").forEach(el => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
}());

/* ── Animated stats counter ─────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll(".hero-stats dt[data-count]");
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const duration = 1200;
      const steps    = 40;
      let   current  = 0;
      const increment = target / steps;
      const interval  = duration / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          el.textContent = target + suffix;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current) + suffix;
        }
      }, interval);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}());

/* ── Rotating hero role text ────────────────────────────────── */
(function () {
  const el = document.getElementById("rotating-role");
  if (!el) return;

  const roles = [
    "Laravel Expert",
    "CRM Architect",
    "Engineering Lead",
    "SaaS Builder",
    "API Integrations Lead",
  ];
  let index = 0;

  setInterval(() => {
    el.classList.add("fade-out");
    setTimeout(() => {
      index = (index + 1) % roles.length;
      el.textContent = roles[index];
      el.classList.remove("fade-out");
      el.classList.add("fade-in");
      setTimeout(() => el.classList.remove("fade-in"), 350);
    }, 350);
  }, 2800);
}());

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

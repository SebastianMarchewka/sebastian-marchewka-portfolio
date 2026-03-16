// Smooth scrolling and contact form submission with backend integration
document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling for in-page links
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // Dynamic year in footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Package buttons: preselect Website Design and add package name to message
  const packageButtons = document.querySelectorAll(".package-cta");
  const serviceSelect = document.getElementById("service");
  const messageField = document.getElementById("message");

  packageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const packageName = button.getAttribute("data-package") || "Website Package";

      // Scroll to contact section
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Preselect Website Design and add context to message
      if (serviceSelect) {
        serviceSelect.value = "Website Design";
      }

      if (messageField) {
        const existing = messageField.value.trim();
        const prefix = `I’m interested in the ${packageName}.`;
        if (!existing.toLowerCase().includes(packageName.toLowerCase())) {
          messageField.value = existing ? `${prefix}\n\n${existing}` : prefix;
        }
        messageField.focus();
      }
    });
  });

  // Contact form validation + backend submit
  const form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const phoneInput = document.getElementById("phone");
      const serviceInput = document.getElementById("service");
      const messageInput = document.getElementById("message");
      const statusEl = document.getElementById("form-status");

      const errors = {
        name: "",
        email: "",
        service: "",
        message: ""
      };

      const setError = (fieldId, message) => {
        const inputEl = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}-error`);
        if (inputEl) {
          if (message) {
            inputEl.classList.add("error");
          } else {
            inputEl.classList.remove("error");
          }
        }
        if (errorEl) {
          errorEl.textContent = message;
        }
      };

      const emailIsValid = (email) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email.toLowerCase());
      };

      // Clear previous status
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.classList.remove("success", "error");
      }

      // Front-end validation (mirrors backend)
      if (!nameInput.value.trim()) {
        errors.name = "Please enter your full name.";
      }

      const emailValue = emailInput.value.trim();
      if (!emailValue) {
        errors.email = "Please enter your email address.";
      } else if (!emailIsValid(emailValue)) {
        errors.email = "Please enter a valid email address.";
      }

      if (!serviceInput.value) {
        errors.service = "Please select the type of service you need.";
      }

      const msg = messageInput.value.trim();
      if (!msg) {
        errors.message = "Please provide a short description of your issue or project.";
      } else if (msg.length < 20) {
        errors.message = "Please include a bit more detail so we can respond effectively.";
      }

      setError("name", errors.name);
      setError("email", errors.email);
      setError("service", errors.service);
      setError("message", errors.message);

      const hasErrors = Object.values(errors).some((val) => val);

      if (hasErrors) {
        if (statusEl) {
          statusEl.textContent = "Please fix the highlighted fields and try again.";
          statusEl.classList.add("error");
        }
        return;
      }

      // Build payload for backend
      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        service: serviceInput.value,
        message: messageInput.value.trim()
      };

      // Disable button during submit
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
      }

      if (statusEl) {
        statusEl.textContent = "Sending your request...";
        statusEl.classList.remove("error", "success");
      }

      fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            const errorMessage =
              data && data.error
                ? data.error
                : "Something went wrong sending your request.";
            throw new Error(errorMessage);
          }

          if (statusEl) {
            statusEl.textContent =
              "Thank you. Your request has been sent. We’ll review it and get back to you as soon as possible.";
            statusEl.classList.remove("error");
            statusEl.classList.add("success");
          }

          form.reset();
          ["name", "email", "service", "message"].forEach((fieldId) => {
            setError(fieldId, "");
          });
        })
        .catch((error) => {
          console.error("Contact form error:", error);
          if (statusEl) {
            statusEl.textContent =
              error.message ||
              "Something went wrong sending your request. Please email us directly at info@marchewkatech.com.";
            statusEl.classList.remove("success");
            statusEl.classList.add("error");
          }
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    });
  }
});

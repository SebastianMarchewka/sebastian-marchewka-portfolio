// Smooth scrolling for in-page links (for wider browser support)
document.addEventListener("DOMContentLoaded", function () {
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

  // Contact form validation
  const form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const serviceInput = document.getElementById("service");
      const messageInput = document.getElementById("message");
      const statusEl = document.getElementById("form-status");

      const errors = {
        name: "",
        email: "",
        service: "",
        message: ""
      };

      // Basic helpers
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
        // Simple email validation pattern
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email.toLowerCase());
      };

      // Clear previous status
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.classList.remove("success", "error");
      }

      // Name validation
      if (!nameInput.value.trim()) {
        errors.name = "Please enter your full name.";
      }

      // Email validation
      const emailValue = emailInput.value.trim();
      if (!emailValue) {
        errors.email = "Please enter your email address.";
      } else if (!emailIsValid(emailValue)) {
        errors.email = "Please enter a valid email address.";
      }

      // Service validation
      if (!serviceInput.value) {
        errors.service = "Please select the type of service you need.";
      }

      // Message validation
      const msg = messageInput.value.trim();
      if (!msg) {
        errors.message = "Please provide a short description of your issue or project.";
      } else if (msg.length < 20) {
        errors.message = "Please include a bit more detail so we can respond effectively.";
      }

      // Apply errors
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

      // If everything is valid, simulate successful submission
      if (statusEl) {
        statusEl.textContent =
          "Thank you. Your request has been received. We’ll review it and get back to you as soon as possible.";
        statusEl.classList.add("success");
      }

      // Optionally reset form fields after a brief delay
      setTimeout(() => {
        form.reset();
        ["name", "email", "service", "message"].forEach((fieldId) => {
          setError(fieldId, "");
        });
      }, 1500);
    });
  }
});

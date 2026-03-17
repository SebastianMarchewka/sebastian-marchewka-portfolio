// Smooth scrolling and contact form submission with backend integration
document.addEventListener("DOMContentLoaded", function () {
  // Mobile navigation toggle (hamburger)
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");

  const setNavOpen = (isOpen) => {
    if (!siteHeader || !navToggle) return;
    siteHeader.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  if (navToggle && siteHeader) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteHeader.classList.contains("nav-open");
      setNavOpen(!isOpen);
    });

    // Close menu after clicking any nav link
    if (navList) {
      navList.addEventListener("click", (e) => {
        const target = e.target;
        if (target && target.tagName === "A") {
          setNavOpen(false);
        }
      });
    }

    // Close menu on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });
  }

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

      fetch("https://marchewka-tech.onrender.com", {
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

  // Hardware inventory (renders only if hardware page container exists)
  const hardwareListEl = document.getElementById("hardware-list");
  const availableOnlyEl = document.getElementById("available-only");

  if (hardwareListEl) {
    const hardwareItems = [
      {
        name: "Refurbished Dell OptiPlex Desktop (i5 / 16GB / 512GB SSD)",
        price: 399,
        description: "Great everyday system for office work, email, and browsing. Includes fresh Windows setup and updates.",
        status: "Available"
      },
      {
        name: "Custom Gaming/Creator PC Build (Quote-based)",
        price: null,
        description: "Built to your workload and budget. Parts selection, assembly, setup, and testing included.",
        status: "Available"
      },
      {
        name: "Business Laptop Bundle (Setup Included)",
        price: 899,
        description: "Laptop + initial setup, updates, and basic security configuration. Ideal for small business use.",
        status: "Sold"
      }
    ];

    const renderHardware = () => {
      const availableOnly = availableOnlyEl ? availableOnlyEl.checked : false;
      const filtered = availableOnly
        ? hardwareItems.filter((item) => item.status === "Available")
        : hardwareItems;

      hardwareListEl.innerHTML = filtered
        .map((item) => {
          const priceText = item.price === null ? "Contact for pricing" : `$${item.price.toLocaleString()}`;
          const statusClass = item.status === "Available" ? "status-available" : "status-sold";
          return `
            <article class="hardware-card">
              <div class="hardware-card-top">
                <h3>${item.name}</h3>
                <span class="hardware-status ${statusClass}">${item.status}</span>
              </div>
              <p class="hardware-price"><strong>${priceText}</strong></p>
              <p class="hardware-desc">${item.description}</p>
              <a class="btn btn-small btn-call" href="tel:+16475104302">Call to Purchase</a>
            </article>
          `;
        })
        .join("");

      if (!filtered.length) {
        hardwareListEl.innerHTML = `<p class="hardware-empty">No items found. Please uncheck “Available only” or call for current inventory.</p>`;
      }
    };

    if (availableOnlyEl) {
      availableOnlyEl.addEventListener("change", renderHardware);
    }

    renderHardware();
  }
});

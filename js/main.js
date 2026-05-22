/* ================================================================
   MAIN.JS — RusiTech LLC
   Handles: preloader, nav scroll, mobile menu, scroll reveal,
   stat counters, smooth scroll, form autosave, scroll-to-top
   ================================================================ */


/* ----------------------------------------------------------------
   UTILITY — DOM Selector Helpers
---------------------------------------------------------------- */
const qs  = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];


/* ----------------------------------------------------------------
   1. PRELOADER
   Fades out after page load. Skipped on return visits (same session)
---------------------------------------------------------------- */
(function initPreloader() {
  const preloader = qs('#preloader');
  if (!preloader) return;

  // If already visited this session, hide instantly — no flash
  if (sessionStorage.getItem('rusitech_visited')) {
    preloader.style.display = 'none';
    return;
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      sessionStorage.setItem('rusitech_visited', 'true');
    }, 800);
  });

  // Failsafe — never block longer than 3 seconds
  setTimeout(() => {
    preloader.classList.add('hidden');
    sessionStorage.setItem('rusitech_visited', 'true');
  }, 3000);
})();


/* ----------------------------------------------------------------
   2. NAVIGATION — Scroll State & Header Styling
---------------------------------------------------------------- */
(function initNavScroll() {
  const header = qs('#site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on init in case page loads mid-scroll
})();


/* ----------------------------------------------------------------
   3. MOBILE MENU — Toggle Open / Close
---------------------------------------------------------------- */
(function initMobileMenu() {
  const toggle   = qs('#nav-toggle');
  const menu     = qs('#mobile-menu');
  const header   = qs('#site-header');
  if (!toggle || !menu) return;

  let isOpen = false;

  const openMenu = () => {
    isOpen = true;
    menu.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    header.classList.add('scrolled');
  };

  const closeMenu = () => {
    isOpen = false;
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Only remove scrolled class if user is at top of page
    if (window.scrollY <= 20) {
      header.classList.remove('scrolled');
    }
  };

  // Toggle on hamburger click
  toggle.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a mobile nav link is clicked
  qsa('.mobile-nav-link', menu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on mobile CTA click
  const mobileCta = qs('.mobile-cta', menu);
  if (mobileCta) mobileCta.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });
})();


/* ----------------------------------------------------------------
   4. SCROLL REVEAL — Fade + Slide Elements Into View
---------------------------------------------------------------- */
(function initScrollReveal() {
  const elements = qsa('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // Animate once only
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ----------------------------------------------------------------
   5. STAT COUNTERS — Count Up Animation on Scroll Into View
---------------------------------------------------------------- */
(function initStatCounters() {
  const statNumbers = qsa('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const countUp = (el, target, duration = 2000) => {
    const start     = 0;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * (target - start) + start);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          countUp(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(el => observer.observe(el));
})();


/* ----------------------------------------------------------------
   6. SMOOTH ANCHOR SCROLL — Offset for Fixed Nav
---------------------------------------------------------------- */
(function initSmoothScroll() {
  const navHeight = 72;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = qs(targetId);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top
                + window.scrollY
                - navHeight
                - 24; // Extra breathing room

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();


/* ----------------------------------------------------------------
   7. SCROLL TO TOP BUTTON — Mobile Only
---------------------------------------------------------------- */
(function initScrollToTop() {
  const btn = qs('#scrollTopBtn');
  if (!btn) return;

  const onScroll = () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ----------------------------------------------------------------
   8. FOOTER YEAR — Auto-update Copyright Year
---------------------------------------------------------------- */
(function initFooterYear() {
  const el = qs('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ----------------------------------------------------------------
   9. ACTIVE NAV LINK — Highlight Current Page
---------------------------------------------------------------- */
(function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  qsa('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPage = href.split('/').pop();

    if (linkPage === currentPath) {
      link.classList.add('active');

      // Set aria-current for accessibility
      if (link.classList.contains('nav-link')) {
        link.setAttribute('aria-current', 'page');
      }
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
})();


/* ----------------------------------------------------------------
   10. FORM AUTOSAVE — Save & Restore Contact Form Data
---------------------------------------------------------------- */
(function initFormAutosave() {
  const form = qs('#contact-form');
  if (!form) return;

  const STORAGE_KEY = 'rusitech_contact_draft';
  const indicator   = qs('#autosave-indicator');

  const fields = qsa('input, textarea, select', form).filter(el => {
    // Don't save submit buttons or privacy-sensitive fields
    return el.type !== 'submit' && el.name !== 'phone';
  });

  // Restore saved data
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      let restored = false;

      fields.forEach(field => {
        if (data[field.name] && field.name) {
          field.value = data[field.name];
          restored = true;
        }
      });

      if (restored && indicator) {
        indicator.textContent = '✓ Draft restored';
        indicator.classList.add('restored');
        setTimeout(() => {
          indicator.textContent = '';
          indicator.classList.remove('restored');
        }, 3000);
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Save on input
  let saveTimeout;
  fields.forEach(field => {
    field.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const data = {};
        fields.forEach(f => {
          if (f.name) data[f.name] = f.value;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        if (indicator) {
          indicator.textContent = '✓ Draft saved';
          indicator.classList.add('saved');
          indicator.classList.remove('restored');
          setTimeout(() => {
            indicator.textContent = '';
            indicator.classList.remove('saved');
          }, 2000);
        }
      }, 800);
    });
  });

  // Clear saved data on successful submission
  form.addEventListener('submit', () => {
    localStorage.removeItem(STORAGE_KEY);
  });
})();


/* ----------------------------------------------------------------
   11. CONTACT FORM — Submission Handler (Frontend Only)
   Note: Wire up to a backend or Formspree for real submissions
---------------------------------------------------------------- */
(function initContactForm() {
  const form        = qs('#contact-form');
  const successMsg  = qs('#form-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = qs('[type="submit"]', form);

    // Basic validation
    const required = qsa('[required]', form);
    let valid = true;

    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#c0392b';
        valid = false;
      }
    });

    if (!valid) return;

    // Simulate submission loading state
    if (submitBtn) {
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
    }

    // Simulate async send — replace with real fetch() to your backend
    setTimeout(() => {
      form.style.display = 'none';
      if (successMsg) {
        successMsg.classList.add('visible');
      }
      localStorage.removeItem('rusitech_contact_draft');
    }, 1200);
  });
})();


/* ----------------------------------------------------------------
   12. BROWSER BACK/FORWARD CACHE — Force Reload on bfcache
---------------------------------------------------------------- */
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    window.location.reload();
  }
});


/* ----------------------------------------------------------------
   13. TAP FEEDBACK — Enhanced Mobile Touch Response
---------------------------------------------------------------- */
(function initTapFeedback() {
  document.documentElement.style.setProperty(
    '-webkit-tap-highlight-color',
    'rgba(26, 58, 92, 0.08)'
  );
})();









/* ----------------------------------------------------------------
   CONTACT FORM — Multi-Step Logic
   Handles step navigation, validation, card selection,
   progress bar updates, and Netlify submission
---------------------------------------------------------------- */
(function initMultiStepForm() {
  const form       = document.getElementById('contact-form');
  const successBox = document.getElementById('form-success');
  if (!form) return;

  /* ── State ── */
  let currentStep     = 1;
  const totalSteps    = 3;
  let selectedInquiry = '';

  const inquiryLabels = {
    'rd-assessment':          'R&D Organization Assessment',
    'program-management':     'Program Management & Execution',
    'hvacr-development':      'HVACR Product Development',
    'portfolio-optimization': 'Portfolio Optimization',
    'technical-training':     'Technical Training',
    'general-inquiry':        'General Inquiry'
  };

  /* ── Helpers ── */
  const getStep    = (n) => document.getElementById('step-' + n);
  const getError   = (n) => document.getElementById('step' + n + '-error');
  const showError  = (n, msg) => { getError(n).textContent = msg; };
  const clearError = (n) => { getError(n).textContent = ''; };

  /* ── Progress Bar Update ── */
  function updateProgress(step) {
    document.querySelectorAll('.progress-step').forEach((el, i) => {
      const stepNum = i + 1;
      el.classList.remove('active', 'completed');
      if (stepNum === step) el.classList.add('active');
      if (stepNum < step)   el.classList.add('completed');
    });

    document.querySelectorAll('.progress-step-line').forEach((line, i) => {
      line.classList.toggle('active', i < step - 1);
    });

    const progress = document.querySelector('.form-progress');
    if (progress) progress.setAttribute('aria-valuenow', step);
  }

  /* ── Navigate to Step ── */
  function goToStep(n) {
    const current = getStep(currentStep);
    const next    = getStep(n);
    if (!current || !next) return;

    current.hidden = true;
    next.hidden    = false;
    currentStep    = n;

    updateProgress(n);

    if (n === 3) {
      const reviewType = document.getElementById('review-type');
      if (reviewType) {
        reviewType.textContent = inquiryLabels[selectedInquiry] || 'General Inquiry';
      }
    }

    form.closest('.contact-right').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Validate Step ── */
  function validateStep(step) {
    clearError(step);

    if (step === 1) {
      if (!selectedInquiry) {
        showError(1, 'Please select an inquiry type to continue.');
        return false;
      }
      document.getElementById('hidden-inquiry-type').value = selectedInquiry;
      return true;
    }

    if (step === 2) {
      const first   = form.querySelector('#first-name');
      const last    = form.querySelector('#last-name');
      const email   = form.querySelector('#email');
      const company = form.querySelector('#company');

      if (!first.value.trim())   { showError(2, 'Please enter your first name.'); first.focus(); return false; }
      if (!last.value.trim())    { showError(2, 'Please enter your last name.'); last.focus(); return false; }
      if (!email.value.trim() || !email.value.includes('@')) {
        showError(2, 'Please enter a valid email address.'); email.focus(); return false;
      }
      if (!company.value.trim()) { showError(2, 'Please enter your company name.'); company.focus(); return false; }
      return true;
    }

    if (step === 3) {
      const message = form.querySelector('#message');
      if (!message.value.trim()) {
        showError(3, 'Please describe your situation so Giorgio can prepare for your conversation.');
        message.focus();
        return false;
      }
      return true;
    }

    return true;
  }

  /* ── Inquiry Card Selection ── */
  document.querySelectorAll('.inquiry-card').forEach(card => {
    const select = () => {
      document.querySelectorAll('.inquiry-card').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
      selectedInquiry = card.dataset.value;
      card.querySelector('input[type="radio"]').checked = true;
      clearError(1);
    };

    card.addEventListener('click', select);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select();
      }
    });
  });

  /* ── Next Buttons ── */
  document.querySelectorAll('.step-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.dataset.next, 10);
      if (validateStep(currentStep)) goToStep(next);
    });
  });

  /* ── Back Buttons ── */
  document.querySelectorAll('.step-back').forEach(btn => {
    btn.addEventListener('click', () => {
      const back = parseInt(btn.dataset.back, 10);
      clearError(currentStep);
      goToStep(back);
    });
  });

  /* ── Form Submission — Netlify ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    const submitBtn = form.querySelector('.form-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
    }

    const data = new FormData(form);

    fetch('/contact.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString()
    })
    .then(() => {
      // Hide progress bar and form entirely
      const progressBar = document.querySelector('.form-progress');
      if (progressBar) progressBar.style.display = 'none';
      form.style.display = 'none';

      // Show success in place inside the same card
      if (successBox) {
        successBox.removeAttribute('hidden');
        successBox.style.display = 'flex';
      }

      // Scroll the card into view — not the page
      const contactRight = document.querySelector('.contact-right');
      if (contactRight) {
        contactRight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      localStorage.removeItem('rusitech_contact_draft');
    })
    .catch(() => {
      showError(3, 'Something went wrong. Please email rusitech@grusignuolo.com directly.');
      if (submitBtn) {
        submitBtn.textContent = 'Send Inquiry';
        submitBtn.disabled = false;
      }
    });
  });

  // Init progress on load
  updateProgress(1);

})();



/* ----------------------------------------------------------------
   HERO GRID — Force animation restart on return visits
   Fixes: grid animation not playing when preloader is skipped
---------------------------------------------------------------- */
(function initHeroGrid() {
  const grid = document.querySelector('.hero-grid-lines');
  if (!grid) return;

  /* Force browser to restart the animation */
  grid.style.animationName = 'none';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      grid.style.animationName = '';
    });
  });
})();
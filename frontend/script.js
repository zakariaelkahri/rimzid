const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const formatCounterValue = (element, value) => {
  const mode = element.getAttribute('data-counter-format') || 'number';
  if (mode === 'compact') {
    const compactValue = value / 1000000;
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(compactValue);
    return `${formatted}M`;
  }

  const decimals = Number(element.getAttribute('data-counter-decimals') || 0);
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const animateCounter = (element) => {
  const target = Number(element.getAttribute('data-counter')) || 0;
  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    element.textContent = formatCounterValue(element, value);
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const counters = document.querySelectorAll('[data-counter]');
if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach((el) => {
    const target = Number(el.getAttribute('data-counter')) || 0;
    el.textContent = formatCounterValue(el, target);
  });
}

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      // collect visible entries and sort by vertical position for a pleasing stagger
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      visible.forEach((entry, i) => {
        const el = entry.target;
        // apply a small stagger based on order
        el.style.transitionDelay = `${i * 70}ms`;
        el.classList.add('is-visible');
        // clean up the inline delay after the transition so future reveals aren't affected
        setTimeout(() => {
          el.style.transitionDelay = '';
        }, 900 + i * 70);
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  // Fallback: reveal all immediately
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

// Parallax for hero background shapes (subtle)
(() => {
  const shapes = document.querySelectorAll('.hero-bg-shape');
  if (!shapes.length) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sc = window.scrollY;
      shapes.forEach((s, idx) => {
        const depth = (idx + 1) * 0.08; // different depths for variety
        s.style.transform = `translateY(${sc * depth}px)`;
      });
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = 'Demande envoyee';
      submitButton.setAttribute('disabled', 'true');
    }

    setTimeout(() => {
      contactForm.reset();
      if (submitButton) {
        submitButton.textContent = 'Envoyer ma demande';
        submitButton.removeAttribute('disabled');
      }
    }, 1700);
  });
}

// Hero slides: try to load higher-resolution images when available (@2x or -large), fallback to original
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.bg-slides span');
  if (!slides.length) return;

  const wantHiDPI = window.devicePixelRatio && window.devicePixelRatio > 1.25;
  const wantLarge = window.innerWidth >= 1400;

  slides.forEach((span) => {
    const src = span.dataset.src || span.getAttribute('data-src') || span.style.backgroundImage.replace(/url\(['"]?|['"]?\)$/g, '');
    if (!src) return;

    const m = src.match(/(\.[a-z0-9]+)$/i);
    const ext = m ? m[1] : '';
    const base = ext ? src.slice(0, -ext.length) : src;

    const candidates = [];
    if (wantHiDPI) candidates.push(`${base}@2x${ext}`);
    if (wantLarge) candidates.push(`${base}-large${ext}`);
    candidates.push(src);

    (function tryNext(i) {
      if (i >= candidates.length) return;
      const img = new Image();
      img.onload = () => {
        span.style.backgroundImage = `url('${candidates[i]}')`;
      };
      img.onerror = () => tryNext(i + 1);
      img.src = candidates[i];
    })(0);
  });
});

const tiltCards = document.querySelectorAll('.tilt-card[data-tilt]');
if (tiltCards.length && window.matchMedia('(hover: hover)').matches) {
  tiltCards.forEach((card) => {
    const resetTilt = () => {
      card.style.setProperty('--tilt-rotate-x', '0deg');
      card.style.setProperty('--tilt-rotate-y', '0deg');
    };

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-rotate-y', `${offsetX * 10}deg`);
      card.style.setProperty('--tilt-rotate-x', `${-offsetY * 10}deg`);
    });

    card.addEventListener('pointerleave', resetTilt);
    card.addEventListener('pointercancel', resetTilt);
  });
}

const magneticTargets = document.querySelectorAll('.magnetic');
if (magneticTargets.length && window.matchMedia('(hover: hover)').matches) {
  magneticTargets.forEach((element) => {
    const reset = () => {
      element.style.transform = '';
    };

    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.transform = `translate3d(${offsetX * 10}px, ${offsetY * 8}px, 0) scale(1.03)`;
    });

    element.addEventListener('pointerleave', reset);
    element.addEventListener('pointercancel', reset);
  });
}

const parallaxTargets = document.querySelectorAll('.about-parallax');
if (parallaxTargets.length) {
  let parallaxTicking = false;
  const updateParallax = () => {
    const scrollY = window.scrollY;
    parallaxTargets.forEach((element, index) => {
      const depth = 0.04 + index * 0.03;
      element.style.transform = `translate3d(0, ${scrollY * depth}px, 0) scale(1.06)`;
    });
    parallaxTicking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(updateParallax);
    },
    { passive: true }
  );

  updateParallax();
}

const footerForms = document.querySelectorAll('.footer-form');
footerForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const status = form.querySelector('.newsletter-status');
    if (status) {
      status.textContent = 'Merci. Nous revenons vers vous rapidement.';
    }

    form.reset();
  });
});

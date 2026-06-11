import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import "./react-fixes.css";

const image = (name) => `/pics/${name}`;

function Link({ to, children, className, ariaLabel, onNavigate }) {
  const handleClick = (event) => {
    if (to.startsWith("http")) return;
    event.preventDefault();
    onNavigate(to);
  };

  return (
    <a className={className} href={to} aria-label={ariaLabel} onClick={handleClick}>
      {children}
    </a>
  );
}

function useSiteEffects(path) {
  useEffect(() => {
    const formatCounterValue = (element, value) => {
      const mode = element.getAttribute("data-counter-format") || "number";
      if (mode === "compact") {
        const compactValue = value / 1000000;
        const formatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(compactValue);
        return `${formatted}M`;
      }

      const decimals = Number(element.getAttribute("data-counter-decimals") || 0);
      return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    };

    const animateCounter = (element) => {
      const target = Number(element.getAttribute("data-counter")) || 0;
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = formatCounterValue(element, target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const counters = document.querySelectorAll("[data-counter]");
    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.45 },
      );
      counters.forEach((counter) => counterObserver.observe(counter));
      return () => counterObserver.disconnect();
    }

    counters.forEach((counter) => {
      const target = Number(counter.getAttribute("data-counter")) || 0;
      counter.textContent = formatCounterValue(counter, target);
    });
  }, [path]);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          visible.forEach((entry, index) => {
            const element = entry.target;
            element.style.transitionDelay = `${index * 70}ms`;
            element.classList.add("is-visible");
            window.setTimeout(() => {
              element.style.transitionDelay = "";
            }, 900 + index * 70);
          });
        },
        { threshold: 0.12 },
      );
      revealElements.forEach((element) => revealObserver.observe(element));
      return () => revealObserver.disconnect();
    }

    revealElements.forEach((element) => element.classList.add("is-visible"));
  }, [path]);

  useEffect(() => {
    const shapes = document.querySelectorAll(".hero-bg-shape");
    const parallaxTargets = document.querySelectorAll(".about-parallax");
    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      shapes.forEach((shape, index) => {
        shape.style.transform = `translateY(${scrollY * ((index + 1) * 0.08)}px)`;
      });
      parallaxTargets.forEach((element, index) => {
        const depth = 0.04 + index * 0.03;
        element.style.transform = `translate3d(0, ${scrollY * depth}px, 0) scale(1.06)`;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return undefined;

    const tiltCards = document.querySelectorAll(".tilt-card[data-tilt]");
    const cleanup = [];

    tiltCards.forEach((card) => {
      const resetTilt = () => {
        card.style.setProperty("--tilt-rotate-x", "0deg");
        card.style.setProperty("--tilt-rotate-y", "0deg");
      };
      const move = (event) => {
        const rect = card.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
        const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-rotate-y", `${offsetX * 10}deg`);
        card.style.setProperty("--tilt-rotate-x", `${-offsetY * 10}deg`);
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", resetTilt);
      card.addEventListener("pointercancel", resetTilt);
      cleanup.push(() => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", resetTilt);
        card.removeEventListener("pointercancel", resetTilt);
      });
    });

    const magneticTargets = document.querySelectorAll(".magnetic");
    magneticTargets.forEach((element) => {
      const reset = () => {
        element.style.transform = "";
      };
      const move = (event) => {
        const rect = element.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
        const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.transform = `translate3d(${offsetX * 10}px, ${offsetY * 8}px, 0) scale(1.03)`;
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", reset);
      element.addEventListener("pointercancel", reset);
      cleanup.push(() => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", reset);
        element.removeEventListener("pointercancel", reset);
      });
    });

    return () => cleanup.forEach((fn) => fn());
  }, [path]);
}

function Header({ page, navigate }) {
  const [open, setOpen] = useState(false);

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      <div className="top-strip">
        <p>Service 24/7: +212 5 39 93 22 75</p>
        <Link to={page === "home" ? "#contact" : "/#contact"} onNavigate={go}>
          Urgence maintenance
        </Link>
      </div>
      <header className="site-header" id="top">
        <div className="container nav-wrap">
          <Link className="brand" to="/" ariaLabel="Accueil RIMZID" onNavigate={go}>
            <img className="brand-logo" src={image("logo.png")} alt="RIMZID logo" />
          </Link>
          <button
            className="menu-toggle"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
          <nav className={`site-nav ${open ? "is-open" : ""}`} aria-label="Navigation principale">
            <Link to="/" onNavigate={go}>
              Accueil
            </Link>
            <Link to="/about" onNavigate={go}>
              À propos
            </Link>
            <Link to={page === "home" ? "#services" : "/#services"} onNavigate={go}>
              Services
            </Link>
            <Link to={page === "home" ? "#contact" : "/#contact"} onNavigate={go}>
              Contact
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

function Footer({ variant, navigate }) {
  const isAbout = variant === "about";

  const submitFooter = (event) => {
    event.preventDefault();
    event.currentTarget.reset();
  };

  if (isAbout) {
    return (
      <footer className="site-footer about-footer" id="contact">
        <div className="container footer-grid about-footer-grid">
          <div>
            <Link className="brand about-brand" to="/" ariaLabel="Accueil RIMZID" onNavigate={navigate}>
              <img className="brand-logo about-brand-logo" src={image("logo.png")} alt="RIMZID Ascenseur" />
            </Link>
            <p>
              Spécialisée dans la création, l'installation et la maintenance d'ascenseurs collectifs et privatifs avec une
              exigence premium sur la sécurité et l'expérience client.
            </p>
            <div className="footer-social about-socials">
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-link">
                in
              </a>
            </div>
          </div>
          <FooterLinks links={[["#mission", "Vision"], ["#metrics", "Chiffres"], ["#safety", "Sécurité"], ["#showcase", "Projets"]]} navigate={navigate} />
          <div>
            <h3>Contact express</h3>
            <p>Écrivez-nous, nous répondons rapidement avec une lecture claire de votre besoin.</p>
            <form className="footer-form" aria-label="Formulaire rapide" onSubmit={submitFooter}>
              <label className="footer-field">
                <input type="text" name="name" placeholder=" " autoComplete="name" />
                <span>Nom complet</span>
              </label>
              <label className="footer-field">
                <input type="email" name="email" placeholder=" " autoComplete="email" required />
                <span>Email professionnel</span>
              </label>
              <button className="btn btn-solid magnetic footer-submit" type="submit">
                Recevoir un retour
              </button>
            </form>
          </div>
          <div>
            <h3>Coordonnées</h3>
            <p>16 Rue Abdelaziz Taalabi, Fès</p>
            <p>+212 5 39 93 22 75</p>
            <p>serviceclient@rimzid.com</p>
            <p>Suivi commercial et technique du lundi au samedi.</p>
          </div>
        </div>
        <p className="copyright">Copyright © 2026 | Tous droits réservés. Conception et développement par DIGITAL CONCEP</p>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand" to="/" ariaLabel="Accueil RIMZID" onNavigate={navigate}>
            <img className="brand-logo2" src={image("logo.png")} alt="RIMZID logo" />
          </Link>
          <p>Spécialisée dans la création, l'installation et la maintenance d'ascenseurs collectifs et privatifs.</p>
          <div className="footer-social">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-link">
              in
            </a>
          </div>
        </div>
        <FooterLinks
          links={[["/", "Accueil"], ["/about", "À propos"], ["#services", "Services"], ["#contact", "Contact"], ["#projects", "Projets"]]}
          navigate={navigate}
        />
        <div>
          <h3>Abonnez-vous maintenant</h3>
          <p>Ne manquez pas nos futures mises à jour, abonnez-vous aujourd'hui.</p>
          <form className="footer-subscribe" aria-label="S'abonner par email" onSubmit={submitFooter}>
            <label className="sr-only">Email</label>
            <input type="email" name="subscribe_email" placeholder="Votre email" required />
            <button className="btn btn-solid" type="submit">
              S'abonner
            </button>
          </form>
        </div>
        <div>
          <h3>Contact</h3>
          <p>16 Rue Abdelaziz Taalabi, Fès</p>
          <p>+212 5 39 93 22 75</p>
          <p>service@rimzid.com</p>
          <div className="footer-map">
            <iframe src="https://www.google.com/maps?q=16+Rue+Abdelaziz+Taalabi+Fes&output=embed" aria-label="Carte RIMZID" loading="lazy"></iframe>
          </div>
        </div>
      </div>
      <p className="copyright">Copyright © 2026 | Tous droits réservés. Conception et développement par DIGITAL CONCEP</p>
    </footer>
  );
}

function FooterLinks({ links, navigate }) {
  return (
    <div>
      <h3>Navigation</h3>
      {links.map(([href, label]) => (
        <Link key={href} to={href} onNavigate={navigate}>
          {label}
        </Link>
      ))}
    </div>
  );
}

function HomePage({ navigate }) {
  const stats = [
    ["199", "Projets finalisés"],
    ["25", "Années d'expertise"],
    ["400", "Ascenseurs installés"],
    ["2400000", "Passagers / jour"],
  ];
  const services = [
    ["Installation sur mesure", "Étude de flux, intégration architecturale et mise en service complète avec formation de vos équipes.", "Lancer ce projet"],
    ["Maintenance proactive", "Visites planifiées, diagnostic prédictif et astreinte technique pour minimiser les arrêts non planifiés.", "Plan de maintenance"],
    ["Modernisation intelligente", "Mise à niveau mécanique, cabine, sécurité et commande pour augmenter la fiabilité et la valeur de vos actifs.", "Démarrer un audit"],
  ];
  const projects = [
    ["Hôtel 5 étoiles", "Remplacement complet de groupe de traction", "Disponibilité passée de 91% à 99.2% en 6 semaines."],
    ["Résidence premium", "Modernisation cabine + commande", "Temps d'attente moyen réduit de 37% aux heures de pointe."],
    ["Centre médical", "Plan de maintenance haute disponibilité", "Zéro interruption critique en 12 mois d'exploitation."],
  ];

  return (
    <>
      <Header page="home" navigate={navigate} />
      <main>
        <section className="hero">
          <div className="bg-slides" aria-hidden="true">
            {["hero1.jpg", "hero2.jpg", "hero3.jpg"].map((name) => (
              <span key={name} style={{ backgroundImage: `url("${image(name)}")` }} />
            ))}
          </div>
          <div className="hero-bg-shape hero-bg-shape-a" />
          <div className="hero-bg-shape hero-bg-shape-b" />
          <div className="container hero-grid">
            <div className="hero-copy reveal">
              <p className="eyebrow">Installation | Modernisation | Maintenance</p>
              <h1>Ascenseurs fiables, service réactif.</h1>
              <p>Solutions sûres et maintenance 24/7 pour copropriétés et entreprises.</p>
              <div className="hero-cta">
                <Link className="btn btn-solid" to="#contact" onNavigate={navigate}>
                  Obtenir un devis
                </Link>
              </div>
            </div>
            <aside className="hero-panel reveal">
              <h2>Performance terrain</h2>
              <div className="stats-grid">
                {stats.map(([value, label]) => (
                  <article key={label}>
                    <p className="stat-value" data-counter={value}>
                      0
                    </p>
                    <p className="stat-label">{label}</p>
                  </article>
                ))}
              </div>
              <div className="panel-note">
                <p>Audit technique gratuit pour tout projet de modernisation avant le 31 juillet.</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="trust-bar container reveal">
          <p>Ils nous font confiance:</p>
          <div className="trust-items">
            {["Hôtels", "Hôpitaux", "Centres Commerciaux", "Syndics", "Industries"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="section container" id="services">
          <SectionHead eyebrow="Nos expertises" title="Des services pensés pour le cycle complet de votre ascenseur" />
          <div className="cards-3">
            {services.map(([title, text, cta]) => (
              <article className="service-card reveal" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link to="#contact" onNavigate={navigate}>
                  {cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-accent" id="process">
          <div className="container">
            <SectionHead eyebrow="Expérience client" title="Un process clair, de la première visite à la maintenance continue" />
            <div className="timeline">
              {[
                ["01", "Audit & chiffrage", "Visite site, analyse des contraintes et proposition détaillée sous 48h."],
                ["02", "Exécution maîtrisée", "Planning transparent, coordination chantier et contrôle qualité à chaque étape."],
                ["03", "Suivi long terme", "Contrat adapté, rapports mensuels et hotline technique pour vos équipes."],
              ].map(([number, title, text]) => (
                <article className="timeline-item reveal" key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section container" id="projects">
          <SectionHead eyebrow="Projets récents" title="Des interventions qui réduisent les pannes et améliorent le confort usager" />
          <div className="project-grid">
            {projects.map(([tag, title, text]) => (
              <article className="project-card reveal" key={title}>
                <p className="project-tag">{tag}</p>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <HomeGallery />
        <HomeFaq />
        <ContactSection />
      </main>
      <Footer navigate={navigate} />
      <Link className="floating-cta" to="#contact" ariaLabel="Demander un devis rapide" onNavigate={navigate}>
        Devis rapide
      </Link>
    </>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div className="section-head reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}

function HomeGallery() {
  return (
    <section className="section container gallery-section" id="gallery">
      <SectionHead eyebrow="Explication visuelle" title="Avant, pendant, après: nos interventions en images" />
      <div className="gallery-grid">
        <figure className="gallery-item gallery-item-large reveal">
          <div className="image-slot" role="img" aria-label="Espace image principale intervention">
            <img className="gallery-photo" src={image("copy3.jpg")} alt="Intervention de maintenance sur site" />
          </div>
          <figcaption>
            <h3>Phase d'intervention terrain</h3>
            <p>Contrôle des organes critiques et calibration de sécurité.</p>
          </figcaption>
        </figure>
        <article className="gallery-note reveal">
          <h3>Pourquoi cette phase est critique ?</h3>
          <p>
            Une inspection détaillée permet d'identifier les points de friction, d'éviter les pannes répétitives et
            d'allonger la durée de vie de l'installation.
          </p>
          <ul>
            <li>Vérification mécanique et électronique</li>
            <li>Mesure de performance cabine</li>
            <li>Mise en conformité sécurité usagers</li>
          </ul>
        </article>
        <figure className="gallery-item reveal">
          <div className="image-slot" role="img" aria-label="Espace image cabine modernisée">
            <img className="gallery-photo" src={image("copy2.webp")} alt="Cabine d'ascenseur modernisée" />
          </div>
          <figcaption>Cabine modernisée et expérience usager améliorée</figcaption>
        </figure>
        <figure className="gallery-item reveal">
          <div className="image-slot" role="img" aria-label="Espace image équipe maintenance">
            <img className="gallery-photo" src={image("copy1.webp")} alt="Équipe de maintenance en intervention" />
          </div>
          <figcaption>Maintenance préventive pour éviter les arrêts critiques</figcaption>
        </figure>
      </div>
    </section>
  );
}

function HomeFaq() {
  return (
    <section className="section container" id="faq">
      <SectionHead eyebrow="FAQ" title="Questions fréquentes" />
      <div className="faq-list reveal">
        {[
          ["Quel délai pour installer un nouvel ascenseur ?", "Selon le bâtiment et la configuration, le délai moyen varie de 8 à 16 semaines."],
          [
            "À quelle fréquence faut-il planifier la maintenance ?",
            "Nous recommandons un rythme mensuel ou bimensuel selon l'usage et les obligations réglementaires locales.",
          ],
          [
            "Pouvez-vous moderniser sans remplacer toute l'installation ?",
            "Oui. Nous pouvons cibler la commande, la cabine, les portes ou les composants critiques pour un budget mieux maîtrisé.",
          ],
        ].map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    setError("");
    setSent(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Impossible d'envoyer la demande.");
      }

      setSent(true);
      form.reset();
      window.setTimeout(() => {
        setSent(false);
      }, 2200);
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <section className="section contact-section" id="contact">
      <div className="container contact-grid">
        <div className="contact-copy reveal contact-panel">
          <p className="eyebrow">Parlons de votre projet</p>
          <h2>Contact avec nos professionnels</h2>
          <p>Pour plus d'informations, veuillez contacter votre bureau local pendant les heures normales d'ouverture.</p>
        </div>
        <form className="contact-form reveal" aria-label="Formulaire de contact" onSubmit={submit}>
          <input type="text" name="name" placeholder="Nom / Prénom - Société" aria-label="Nom et société" required />
          <input type="email" name="email" placeholder="E-mail" aria-label="Email" required />
          <input type="text" name="subject" placeholder="Sujet" aria-label="Sujet" />
          <textarea name="message" rows="6" placeholder="Message" aria-label="Message" required />
          {error && <p className="form-status form-status-error">{error}</p>}
          {sent && <p className="form-status form-status-success">Demande envoyée</p>}
          <button className="btn btn-solid contact-submit" type="submit" disabled={sent}>
            {sent ? "Demande envoyée" : "Envoyer"}
          </button>
        </form>
      </div>
    </section>
  );
}

function AboutPage({ navigate }) {
  const metrics = [
    ["+", "199", "", "Projets terminés avec succès"],
    ["+", "2400000", "compact", "Millions de passagers transportés par jour"],
    ["", "400", "", "Ascenseurs installés"],
    ["+", "15", "", "Années d'expérience avec fierté"],
  ];

  return (
    <>
      <Header page="about" navigate={navigate} />
      <main className="about-main">
        <section className="about-hero">
          <div className="about-hero__gridlines" aria-hidden="true" />
          <div className="about-hero__glow about-hero__glow--left" aria-hidden="true" />
          <div className="about-hero__glow about-hero__glow--right" aria-hidden="true" />
          <div className="container about-hero__inner">
            <div className="about-hero__copy reveal">
              <p className="eyebrow about-eyebrow">À propos de nous</p>
              <h1>À PROPOS DE NOUS</h1>
              <p className="about-hero__subtitle">RIMZID Ascenseur: L'innovation en mouvement, la confiance en hauteur.</p>
              <p className="about-hero__body">
                Nous concevons, installons et entretenons des ascenseurs comme on construit une architecture durable:
                avec précision, discipline, vitesse d'exécution et exigence absolue sur la sécurité.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-solid magnetic" to="#mission" onNavigate={navigate}>
                  Découvrir notre approche
                </Link>
                <Link className="btn btn-ghost magnetic" to="#showcase" onNavigate={navigate}>
                  Voir les réalisations
                </Link>
              </div>
            </div>
            <AboutHeroPanel />
          </div>
          <div className="scroll-indicator" aria-hidden="true">
            <span className="scroll-indicator__line" />
            <span className="scroll-indicator__dot" />
            <span className="scroll-indicator__text">Scroll</span>
          </div>
        </section>

        <AboutMission />
        <section className="metrics-band" id="metrics">
          <div className="container metrics-grid">
            {metrics.map(([prefix, value, format, label], index) => (
              <article className="metric-card reveal" style={{ "--stagger": `${index * 120}ms` }} key={label}>
                <p className="metric-value">
                  {prefix && <span className="metric-prefix">{prefix}</span>}
                  <span data-counter={value} data-counter-format={format || undefined}>
                    0
                  </span>
                </p>
                <p className="metric-label">{label}</p>
              </article>
            ))}
          </div>
        </section>
        <AboutSafety />
        <AboutShowcase />
      </main>
      <Footer variant="about" navigate={navigate} />
    </>
  );
}

function AboutHeroPanel() {
  return (
    <aside className="about-hero__panel reveal">
      <div className="about-hero__image-frame about-parallax-shell clip-reveal">
        <img className="about-hero__image about-parallax" src={image("hero2.jpg")} alt="Architecture verticale moderne" />
        <div className="about-hero__badge">
          <span>Vertical engineering</span>
          <strong>Precision in motion</strong>
        </div>
      </div>
      <div className="about-hero__stack">
        {[
          ["Sécurité active", "Normes, contrôle, fiabilité"],
          ["Support continu", "24h/24 et 7j/7 sur site"],
          ["Équipes terrain", "Réactivité et précision"],
        ].map(([label, text]) => (
          <article className="glass-card mini-stat tilt-card" data-tilt key={label}>
            <span className="mini-stat__label">{label}</span>
            <strong>{text}</strong>
          </article>
        ))}
      </div>
    </aside>
  );
}

function AboutMission() {
  const pillars = [
    ["Des installations conformes", "Des systèmes réglés pour la sécurité, la conformité et la maîtrise technique la plus stricte."],
    ["Service client 24h/24 et 7j/7", "Un support réactif qui suit vos urgences avec une culture d'engagement terrain."],
    ["Solutions durables", "Des architectures sobres et évolutives, pensées pour durer et consommer moins."],
  ];

  return (
    <section className="section about-narrative" id="mission">
      <div className="container about-split">
        <div className="about-story reveal">
          <p className="eyebrow about-eyebrow">The Kinetic Pitch</p>
          <h2>Une culture d'ingénierie qui transforme chaque trajet vertical en expérience fluide.</h2>
          <p>
            Notre mission est claire: livrer des installations conformes, élégantes et durables, tout en assurant un
            service après-vente humain, rapide et rigoureux.
          </p>
          <p>
            De la conception à la maintenance, chaque détail est orchestré pour réduire les arrêts, optimiser la
            performance et préserver la valeur de vos actifs sur le long terme.
          </p>
        </div>
        <div className="pillar-stack">
          {pillars.map(([title, text]) => (
            <article className="pillar-card glass-card tilt-card reveal" data-tilt key={title}>
              <div className="pillar-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 20h12" />
                  <path d="M8 20V4h8v16" />
                  <path d="M10 8h4" />
                  <path d="M10 12h4" />
                </svg>
              </div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSafety() {
  return (
    <section className="section safety-section" id="safety">
      <div className="container safety-grid">
        <div className="safety-copy reveal">
          <p className="eyebrow about-eyebrow">Safety First</p>
          <h2>Notre priorité: votre sécurité et votre satisfaction.</h2>
          <p>
            Nous bâtissons des environnements de circulation verticale où la tranquillité des usagers est le résultat
            d'une discipline technique constante.
          </p>
          <p>
            Le suivi est continu, la communication est claire, et les décisions sont guidées par les faits de terrain
            plutôt que par les approximations.
          </p>
        </div>
        <div className="safety-media reveal clip-reveal">
          <div className="safety-media__inner about-parallax-shell">
            <img className="safety-media__image about-parallax" src={image("copy3.jpg")} alt="Installation d'ascenseur sur chantier" />
            <div className="safety-media__overlay">
              <span>Architectural safety</span>
              <strong>Inspection, conformité, continuité</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutShowcase() {
  const items = [
    ["showcase-card--wide", "hero1.jpg", "Installation", "Lecture architecturale des flux verticaux"],
    ["showcase-card--tall", "copy1.webp", "Maintenance", "Intervention rapide et coordination terrain"],
    ["showcase-card--medium", "copy2.webp", "Modernisation", "Mise à niveau précise des composants clés"],
    ["showcase-card--medium", "hero3.jpg", "Technique", "Alignement, contrôle et exécution propre"],
    ["showcase-card--wide", "hero2.jpg", "Design system", "La verticalité comme langage de marque"],
    ["showcase-card--small", "copy3.jpg", "Contrôle", "Suivi précis de chaque niveau de chantier"],
  ];

  return (
    <section className="section showcase-section" id="showcase">
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow about-eyebrow">Showcase</p>
          <h2>Une lecture visuelle des opérations: installation, maintenance et modernisation.</h2>
        </div>
        <div className="showcase-grid">
          {items.map(([size, src, label, text]) => (
            <figure className={`showcase-card reveal ${size}`} key={`${src}-${label}`}>
              <img src={image(src)} alt={text} />
              <figcaption>
                <span>{label}</span>
                <strong>{text}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  const initialPath = useMemo(() => window.location.pathname === "/about.html" ? "/about" : window.location.pathname, []);
  const [path, setPath] = useState(initialPath === "/" || initialPath === "/about" ? initialPath : "/");

  const navigate = (to) => {
    const [nextPathRaw, hashRaw] = to.split("#");
    const nextPath = nextPathRaw || path;
    const normalizedPath = nextPath === "/about.html" ? "/about" : nextPath === "/index.html" ? "/" : nextPath;
    const hash = hashRaw ? `#${hashRaw}` : "";

    if (normalizedPath !== path) {
      window.history.pushState({}, "", `${normalizedPath}${hash}`);
      setPath(normalizedPath);
      window.setTimeout(() => scrollToHash(hash), 40);
      return;
    }

    if (hash) {
      window.history.pushState({}, "", `${normalizedPath}${hash}`);
      scrollToHash(hash);
    } else {
      window.history.pushState({}, "", normalizedPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onPopState = () => {
      const next = window.location.pathname === "/about.html" ? "/about" : window.location.pathname;
      setPath(next === "/about" ? "/about" : "/");
      window.setTimeout(() => scrollToHash(window.location.hash), 40);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.body.className = path === "/about" ? "about-page" : "home-page";
    document.title =
      path === "/about"
        ? "À Propos | RIMZID Ascenseur"
        : "RIMZID Ascenseurs | Installation, Modernisation, Maintenance";
  }, [path]);

  useEffect(() => {
    if (window.location.hash) window.setTimeout(() => scrollToHash(window.location.hash), 40);
  }, [path]);

  useSiteEffects(path);

  return path === "/about" ? <AboutPage navigate={navigate} /> : <HomePage navigate={navigate} />;
}

function scrollToHash(hash) {
  if (!hash) return;
  const element = document.querySelector(hash);
  if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
}

createRoot(document.getElementById("root")).render(<App />);

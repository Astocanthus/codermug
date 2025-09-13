// Ajouter à l'URL l'ancre
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('#navbar a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetId = this.getAttribute('href');
            setTimeout(() => {
                window.history.replaceState(null, null, targetId);
            }, 100);
        });
    });
});

// Gestion des trous du scroll
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById("navbar");
  const navLinks = navbar.querySelectorAll("a.nav-link[href^='#']");
  const sections = [];

  // Prépare une liste { id, element, link }
  navLinks.forEach(link => {
    const id = link.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    if (section) {
      sections.push({ id, link, section });
    }
  });

  const OFFSET = 100;

  function onScroll() {
    const scrollPos = window.scrollY + OFFSET;
    let current = null;

    // On cherche la première section qui est visible (dont le top est <= scrollPos)
    for (const s of sections) {
        if (s.section.offsetTop <= scrollPos) {
        current = s; // On garde la dernière section dont top <= scrollPos
        }
    }

    // Si aucune section n'est détectée, on active la première (en haut de page)
    if (!current && sections.length > 0) {
        current = sections[0];
    }

    // Retire toutes les classes active
    navLinks.forEach(link => link.classList.remove("active"));

    if (current) {
        current.link.classList.add("active");
        const parent = findParentLink(current.link);
        if (parent) parent.classList.add("active");
    }
  }

  // Trouve le lien parent d’un sous-lien
  function findParentLink(link) {
    let el = link.parentElement;
    while (el && el !== navbar) {
      if (el.classList.contains("nav") && el.previousElementSibling?.classList.contains("nav-link")) {
        return el.previousElementSibling;
      }
      el = el.parentElement;
    }
    return null;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
});

// Gestion hightlight section suivante
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById("navbar");
  const navLinks = navbar.querySelectorAll("a.nav-link[href^='#']");
  const sectionMap = new Map();

  navLinks.forEach(link => {
    const id = link.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    if (section) {
      sectionMap.set(section, link);
    }
  });

  function findParentLink(link) {
    const navItem = link.closest("nav.nav");
    if (!navItem || navItem.parentElement.tagName !== "NAV") return null;
    const parent = navItem.previousElementSibling;
    return parent?.classList.contains("nav-link") ? parent : null;
  }

  const activeLinks = new Set();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = sectionMap.get(entry.target);
      if (!link) return;

      if (entry.isIntersecting) {
        activeLinks.add(link);
        link.classList.add("highlighted");
      } else {
        activeLinks.delete(link);
        link.classList.remove("highlighted");
      }
    });

    // Nettoyage des parents
    navLinks.forEach(link => {
      const parent = findParentLink(link);
      if (parent && !parent.classList.contains("active")) {
        parent.classList.remove("highlighted");
      }
    });

    // Re-propagation vers les parents
    const parentsToHighlight = new Set();

    activeLinks.forEach(link => {
      const parent = findParentLink(link);
      if (parent && !parent.classList.contains("active")) {
        parentsToHighlight.add(parent);
      }
    });

    parentsToHighlight.forEach(parent => parent.classList.add("highlighted"));
  }, {
    root: null,
    threshold: 0.2
  });

  sectionMap.forEach((_, section) => observer.observe(section));
});

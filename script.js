// ============================================================
// TE VEN — Landing Page
// ============================================================

const WHATSAPP_NUMBER = "573192757931";

const WA_MESSAGES = {
  general: "Hola, quiero anunciar mi negocio con Te Ven. Me gustaría conocer el plan más adecuado.",
  basico: "Hola, me interesa el plan Te Ven Básico. Quiero anunciar mi negocio.",
  diseno: "Hola, me interesa el plan Te Ven Diseño. Necesito ayuda con la imagen de mi anuncio.",
  video: "Hola, me interesa el plan Te Ven Video. Quiero promocionar mi negocio con un video.",
};

function buildWaLink(type = "general") {
  const msg = WA_MESSAGES[type] || WA_MESSAGES.general;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function trackEvent(eventName) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, timestamp: Date.now() });
  console.log(`[TeVen] evento: ${eventName}`);
}

// 1. WhatsApp Links
document.querySelectorAll("[data-wa]").forEach((el) => {
  const type = el.getAttribute("data-wa") || "general";
  el.setAttribute("href", buildWaLink(type));
  el.setAttribute("target", "_blank");
  el.setAttribute("rel", "noopener");
  el.addEventListener("click", () => trackEvent(`click_whatsapp_${type}`));
});

// 2. Menú Móvil
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove("open");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
}

// 3. Navbar Scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

// 4. Eventos Adicionales
document.querySelectorAll('[data-event="click_ver_planes"]').forEach((el) => {
  el.addEventListener("click", () => trackEvent("click_ver_planes"));
});

const plansSection = document.getElementById("planes");
if (plansSection && "IntersectionObserver" in window) {
  const plansObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        trackEvent("scroll_planes");
        plansObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  plansObserver.observe(plansSection);
}

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (detail.open) trackEvent("faq_open");
  });
});

// 5. Año dinámico
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// 6. Fallback Video
const heroVideo = document.querySelector(".hero-video");
if (heroVideo) {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = conn && conn.saveData;
  const slowConn = conn && /2g/.test(conn.effectiveType || "");
  if (saveData || slowConn) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
    heroVideo.style.display = "none";
  }
}

// 7. Slider Ejemplos (Arrastre con mouse en Desktop)
const slider = document.getElementById("sliderEjemplos");
if (slider) {
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.style.cursor = "grabbing";
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.style.cursor = "grab";
  });
  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.style.cursor = "grab";
  });
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // velocidad de scroll
    slider.scrollLeft = scrollLeft - walk;
  });
  slider.style.cursor = "grab";
}

// 8. Reduced Motion
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && heroVideo) {
  heroVideo.removeAttribute("autoplay");
  heroVideo.pause();
}

// ============================================================
// 9. CONTROLES DEL SLIDER DE EJEMPLOS (FLECHAS)
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const sliderEjemplos = document.getElementById('sliderEjemplos');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');

  if (sliderEjemplos && btnPrev && btnNext) {
    
    // Función para calcular cuánto desplazar (ancho de tarjeta + gap)
    const getScrollAmount = () => {
      const card = sliderEjemplos.querySelector('.example-card');
      if (card) {
        const style = window.getComputedStyle(sliderEjemplos);
        const gap = parseInt(style.gap) || 20; // El gap definido en CSS
        return card.offsetWidth + gap;
      }
      return 300; // Fallback
    };

    // Botón Siguiente (Derecha)
    btnNext.addEventListener('click', () => {
      sliderEjemplos.scrollBy({
        left: getScrollAmount(),
        behavior: 'smooth'
      });
    });

    // Botón Anterior (Izquierda)
    btnPrev.addEventListener('click', () => {
      sliderEjemplos.scrollBy({
        left: -getScrollAmount(),
        behavior: 'smooth'
      });
    });

    // Ocultar flechas si no hay más contenido hacia ese lado
    const updateButtons = () => {
      const maxScrollLeft = sliderEjemplos.scrollWidth - sliderEjemplos.clientWidth;
      
      // Si estamos al inicio, desactivamos el botón izquierdo
      if (sliderEjemplos.scrollLeft <= 5) {
        btnPrev.style.opacity = '0.3';
        btnPrev.style.pointerEvents = 'none';
      } else {
        btnPrev.style.opacity = '1';
        btnPrev.style.pointerEvents = 'auto';
      }

      // Si estamos al final, desactivamos el botón derecho
      if (sliderEjemplos.scrollLeft >= maxScrollLeft - 5) {
        btnNext.style.opacity = '0.3';
        btnNext.style.pointerEvents = 'none';
      } else {
        btnNext.style.opacity = '1';
        btnNext.style.pointerEvents = 'auto';
      }
    };

    // Ejecutar al cargar y cada vez que se haga scroll en el slider
    updateButtons();
    sliderEjemplos.addEventListener('scroll', updateButtons);
  }
});
// ============================================================
// TE VEN — Landing Page JS
// ============================================================

const WHATSAPP_NUMBER = "573192757931";

const WA_MESSAGES = {
  general: "Hola, quiero anunciar mi negocio con Te Ven. Me gustaría conocer los planes.",
  basico: "Hola, me interesa el plan Te Ven Básico. Quiero anunciar mi negocio.",
  plus: "Hola, me interesa el plan Te Ven Plus. Quiero una mini landing personalizada.",
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

// 1. Enlaces de WhatsApp
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
}

// 3. Función genérica para el carrusel de ejemplos
function setupSlider(sliderId, prevBtnId, nextBtnId) {
  const slider = document.getElementById(sliderId);
  const btnPrev = document.getElementById(prevBtnId);
  const btnNext = document.getElementById(nextBtnId);

  if (!slider || !btnPrev || !btnNext) return;

  const getScrollAmount = () => {
    const card = slider.querySelector(".card");
    if (card) {
      const style = window.getComputedStyle(slider);
      const gap = parseInt(style.gap) || 24;
      return card.offsetWidth + gap;
    }
    return 320;
  };

  btnNext.addEventListener("click", () => {
    slider.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });

  btnPrev.addEventListener("click", () => {
    slider.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  const updateButtons = () => {
    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    if (slider.scrollLeft <= 5) {
      btnPrev.style.opacity = "0.3";
      btnPrev.style.pointerEvents = "none";
    } else {
      btnPrev.style.opacity = "1";
      btnPrev.style.pointerEvents = "auto";
    }
    if (slider.scrollLeft >= maxScrollLeft - 5) {
      btnNext.style.opacity = "0.3";
      btnNext.style.pointerEvents = "none";
    } else {
      btnNext.style.opacity = "1";
      btnNext.style.pointerEvents = "auto";
    }
  };

  updateButtons();
  slider.addEventListener("scroll", updateButtons);
}

// Inicializar SOLO el carrusel de ejemplos (los otros son grids)
setupSlider("sliderEjemplos", "btnPrev", "btnNext");

// 4. Arrastre con mouse para sliders (ejemplos y servicios en móvil)
document.querySelectorAll(".slider-track, .services-grid-fixed").forEach((slider) => {
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener("mousedown", (e) => {
    if (window.innerWidth >= 900) return; // No activar drag en desktop grid
    isDown = true;
    slider.style.cursor = "grabbing";
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("mouseleave", () => { isDown = false; slider.style.cursor = "grab"; });
  slider.addEventListener("mouseup", () => { isDown = false; slider.style.cursor = "grab"; });
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });
  slider.style.cursor = "grab";
});

// 5. Eventos adicionales
document.querySelectorAll('[data-event="click_ver_planes"]').forEach((el) => {
  el.addEventListener("click", () => trackEvent("click_ver_planes"));
});

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (detail.open) trackEvent("faq_open");
  });
});

// 6. Año dinámico
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============================================================
// 7. TOGGLE DE PRECIOS (Semana vs Mes)
// ============================================================
const toggleWeek = document.getElementById('toggleWeek');
const toggleMonth = document.getElementById('toggleMonth');

if (toggleWeek && toggleMonth) {
  const updatePrices = (period) => {
    // Actualizar botones activos
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    if (period === 'week') toggleWeek.classList.add('active');
    else toggleMonth.classList.add('active');

    // Actualizar los precios en cada tarjeta
    document.querySelectorAll('.plan-price-display').forEach(display => {
      const priceEl = display.querySelector('.plan-price');
      const periodEl = display.querySelector('.plan-period');
      const saveEl = display.querySelector('.plan-save');

      if (period === 'week') {
        priceEl.textContent = priceEl.dataset.priceWeek;
        periodEl.textContent = periodEl.dataset.periodWeek;
        saveEl.textContent = '';
        saveEl.style.display = 'none';
      } else {
        priceEl.textContent = priceEl.dataset.priceMonth;
        periodEl.textContent = periodEl.dataset.periodMonth;
        saveEl.textContent = saveEl.dataset.saveMonth;
        saveEl.style.display = 'inline-block';
      }
    });

    // Mostrar/ocultar las features exclusivas del mes
    document.querySelectorAll('.feature-month-only').forEach(feat => {
      feat.style.display = period === 'month' ? 'list-item' : 'none';
    });
  };

  toggleWeek.addEventListener('click', () => updatePrices('week'));
  toggleMonth.addEventListener('click', () => updatePrices('month'));
}

// ============================================================
// 8. MODAL TÉRMINOS Y CONDICIONES
// ============================================================
const termsModal = document.getElementById('termsModal');

function openTerms() {
  if (termsModal) {
    termsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeTerms() {
  if (termsModal) {
    termsModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && termsModal && termsModal.classList.contains('active')) {
    closeTerms();
  }
});
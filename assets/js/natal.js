/* ==========================================================
   Missão Especial de Natal — scripts
========================================================== */

/**
 * CONFIGURAÇÃO
 * checkoutUrl: cole aqui o link do checkout. Todos os botões [data-checkout]
 * passam a apontar para ele (UTMs e fbclid da página são repassados).
 * O mesmo link também está no href de cada botão no natal.html (funciona sem JS).
 */
const CONFIG = {
  checkoutUrl: 'https://ggcheckout.app/checkout/v2/5yBv4Mh0vLTgjlP3PQsBU',
};

(function () {
  'use strict';

  /* ---------- Checkout ---------- */
  function checkoutHref() {
    if (!CONFIG.checkoutUrl) return null;
    try {
      const url = new URL(CONFIG.checkoutUrl);
      new URLSearchParams(window.location.search).forEach(function (v, k) {
        if (!url.searchParams.has(k)) url.searchParams.set(k, v);
      });
      return url.toString();
    } catch (e) {
      return CONFIG.checkoutUrl;
    }
  }
  const href = checkoutHref();
  document.querySelectorAll('[data-checkout]').forEach(function (el) {
    if (href) el.setAttribute('href', href);
    el.addEventListener('click', function () {
      if (typeof window.fbq === 'function') window.fbq('track', 'InitiateCheckout');
      if (typeof window.gtag === 'function') window.gtag('event', 'begin_checkout');
      if (window.ttq && typeof window.ttq.track === 'function') window.ttq.track('InitiateCheckout');
    });
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Revelar ao rolar ---------- */
  const root = document.documentElement;
  const animOn = root.classList.contains('anim');
  root.classList.add('io-ready');
  if (animOn) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Ampliar pistas, convite e certificado ---------- */
  const box = document.getElementById('lightbox');
  const boxImg = document.getElementById('lightbox-img');
  if (box && typeof box.showModal === 'function') {
    document.querySelectorAll('[data-zoom]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        boxImg.src = btn.getAttribute('data-zoom') || btn.querySelector('img').currentSrc;
        boxImg.alt = btn.getAttribute('data-zoom-alt') || '';
        box.showModal();
      });
    });
    document.getElementById('lightbox-close').addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  }

  /* ---------- FAQ: altura animada, uma aberta por vez ---------- */
  const faq = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  const canAnimate = animOn && typeof Element.prototype.animate === 'function';
  function openItem(item) {
    const a = item.querySelector('.faq-a');
    item.open = true;
    if (canAnimate && a) a.animate([{ height: '0px', opacity: 0 }, { height: a.scrollHeight + 'px', opacity: 1 }], { duration: 240, easing: 'cubic-bezier(.22,.8,.24,1)' });
  }
  function closeItem(item) {
    const a = item.querySelector('.faq-a');
    if (!canAnimate || !a) { item.open = false; return; }
    item.classList.add('is-closing');
    a.animate([{ height: a.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 180, easing: 'ease-in' })
      .onfinish = function () { item.open = false; item.classList.remove('is-closing'); };
  }
  faq.forEach(function (item) {
    item.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      if (item.classList.contains('is-closing')) return;
      if (item.open) { closeItem(item); return; }
      faq.forEach(function (o) { if (o !== item && o.open) closeItem(o); });
      openItem(item);
    });
  });
})();

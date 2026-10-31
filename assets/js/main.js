/* ==========================================================
   Missão Especial — scripts da landing page
========================================================== */

/**
 * CONFIGURAÇÃO
 * checkoutUrl: link da ggCheckout. Todos os botões [data-checkout] passam a usá-lo.
 *              Enquanto vazio, os botões rolam até a oferta.
 * vslUrl:      vídeo da VSL. Aceita link do YouTube, Vimeo ou arquivo .mp4.
 */
const CONFIG = {
  checkoutUrl: '',   // ex.: 'https://pay.ggcheckout.com/...'
  vslUrl: '',        // ex.: 'https://www.youtube.com/watch?v=XXXXXXXX'
};

(function () {
  'use strict';

  /* ---------- Checkout (repassa UTMs / fbclid) ---------- */
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

  /* ---------- VSL: carrega o player só no clique ---------- */
  function embed(url) {
    if (!url) return null;
    let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
    if (m) return '<iframe src="https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Vídeo: como funciona a Missão Especial"></iframe>';
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return '<iframe src="https://player.vimeo.com/video/' + m[1] + '?autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Vídeo: como funciona a Missão Especial"></iframe>';
    if (/\.(mp4|webm)(\?|$)/i.test(url)) return '<video src="' + url + '" controls autoplay playsinline></video>';
    return null;
  }
  const play = document.getElementById('video-play');
  const box = document.getElementById('video-box');
  if (play && box) {
    play.addEventListener('click', function () {
      const html = embed(CONFIG.vslUrl);
      if (html) {
        box.innerHTML = html;
      } else {
        let msg = box.querySelector('.video-msg');
        if (!msg) {
          msg = document.createElement('p');
          msg.className = 'video-msg';
          msg.textContent = 'Vídeo em breve.';
          box.appendChild(msg);
          play.querySelector('.play').hidden = true;
        }
      }
    });
  }

  /* ---------- Movimento: revelar ao rolar + brilho único do CTA ---------- */
  const root = document.documentElement;
  const animOn = root.classList.contains('anim');
  root.classList.add('io-ready');

  if (animOn) {
    const stagger = window.matchMedia('(min-width: 768px)').matches ? 70 : 60;
    const revealObs = new IntersectionObserver(function (entries) {
      // Itens que entram juntos (ex.: cards lado a lado) ganham um stagger curto, no máximo 3 passos
      const batch = entries.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
      batch.forEach(function (e, i) {
        const el = e.target;
        if (el.hasAttribute('data-reveal')) el.style.setProperty('--d', Math.min(i, 3) * stagger + 'ms');
        el.classList.add('is-in');
        revealObs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(function (el) { revealObs.observe(el); });

    const shineObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        const btn = e.target;
        shineObs.unobserve(btn);
        // espera a entrada da seção terminar antes do brilho
        setTimeout(function () { btn.classList.add('is-lit'); }, btn.closest('.hero') ? 650 : 400);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.btn-shine:not(.btn-sm)').forEach(function (b) { shineObs.observe(b); });
  }

  /* ---------- FAQ: abre/fecha com altura animada, uma por vez ---------- */
  const faq = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  const canAnimate = animOn && typeof Element.prototype.animate === 'function';
  const ease = 'cubic-bezier(.22, .8, .24, 1)';

  function openItem(item) {
    const a = item.querySelector('.faq-a');
    item.open = true;
    if (!canAnimate || !a) return;
    a.animate([{ height: '0px', opacity: 0 }, { height: a.scrollHeight + 'px', opacity: 1 }], { duration: 240, easing: ease });
  }
  function closeItem(item) {
    const a = item.querySelector('.faq-a');
    if (!canAnimate || !a) { item.open = false; return; }
    item.classList.add('is-closing');
    const anim = a.animate([{ height: a.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 180, easing: 'ease-in' });
    anim.onfinish = function () { item.open = false; item.classList.remove('is-closing'); };
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

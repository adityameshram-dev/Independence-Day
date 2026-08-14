// index.js - Independence Day 2026 Mobile-First Responsive Application

(function() {
  'use strict';

  // Application State
  const state = {
    windSpeed: 1.0,       // 0.8 = gentle, 1.4 = breezy, 2.2 = strong
    tributeCount: 15842,
    isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // DOM References
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const flagCanvas = document.getElementById('flagCanvas');
  const bgParticlesCanvas = document.getElementById('bgParticlesCanvas');
  const tricolorWaveCanvas = document.getElementById('tricolorWaveCanvas');
  const payTributeBtn = document.getElementById('payTributeBtn');
  const tributeCountEl = document.getElementById('tributeCount');
  const windBtns = document.querySelectorAll('.wind-btn');

  // Initialize Application
  function init() {
    setupNavbar();
    setupFlagCanvas();
    setupBgParticles();
    setupTricolorWave();
    setupScrollReveal();
    setupWindControls();
    setupTributeButton();
    exposeGlobalAPI();
  }

  /* -------------------------------------------------------------
     1. NAVBAR & MOBILE MENU CONTROLS
     ------------------------------------------------------------- */
  function setupNavbar() {
    // Scroll glass effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });

    // Mobile nav toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navMenu.classList.contains('open');
        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // Close menu when clicking nav link
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          closeMobileMenu();
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
          closeMobileMenu();
        }
      });
    }
  }

  function openMobileMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  /* -------------------------------------------------------------
     2. REALISTIC INDIAN FLAG CANVAS ENGINE (PHOTOREALISTIC 3D CLOTH)
     ------------------------------------------------------------- */
  function setupFlagCanvas() {
    if (!flagCanvas) return;

    const ctx = flagCanvas.getContext('2d');
    
    // Internal Texture Resolution
    const TEX_W = 600;
    const TEX_H = 380;

    // Offscreen Texture Canvas for Pristine Flag Drawing
    const texCanvas = document.createElement('canvas');
    texCanvas.width = TEX_W;
    texCanvas.height = TEX_H;
    const texCtx = texCanvas.getContext('2d');

    function drawFlagTexture() {
      const stripeH = TEX_H / 3;

      // 1. Top Stripe: Saffron (#FF9933)
      const saffronGrad = texCtx.createLinearGradient(0, 0, 0, stripeH);
      saffronGrad.addColorStop(0, '#FFAA44');
      saffronGrad.addColorStop(1, '#FF8811');
      texCtx.fillStyle = saffronGrad;
      texCtx.fillRect(0, 0, TEX_W, stripeH);

      // 2. Middle Stripe: White (#FFFFFF)
      texCtx.fillStyle = '#FFFFFF';
      texCtx.fillRect(0, stripeH, TEX_W, stripeH);

      // 3. Bottom Stripe: India Green (#138808)
      const greenGrad = texCtx.createLinearGradient(0, stripeH * 2, 0, TEX_H);
      greenGrad.addColorStop(0, '#159909');
      greenGrad.addColorStop(1, '#0C6605');
      texCtx.fillStyle = greenGrad;
      texCtx.fillRect(0, stripeH * 2, TEX_W, stripeH);

      // 4. Ashoka Chakra (Center of White Stripe)
      const cx = TEX_W / 2;
      const cy = TEX_H / 2;
      const radius = stripeH * 0.42;

      texCtx.save();
      texCtx.strokeStyle = '#000080';
      texCtx.fillStyle = '#000080';

      // Outer Ring
      texCtx.lineWidth = 3.5;
      texCtx.beginPath();
      texCtx.arc(cx, cy, radius, 0, Math.PI * 2);
      texCtx.stroke();

      // Inner Ring
      texCtx.lineWidth = 1.5;
      texCtx.beginPath();
      texCtx.arc(cx, cy, radius * 0.88, 0, Math.PI * 2);
      texCtx.stroke();

      // Center Hub
      texCtx.beginPath();
      texCtx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
      texCtx.fill();

      // 24 Spokes
      const totalSpokes = 24;
      for (let i = 0; i < totalSpokes; i++) {
        const angle = (i * Math.PI * 2) / totalSpokes;
        const outerX = cx + Math.cos(angle) * radius;
        const outerY = cy + Math.sin(angle) * radius;

        // Spoke Line
        texCtx.lineWidth = 2;
        texCtx.beginPath();
        texCtx.moveTo(cx, cy);
        texCtx.lineTo(outerX, outerY);
        texCtx.stroke();

        // Small Rim Notches
        const notchAngle = angle + (Math.PI / totalSpokes);
        const nx = cx + Math.cos(notchAngle) * (radius * 0.95);
        const ny = cy + Math.sin(notchAngle) * (radius * 0.95);
        texCtx.beginPath();
        texCtx.arc(nx, ny, 1.2, 0, Math.PI * 2);
        texCtx.fill();
      }

      texCtx.restore();
    }

    drawFlagTexture();

    // Slicing Wave Animation
    const slices = 140;
    const sliceWidth = TEX_W / slices;

    function renderFlag(timestamp) {
      // Ensure canvas element dimensions match internal resolution for crisp scaling
      if (flagCanvas.width !== TEX_W) flagCanvas.width = TEX_W;
      if (flagCanvas.height !== TEX_H) flagCanvas.height = TEX_H;

      ctx.clearRect(0, 0, TEX_W, TEX_H);

      const time = state.isReducedMotion ? 0 : timestamp * 0.0015;
      const speed = state.windSpeed;

      let prevYOffset = 0;

      for (let i = 0; i < slices; i++) {
        const normX = i / slices; // 0 at pole, 1 at free right edge

        // Exponential amplitude multiplier (0 at pole attachment, growing towards free edge)
        const amp = Math.pow(normX, 1.25) * 22;

        // Compound sine waves for organic cloth movement
        const w1 = Math.sin(normX * 8 - time * 3.2 * speed);
        const w2 = Math.sin(normX * 16 - time * 5.5 * speed) * 0.35;
        const w3 = Math.cos(normX * 4 + time * 1.8 * speed) * 0.2;

        const yOffset = (w1 + w2 + w3) * amp;
        const slope = yOffset - prevYOffset;
        prevYOffset = yOffset;

        // 3D Perspective scale & lighting calculation
        const scaleY = 1 + Math.abs(slope) * 0.008;
        const sliceH = TEX_H * scaleY;
        const drawY = (TEX_H - sliceH) / 2 + yOffset;

        // Draw vertical slice from texture
        const sx = i * sliceWidth;
        const dx = i * (TEX_W / slices);
        const dw = (TEX_W / slices) + 0.5;

        ctx.drawImage(texCanvas, sx, 0, sliceWidth, TEX_H, dx, drawY, dw, sliceH);

        // Specular lighting & depth shadows
        const shadowIntensity = Math.max(-0.45, Math.min(0.45, slope * 0.12));
        if (shadowIntensity > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${shadowIntensity * 0.5})`;
          ctx.fillRect(dx, drawY, dw, sliceH);
        } else if (shadowIntensity < 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(shadowIntensity) * 0.6})`;
          ctx.fillRect(dx, drawY, dw, sliceH);
        }
      }

      requestAnimationFrame(renderFlag);
    }

    // Wind speed controller handler
    window.setWindSpeed = function(level) {
      if (level === 'gentle') state.windSpeed = 0.8;
      else if (level === 'breezy') state.windSpeed = 1.4;
      else if (level === 'strong') state.windSpeed = 2.2;
    };

    // Touch & Mouse Wind Surge Interaction
    const triggerSurge = () => { state.windSpeed += 0.4; };
    const resetSurge = () => { state.windSpeed = 1.0; };

    flagCanvas.addEventListener('mouseenter', triggerSurge);
    flagCanvas.addEventListener('mouseleave', resetSurge);
    flagCanvas.addEventListener('touchstart', triggerSurge, { passive: true });
    flagCanvas.addEventListener('touchend', resetSurge, { passive: true });

    requestAnimationFrame(renderFlag);
  }

  /* -------------------------------------------------------------
     3. MOBILE-OPTIMIZED BACKGROUND PARTICLES ENGINE
     ------------------------------------------------------------- */
  function setupBgParticles() {
    if (!bgParticlesCanvas) return;

    const ctx = bgParticlesCanvas.getContext('2d');
    let width = bgParticlesCanvas.width = window.innerWidth;
    let height = bgParticlesCanvas.height = window.innerHeight;

    // Reduce particle count on mobile screens for 60 FPS performance
    function getParticleCount() {
      return window.innerWidth < 600 ? 18 : 40;
    }

    let particleCount = getParticleCount();
    let particles = [];

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 0.6,
          color: Math.random() > 0.4 ? 'rgba(255, 215, 0, ' : 'rgba(255, 153, 51, ',
          alpha: Math.random() * 0.5 + 0.2,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.5 - 0.2
        });
      }
    }

    initParticles();

    window.addEventListener('resize', () => {
      width = bgParticlesCanvas.width = window.innerWidth;
      height = bgParticlesCanvas.height = window.innerHeight;
      particleCount = getParticleCount();
      initParticles();
    }, { passive: true });

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      if (state.isReducedMotion) return;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(renderParticles);
    }

    requestAnimationFrame(renderParticles);
  }

  /* -------------------------------------------------------------
     4. TRICOLOR WAVE RIBBON CANVAS (TRIBUTE SECTION)
     ------------------------------------------------------------- */
  function setupTricolorWave() {
    if (!tricolorWaveCanvas) return;

    const ctx = tricolorWaveCanvas.getContext('2d');
    let width = tricolorWaveCanvas.width = 800;
    let height = tricolorWaveCanvas.height = 80;

    function renderWave(time) {
      ctx.clearRect(0, 0, width, height);

      const colors = ['#FF9933', '#FFFFFF', '#138808'];
      const t = state.isReducedMotion ? 0 : time * 0.002;

      colors.forEach((color, idx) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();

        const offset = idx * 6;
        for (let x = 0; x <= width; x += 12) {
          const y = height / 2 + Math.sin(x * 0.01 + t + idx * 0.8) * 10 + offset - 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      requestAnimationFrame(renderWave);
    }

    requestAnimationFrame(renderWave);
  }

  /* -------------------------------------------------------------
     5. SCROLL REVEAL & ACTIVE NAV LINK OBSERVER
     ------------------------------------------------------------- */
  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    const sections = document.querySelectorAll('.section, header.hero-section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(el => observer.observe(el));

    // Nav link active state on scroll
    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  /* -------------------------------------------------------------
     6. WIND CONTROL BUTTON EVENT LISTENERS
     ------------------------------------------------------------- */
  function setupWindControls() {
    windBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        windBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const level = btn.dataset.wind;
        if (window.setWindSpeed) {
          window.setWindSpeed(level);
        }
      });
    });
  }

  /* -------------------------------------------------------------
     7. INTERACTIVE TRIBUTE FLAME BUTTON & COUNTER
     ------------------------------------------------------------- */
  function setupTributeButton() {
    if (!payTributeBtn || !tributeCountEl) return;

    payTributeBtn.addEventListener('click', () => {
      state.tributeCount++;
      tributeCountEl.textContent = state.tributeCount.toLocaleString();

      // Trigger Flame Particle Spark Burst
      createFlameSparks(payTributeBtn);
      
      // Button Feedback Animation
      payTributeBtn.style.transform = 'scale(0.96)';
      setTimeout(() => {
        payTributeBtn.style.transform = '';
      }, 150);
    });
  }

  function createFlameSparks(targetBtn) {
    const rect = targetBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const count = window.innerWidth < 600 ? 16 : 25;

    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark-particle';
      
      const size = Math.random() * 6 + 4;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 60 + 20;

      spark.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${Math.random() > 0.5 ? '#FF9933' : '#FFD700'};
        box-shadow: 0 0 8px #FF9933;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s ease;
      `;

      document.body.appendChild(spark);

      requestAnimationFrame(() => {
        spark.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 30}px) scale(0)`;
        spark.style.opacity = '0';
      });

      setTimeout(() => {
        spark.remove();
      }, 750);
    }
  }

  /* -------------------------------------------------------------
     8. GLOBAL BACKWARD COMPATIBILITY API
     ------------------------------------------------------------- */
  function exposeGlobalAPI() {
    window.__independenceApp = {
      restart: function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      showSlide: function(idx) {},
      nextSlide: function() {},
      payTribute: function() {
        if (payTributeBtn) payTributeBtn.click();
      },
      setWindSpeed: window.setWindSpeed || function() {}
    };
  }

  // Start Application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
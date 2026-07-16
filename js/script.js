/* ============================================================
   MAIN.JS — UI interactions, GSAP scroll animation, micro-interactions
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Loader ---------------- */
  const loader = document.getElementById('loader');
  const hideLoader = () => loader && loader.classList.add('hidden');
  window.addEventListener('load', () => setTimeout(hideLoader, 500));
  // Hard fallback: never let the loader get stuck, even if a CDN script
  // (Three.js/GSAP) fails to load or the network is slow.
  setTimeout(hideLoader, 2500);

  /* ---------------- Footer year ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Custom cursor ---------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorGlow = document.getElementById('cursorGlow');
  if (window.innerWidth > 820) {
    window.addEventListener('mousemove', (e) => {
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.style.transform = 'translate(-50%,-50%) scale(2.5)');
      el.addEventListener('mouseleave', () => cursorDot.style.transform = 'translate(-50%,-50%) scale(1)');
    });
  }

  /* ---------------- Navbar scroll state ---------------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ---------------- Hamburger menu ---------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  /* ---------------- Theme toggle (dark / light) ---------------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
  });

  /* ---------------- Ambient sound toggle (generated tone, no external file needed) ---------------- */
  const musicToggle = document.getElementById('musicToggle');
  let audioCtx, oscillator, gainNode, playing = false;
  musicToggle.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      oscillator = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 110;
      gainNode.gain.value = 0;
      oscillator.connect(gainNode).connect(audioCtx.destination);
      oscillator.start();
    }
    playing = !playing;
    gainNode.gain.linearRampToValueAtTime(playing ? 0.02 : 0, audioCtx.currentTime + 0.4);
    musicToggle.style.color = playing ? 'var(--secondary)' : '';
  });

  /* ---------------- Typewriter effect ---------------- */
  const roles = ['AI Engineer', 'Full Stack Developer', 'Machine Learning Explorer', 'Creative Coder'];
  const twEl = document.getElementById('typewriter');
  let roleIdx = 0, charIdx = 0, deleting = false;

  function typeLoop() {
    const current = roles[roleIdx];
    if (!deleting) {
      charIdx++;
      twEl.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) { deleting = true; setTimeout(typeLoop, 1400); return; }
    } else {
      charIdx--;
      twEl.textContent = current.slice(0, charIdx);
      if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
    }
    setTimeout(typeLoop, deleting ? 45 : 85);
  }
  typeLoop();

  /* ---------------- GSAP scroll reveal ---------------- */
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.reveal-up').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: (i % 4) * 0.05,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  } else {
    document.querySelectorAll('.reveal-up').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* ---------------- Skill rings (set CSS custom property from data-percent) ---------------- */
  document.querySelectorAll('.skill-ring').forEach(ring => {
    const p = ring.getAttribute('data-percent');
    if (window.gsap) {
      gsap.fromTo(ring, { '--p': 0 }, {
        '--p': p, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: ring, start: 'top 90%' }
      });
    } else {
      ring.style.setProperty('--p', p);
    }
  });

  /* ---------------- Animated stat counters ---------------- */
  document.querySelectorAll('.stat-num').forEach(num => {
    const target = parseInt(num.getAttribute('data-count'), 10);
    const obj = { val: 0 };
    if (window.gsap) {
      gsap.to(obj, {
        val: target, duration: 1.8, ease: 'power2.out',
        onUpdate: () => num.textContent = Math.round(obj.val),
        scrollTrigger: { trigger: num, start: 'top 92%' }
      });
    } else {
      num.textContent = target;
    }
  });

  /* ---------------- Magnetic buttons ---------------- */
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
  });

  /* ---------------- Ripple click effect ---------------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------------- Tilt effect for cards ---------------- */
  document.querySelectorAll('[data-tilt], #tiltCard').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = 'perspective(700px) rotateY(0) rotateX(0)');
  });

  /* ---------------- Project filtering ---------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('hide', !match);
      });
    });
  });

  /* ---------------- Project modal ---------------- */
  const modal = document.getElementById('projectModal');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');

  document.querySelectorAll('.project-demo').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const card = link.closest('.project-card');
      const title = card.querySelector('h3').textContent;
      const desc = card.querySelector('p').textContent;
      modalContent.innerHTML = `<h3>${title}</h3><p>${desc}</p><p style="margin-top:16px;color:var(--secondary);font-family:var(--font-mono);font-size:12px;">// Live demo link goes here once deployed</p>`;
      modal.classList.add('open');
    });
  });
  modalClose.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  /* ---------------- Contact form validation + success animation ---------------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const name = document.getElementById('fName');
    const email = document.getElementById('fEmail');
    const subject = document.getElementById('fSubject');
    const message = document.getElementById('fMessage');

    [name, subject, message].forEach(input => {
      const group = input.closest('.form-group');
      if (!input.value.trim()) { group.classList.add('invalid'); valid = false; }
      else group.classList.remove('invalid');
    });

    const emailGroup = email.closest('.form-group');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) { emailGroup.classList.add('invalid'); valid = false; }
    else emailGroup.classList.remove('invalid');

    if (!valid) {
      if (window.gsap) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' });
      return;
    }

    form.classList.add('submitted');
    formSuccess.classList.add('show');
  });

  /* ---------------- Back to top ---------------- */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

});

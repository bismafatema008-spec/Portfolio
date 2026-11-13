(() => {
  "use strict";

  // Mobile navigation
  const menuButton = document.getElementById("menuToggle");
  const nav = document.getElementById("primaryNav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  // Reveal sections as they enter the viewport; content remains visible without JS.
  const revealTargets = document.querySelectorAll(".section-kicker, .intro-grid, .skill-group, .section-heading, .project-card, .road-step, .education-card, .contact-panel");
  revealTargets.forEach(el => el.classList.add("reveal"));
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("visible"));
  }

  // Lightweight Three.js hero sculpture with graceful fallback.
  function initHeroScene() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas || !window.THREE) return;
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setClearColor(0x000000, 0);
    const group = new THREE.Group();
    scene.add(group);

    const knotGeometry = new THREE.TorusKnotGeometry(1.12, 0.34, 180, 24, 2, 5);
    const knotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9d7be8, metalness: 0.62, roughness: 0.2,
      clearcoat: 1, clearcoatRoughness: 0.14,
      emissive: 0x29154b, emissiveIntensity: 0.38
    });
    const knot = new THREE.Mesh(knotGeometry, knotMaterial);
    group.add(knot);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.05, 2),
      new THREE.MeshBasicMaterial({ color: 0xbda6ff, wireframe: true, transparent: true, opacity: 0.13 })
    );
    group.add(wire);

    const particleCount = 420;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 2.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
      color: 0xc7b3ff, size: 0.018, transparent: true, opacity: 0.72, sizeAttenuation: true
    }));
    scene.add(particles);

    const ambient = new THREE.AmbientLight(0xffffff, 1.05);
    const keyLight = new THREE.PointLight(0xc7a6ff, 3.1, 18);
    keyLight.position.set(3, 3, 5);
    const coolLight = new THREE.PointLight(0x7777ff, 2, 16);
    coolLight.position.set(-4, -2, 2);
    scene.add(ambient, keyLight, coolLight);

    let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
    window.addEventListener("pointermove", event => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 0.55;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 0.4;
    }, { passive: true });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 500 ? 9 : 8;
      camera.updateProjectionMatrix();
    }
    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      targetX += (pointerY - targetX) * 0.035;
      targetY += (pointerX - targetY) * 0.035;
      if (!reducedMotion) {
        knot.rotation.x = t * 0.12 + targetX;
        knot.rotation.y = t * 0.19 + targetY;
        wire.rotation.x = -t * 0.045;
        wire.rotation.y = t * 0.07;
        particles.rotation.y = t * 0.018;
        group.position.y = Math.sin(t * 0.7) * 0.08;
      }
      group.rotation.x = targetX * 0.45;
      group.rotation.y += (targetY * 0.08 - group.rotation.y) * 0.02;
      renderer.render(scene, camera);
    }
    animate();
  }

  if (document.readyState === "complete") initHeroScene();
  else window.addEventListener("load", initHeroScene, { once: true });
})();
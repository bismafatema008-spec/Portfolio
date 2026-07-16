/* ============================================================
   3D BACKGROUND — Three.js
   Builds a "Neural Core": a wireframe icosahedron representing
   a neural network, surrounded by floating particle nodes and
   thin connective lines, with mouse parallax + scroll-driven
   camera motion.
   ============================================================ */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isSmall = window.innerWidth < 700;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 26;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  /* ---------- Neural Core (wireframe icosahedron) ---------- */
  const coreGeo = new THREE.IcosahedronGeometry(6.2, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x915eff,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // Inner glowing node cluster (points on the icosahedron vertices)
  const nodeGeo = new THREE.IcosahedronGeometry(6.2, 1);
  const nodeMat = new THREE.PointsMaterial({
    color: 0x00e5ff,
    size: 0.22,
    transparent: true,
    opacity: 0.9
  });
  const nodes = new THREE.Points(nodeGeo, nodeMat);
  scene.add(nodes);

  // Secondary inner core (subtle depth)
  const innerGeo = new THREE.IcosahedronGeometry(3.6, 0);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x7b61ff, wireframe: true, transparent: true, opacity: 0.35 });
  const innerCore = new THREE.Mesh(innerGeo, innerMat);
  scene.add(innerCore);

  /* ---------- Floating particle field ---------- */
  const particleCount = isSmall ? 500 : 1400;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colorChoices = [new THREE.Color(0x915eff), new THREE.Color(0x00e5ff), new THREE.Color(0x7b61ff)];
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 20 + Math.random() * 60;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ---------- Ambient light-like colored point lights (visual only, unlit basic materials react via fog tint) ---------- */
  scene.fog = new THREE.FogExp2(0x050816, 0.006);

  /* ---------- Mouse parallax ---------- */
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotY = mouseX * 0.4;
    targetRotX = mouseY * 0.3;
  });

  /* ---------- Scroll-driven camera dolly ---------- */
  let scrollFraction = 0;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollFraction = max > 0 ? window.scrollY / max : 0;
  }, { passive: true });

  /* ---------- Resize ---------- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- Animation loop ---------- */
  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();

    // Core rotation: base auto-spin + mouse parallax easing
    core.rotation.y += 0.0016;
    core.rotation.x += 0.0006;
    nodes.rotation.copy(core.rotation);
    innerCore.rotation.x -= 0.0022;
    innerCore.rotation.y -= 0.0012;

    core.rotation.y += (targetRotY - core.rotation.y) * 0.0; // keep autospin dominant
    scene.rotation.y += (targetRotY * 0.15 - scene.rotation.y) * 0.04;
    scene.rotation.x += (targetRotX * 0.15 - scene.rotation.x) * 0.04;

    // subtle breathing scale on the core
    const breathe = 1 + Math.sin(elapsed * 0.8) * 0.03;
    core.scale.set(breathe, breathe, breathe);
    nodes.scale.set(breathe, breathe, breathe);

    // particle drift
    particles.rotation.y += 0.00025;
    particles.rotation.x += 0.00008;

    // camera dolly tied to scroll position
    camera.position.z = 26 - scrollFraction * 10;
    camera.position.y = -scrollFraction * 4;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // expose for potential debugging / theme sync
  window.__bgScene = { scene, core, particleMat, coreMat, nodeMat, innerMat };
})();

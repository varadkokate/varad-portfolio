/* =============================================================
   hero3d.js — interactive 3D hero (Three.js)

   Loaded LAZILY by main.js (dynamic import) only when the hero is
   on screen, so the first paint never waits for Three.js.

   - Faceted "tech node" + wireframe shell + two orbiting satellites
   - Particle field that drifts with the mouse
   - Pauses when scrolled away / tab hidden; renders one still frame
     when the visitor prefers reduced motion
   - Pixel ratio capped and particle count reduced on phones
   ============================================================= */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const PALETTE = {
  dark: {
    core: 0xffb347, wire: 0xfff4e0, wireOpacity: 0.2,
    ringA: 0xff6b5e, ringB: 0x4fd1c5,
    dust: 0xfff4e0, dustOpacity: 0.8, ambient: 1.1
  },
  light: {
    core: 0xe8932a, wire: 0x161b2b, wireOpacity: 0.28,
    ringA: 0xc0301f, ringB: 0x0a7a6f,
    dust: 0x7a4a12, dustOpacity: 0.75, ambient: 1.6
  }
};

export function createHeroScene(host, options = {}) {
  const { theme = 'dark', reducedMotion = false, onLost } = options;

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const maxDpr = coarse ? 1.5 : 2;

  /* ── Renderer ─────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({
    antialias: !coarse,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  /* ── Scene / camera / lights ──────────────────────────── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 7.5);

  const lights = {
    ambient: new THREE.AmbientLight(0xffffff, 1.1),
    key:     new THREE.DirectionalLight(0xffffff, 2.4),
    warm:    new THREE.PointLight(0xff6b5e, 45, 20),
    cool:    new THREE.PointLight(0x4fd1c5, 45, 20)
  };
  lights.key.position.set(3, 4, 5);
  lights.warm.position.set(-4, -2, 3);
  lights.cool.position.set(4, -3, 2);
  scene.add(lights.ambient, lights.key, lights.warm, lights.cool);

  /* root = pointer tilt, spin = continuous rotation */
  const root = new THREE.Group();
  const spin = new THREE.Group();
  root.add(spin);
  scene.add(root);

  const coreMat = new THREE.MeshStandardMaterial({
    color: PALETTE.dark.core, metalness: 0.3, roughness: 0.35, flatShading: true
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 1), coreMat);

  const shellMat = new THREE.MeshBasicMaterial({
    color: PALETTE.dark.wire, wireframe: true, transparent: true, opacity: PALETTE.dark.wireOpacity
  });
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.85, 2), shellMat);
  spin.add(core, shell);

  /* Orbits with a satellite each */
  function makeOrbit(radius, tilt, key, speed, size) {
    const pivot = new THREE.Group();
    pivot.rotation.set(tilt.x, 0, tilt.z);

    const ringMat = new THREE.MeshBasicMaterial({ color: PALETTE.dark[key], transparent: true, opacity: 0.45 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 6, 160), ringMat);
    ring.rotation.x = Math.PI / 2;

    const satMat = new THREE.MeshBasicMaterial({ color: PALETTE.dark[key] });
    const sat = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), satMat);
    sat.position.x = radius;

    const arm = new THREE.Group();
    arm.add(sat);
    pivot.add(ring, arm);
    root.add(pivot);
    return { arm, speed, key, mats: [ringMat, satMat] };
  }
  const orbits = [
    makeOrbit(2.35, { x: 0.35, z: 0.2 },  'ringA',  0.55, 0.09),
    makeOrbit(2.9,  { x: -0.5, z: -0.35 }, 'ringB', -0.4,  0.075)
  ];

  /* Particle dust (fewer on phones) */
  const dustCount = (coarse || host.clientWidth < 520) ? 380 : 1100;
  const positions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const r = 2.8 + Math.random() * 3.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: PALETTE.dark.dust, size: 0.035, sizeAttenuation: true,
    transparent: true, opacity: PALETTE.dark.dustOpacity, depthWrite: false
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* ── Theme ─────────────────────────────────────────────── */
  function setTheme(name) {
    const p = PALETTE[name] || PALETTE.dark;
    coreMat.color.setHex(p.core);
    shellMat.color.setHex(p.wire);
    shellMat.opacity = p.wireOpacity;
    orbits.forEach(o => o.mats.forEach(m => m.color.setHex(p[o.key])));
    dustMat.color.setHex(p.dust);
    dustMat.opacity = p.dustOpacity;
    lights.ambient.intensity = p.ambient;
    if (!running) renderOnce();
  }

  /* ── Pointer (reads the whole window so the node follows you
        even though the stage itself ignores pointer events) ── */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, live: false };
  const onMove = e => {
    if (e.pointerType === 'touch') return;
    ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
    ptr.live = true;
  };
  if (!reducedMotion) window.addEventListener('pointermove', onMove, { passive: true });

  /* ── Sizing ────────────────────────────────────────────── */
  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(w, h, false);           // CSS controls the canvas box
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    /* keep the whole system in frame on narrow / short stages */
    const fit = Math.max(0.45, Math.min(0.9, camera.aspect * 0.98));
    root.scale.setScalar(fit);
    if (!running) renderOnce();
  }

  /* ── Animation ─────────────────────────────────────────── */
  function update(dt, t) {
    if (!ptr.live) {                          // touch / idle: gentle autonomous sway
      ptr.tx = Math.sin(t * 0.4) * 0.5;
      ptr.ty = Math.cos(t * 0.3) * 0.3;
    }
    const k = 1 - Math.pow(0.001, dt);        // frame-rate independent damping
    ptr.x += (ptr.tx - ptr.x) * k;
    ptr.y += (ptr.ty - ptr.y) * k;

    root.rotation.y = ptr.x * 0.6;
    root.rotation.x = ptr.y * 0.4;
    root.position.y = Math.sin(t * 1.1) * 0.12;

    spin.rotation.y += dt * 0.35;
    spin.rotation.x += dt * 0.08;
    shell.rotation.y -= dt * 0.12;
    orbits.forEach(o => { o.arm.rotation.y += dt * o.speed; });

    dust.rotation.y += dt * 0.03;
    dust.position.x = ptr.x * 0.25;
    dust.position.y = -ptr.y * 0.2;
  }

  let running = false;
  let raf = 0;
  let last = 0;
  let t = 0;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    update(dt, t);
    renderer.render(scene, camera);
  }
  function renderOnce() { renderer.render(scene, camera); }
  function start() {
    if (running || reducedMotion) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  /* Pause when off-screen or tab hidden (saves battery) */
  let inView = true;
  let tabVisible = !document.hidden;
  const sync = () => ((inView && tabVisible) ? start() : stop());
  const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
  io.observe(host);
  const onVis = () => { tabVisible = !document.hidden; sync(); };
  document.addEventListener('visibilitychange', onVis);

  const ro = new ResizeObserver(resize);
  ro.observe(host);

  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    stop();
    if (typeof onLost === 'function') onLost();
  });

  /* ── Boot ──────────────────────────────────────────────── */
  if (reducedMotion) root.rotation.set(0.25, -0.4, 0);   // static, nicely posed
  setTheme(theme);
  resize();
  renderOnce();
  sync();

  function dispose() {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pointermove', onMove);
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    renderer.dispose();
    canvas.remove();
  }

  return { setTheme, dispose };
}

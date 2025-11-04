import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';

// Basic scene setup
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 2000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 120;

// Resize handling
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// Camera start
camera.position.set(0, 12, 28);
controls.update();

// Lighting
const hemi = new THREE.HemisphereLight(0x88aaff, 0x0a0a1a, 0.7);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(10, 20, 10);
scene.add(dir);

// Sun (central star) with subtle pulse
const sunGeo = new THREE.SphereGeometry(7.5, 48, 48);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe08a });
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.position.set(0, 0, -40);
scene.add(sun);
let sunPulse = 0;

// Stars background
function makeStars(count = 1200, radius = 500) {
  const geom = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.7 + Math.random() * 0.3);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xbfd1ff, size: 1.5, sizeAttenuation: true });
  const stars = new THREE.Points(geom, mat);
  stars.renderOrder = -1;
  scene.add(stars);
}
makeStars();

// WebAudio simple SFX (no external assets)
let audioCtx;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playLaunch() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sawtooth';
  const now = audioCtx.currentTime;
  o.frequency.setValueAtTime(180, now);
  o.frequency.exponentialRampToValueAtTime(540, now + 0.4);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(now + 0.5);
}
function playExplosion() {
  ensureAudio();
  const dur = 0.5;
  const len = audioCtx.sampleRate * dur;
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    // White noise with exponential decay
    data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * i / len);
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const g = audioCtx.createGain();
  g.gain.value = 0.6;
  src.connect(g).connect(audioCtx.destination);
  src.start();
}

// Create planets (Mercury, Venus, Earth, Mars) with target URLs
const planets = [];
function addPlanet({ name, radius, color, position, url }) {
  const geo = new THREE.IcosahedronGeometry(radius, 5);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.06, flatShading: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.userData.url = url;
  scene.add(mesh);
  planets.push(mesh);
  return mesh;
}

const mercury = addPlanet({
  name: 'Mercury',
  radius: 4.0,
  color: 0x9a9a9a,
  position: new THREE.Vector3(0, 0, 0),
  url: null // opens a menu instead of direct redirect
});
const venus = addPlanet({
  name: 'Venus',
  radius: 4.6,
  color: 0xd9a066,
  position: new THREE.Vector3(12, -1, -6),
  url: 'https://friends.kylife.ca'
});
const photos = addPlanet({
  name: 'Photos',
  radius: 4.8,
  color: 0x4da3ff,
  position: new THREE.Vector3(-13, 1, -7),
  url: 'https://gallery.kylife.ca'
});
const mars = addPlanet({
  name: 'Mars',
  radius: 4.2,
  color: 0xd35442,
  position: new THREE.Vector3(8, 0.5, 11),
  url: 'https://www.kylife.ca/gaming'
});

// Draft planets
const games = addPlanet({ name: 'Games', radius: 3.8, color: 0x6bd06b, position: new THREE.Vector3(-6, -2, 15), url: 'https://www.kylife.ca/games' });
const calendar = addPlanet({ name: 'Calendar', radius: 3.8, color: 0xffb86b, position: new THREE.Vector3(16, 2, 4), url: 'https://www.kylife.ca/calendar' });
// Re-purpose Forum as HRM / Client Manager hosted on a separate server
const hrm = addPlanet({ name: 'HRM', radius: 3.8, color: 0x9a7dff, position: new THREE.Vector3(-18, -0.5, 3), url: 'https://hrm.kylife.ca' });

// Ground / reference ring
const ringGeo = new THREE.RingGeometry(6, 6.4, 64);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x334466, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = -Math.PI / 2;
ring.position.y = -4.2;
scene.add(ring);

// Raycaster for clicking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let launchInProgress = false;
let selectedPlanet = null;$ports = 2343,2344,2345,2346,2347,2350,8788
foreach($p in $ports){
  New-NetFirewallRule -DisplayName "PhotoPrism-$p-LAN" -Direction Inbound -Protocol TCP -LocalPort $p -Action Allow -Profile Private -ErrorAction SilentlyContinue
}
let lastHitLocal = null; // for Photos polar routing
const mercuryMenu = document.getElementById('mercury-menu');
const closeBtn = mercuryMenu ? mercuryMenu.querySelector('.close') : null;
if (closeBtn) closeBtn.addEventListener('click', () => mercuryMenu.classList.add('hidden'));

// Rocket parts
function createRocket() {
  const group = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 3.0, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.3 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0;
  group.add(body);

  const noseGeo = new THREE.ConeGeometry(0.3, 0.8, 16);
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xff3355, roughness: 0.3, metalness: 0.2 });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.y = 1.9;
  group.add(nose);

  const finGeo = new THREE.BoxGeometry(0.05, 0.7, 0.5);
  const finMat = new THREE.MeshStandardMaterial({ color: 0x00bcd4, roughness: 0.6, metalness: 0.1 });
  const fin1 = new THREE.Mesh(finGeo, finMat);
  fin1.position.set(0.25, -1.2, 0);
  fin1.rotation.z = Math.PI * 0.1;
  const fin2 = fin1.clone(); fin2.position.x = -0.25; fin2.rotation.z = -Math.PI * 0.1;
  group.add(fin1, fin2);

  const engineGeo = new THREE.ConeGeometry(0.35, 0.7, 16);
  const engineMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
  const engine = new THREE.Mesh(engineGeo, engineMat);
  engine.position.y = -1.9;
  engine.rotation.x = Math.PI;
  group.add(engine);

  // Flame as emissive sphere (simple stylized)
  const flameGeo = new THREE.SphereGeometry(0.22, 12, 12);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.y = -2.2;
  group.add(flame);

  group.scale.set(1.2, 1.2, 1.2);
  group.rotation.x = Math.PI * 0.5;
  group.visible = false;
  scene.add(group);
  return group;
}

const rocket = createRocket();

// Explosion particles (InstancedMesh of tiny tetrahedrons)
const MAX_PARTS = 400;
const fragGeo = new THREE.TetrahedronGeometry(0.12);
const fragMat = new THREE.MeshStandardMaterial({ color: 0xcfd2d6, roughness: 0.7, metalness: 0.05 });
const fragments = new THREE.InstancedMesh(fragGeo, fragMat, MAX_PARTS);
fragments.visible = false;
scene.add(fragments);
const fragVelocity = new Array(MAX_PARTS).fill(0).map(() => new THREE.Vector3());

// Launch + impact state
let rocketVel = new THREE.Vector3();
let targetPos = new THREE.Vector3();
let exploding = false;
let explosionTime = 0;

function onClick(e) {
  if (launchInProgress) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(planets, true);
  if (hits.length) {
    selectedPlanet = hits[0].object;

    // Special case: Mercury opens a choice menu (no rocket)
    if (selectedPlanet.name === 'Mercury') {
      if (mercuryMenu) mercuryMenu.classList.remove('hidden');
      return;
    }

    // Remember local point for Photos to decide region (poles vs equator)
    if (selectedPlanet.name === 'Photos') {
      const inv = new THREE.Matrix4().copy(selectedPlanet.matrixWorld).invert();
      lastHitLocal = hits[0].point.clone().applyMatrix4(inv);
    } else {
      lastHitLocal = null;
    }

    // Start rocket from off-screen left-bottom
    rocket.position.set(-18, -10, 0);
    rocket.lookAt(selectedPlanet.position);
    rocket.visible = true;
    targetPos.copy(selectedPlanet.position);

    const dir = new THREE.Vector3().subVectors(targetPos, rocket.position).normalize();
    rocketVel.copy(dir).multiplyScalar(0.28);
    launchInProgress = true;
    playLaunch();
  }
}
canvas.addEventListener('pointerdown', onClick);

function explode(center) {
  // Hide Mercury and emit fragments
  if (selectedPlanet) selectedPlanet.visible = false;
  fragments.visible = true;

  // Distribute fragments on sphere around center with random velocities
  const dummy = new THREE.Object3D();
  for (let i = 0; i < MAX_PARTS; i++) {
    const n = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    n.normalize();
    const pos = new THREE.Vector3().copy(center).addScaledVector(n, 0.5 + Math.random() * 0.6);
    dummy.position.copy(pos);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.updateMatrix();
    fragments.setMatrixAt(i, dummy.matrix);

    fragVelocity[i].copy(n).multiplyScalar(0.25 + Math.random() * 0.6);
  }
  fragments.instanceMatrix.needsUpdate = true;
  exploding = true;
  explosionTime = 0;
  playExplosion();

  // Redirect after a short cinematic pause
    setTimeout(() => {
    let url = (selectedPlanet && selectedPlanet.userData.url) || 'https://gallery.kylife.ca';
    if (selectedPlanet && selectedPlanet.name === 'Photos' && lastHitLocal) {
      const r = selectedPlanet.geometry.boundingSphere ? selectedPlanet.geometry.boundingSphere.radius : 4.8;
      const y = THREE.MathUtils.clamp(lastHitLocal.y / r, -1, 1);
      const deg = THREE.MathUtils.radToDeg(Math.asin(y));
      if (deg > 35) {
        url = 'https://friends.kylife.ca'; // north pole
      } else if (deg < -35) {
        // south pole: family instance
        url = 'https://family.kylife.ca';
      } else {
        url = 'https://gallery.kylife.ca';
      }
    }
    window.location.href = url;
  }, 1800);
}

// Animation loop
const clock = new THREE.Clock();
function animate() {
  const dt = Math.min(0.033, clock.getDelta());

  // Idle spin for planets
  for (const p of planets) {
    if (p.visible) p.rotation.y += dt * 0.4;
  }

  // Rocket motion
  if (launchInProgress && rocket.visible) {
    // Guidance: nudge rocket to keep steering toward target
    const steer = new THREE.Vector3().subVectors(targetPos, rocket.position).normalize().multiplyScalar(0.02);
    rocketVel.add(steer).clampLength(0, 0.9);
    rocket.position.add(rocketVel);
    rocket.lookAt(new THREE.Vector3().copy(rocket.position).add(rocketVel));

    // Impact detection
    const dist = rocket.position.distanceTo(targetPos);
    if (dist < 4.2) {
      rocket.visible = false;
      launchInProgress = false;
      explode(targetPos);
    }
  }

  // Exploding/shatter animation
  if (exploding) {
    explosionTime += dt;
    const damping = 0.995;
    const gravity = -0.12;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < MAX_PARTS; i++) {
      // Read current matrix
      fragments.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

      // Update velocity and position
      fragVelocity[i].y += gravity * dt;
      fragVelocity[i].multiplyScalar(damping);
      dummy.position.addScaledVector(fragVelocity[i], dt * 12);

      // Spin
      dummy.rotation.x += dt * (0.5 + Math.random() * 1.0);
      dummy.rotation.y += dt * (0.2 + Math.random() * 0.8);

      dummy.updateMatrix();
      fragments.setMatrixAt(i, dummy.matrix);
    }
    fragments.instanceMatrix.needsUpdate = true;

    // Subtle light boost during explosion window
    dir.intensity = 1.2 + Math.sin(Math.min(explosionTime, 1) * Math.PI) * 0.6;
  }

  controls.update();
  // Sun pulse glow
  sunPulse += dt;
  const intensity = 0.9 + Math.sin(sunPulse * 1.5) * 0.1;
  sun.material.color.setHSL(0.12, 0.9, intensity);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Optional: poll a status endpoint for Sun (desktop) metrics
const statusEl = document.getElementById('sun-status');
async function pollStatus() {
  if (!statusEl) return;
  try {
    const base = window.STATUS_BASE || 'https://status.kylife.ca';
    const res = await fetch(base + '/metrics', { cache: 'no-store' });
    if (!res.ok) throw new Error('bad status');
    const j = await res.json();
    statusEl.textContent = `Sun: CPU ${j.cpu}% • RAM ${j.memUsed}/${j.memTotal} • Uptime ${j.uptime}`;
  } catch (e) {
    statusEl.textContent = 'Sun: status offline';
  }
}
pollStatus();
setInterval(pollStatus, 5000);

// Annoy-me button
const annoyBtn = document.getElementById('annoy');
const annoyRes = document.getElementById('annoy-result');
if (annoyBtn) {
  annoyBtn.addEventListener('click', async () => {
    annoyBtn.disabled = true;
    annoyRes.textContent = 'sending…';
    try {
      const base = window.STATUS_BASE || 'https://status.kylife.ca';
      const token = window.ANNOY_TOKEN || 'CHANGE_ME_SECRET';
      const res = await fetch(base + '/notify?token=' + encodeURIComponent(token) + '&reason=annoy', { method: 'POST' });
      if (res.ok) {
        annoyRes.textContent = 'pinged!';
        const discordUrl = window.DISCORD_URL;
        if (discordUrl) {
          setTimeout(() => { window.location.href = discordUrl; }, 600);
        }
      } else {
        annoyRes.textContent = 'failed';
      }
    } catch {
      annoyRes.textContent = 'offline';
    } finally {
      setTimeout(() => { annoyRes.textContent = ''; annoyBtn.disabled = false; }, 2000);
    }
  });
}

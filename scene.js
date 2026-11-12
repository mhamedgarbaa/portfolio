(function(){

const canvas = document.getElementById('bg');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 760;

try {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070d, 0.035);
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

  // Neural-network style point cloud with proximity links
  const N = small ? 70 : 150, R = 13, LINK = 3.6;
  const pos = new Float32Array(N * 3), vel = [];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - .5) * R * 2.2;
    pos[i * 3 + 1] = (Math.random() - .5) * R * 1.4;
    pos[i * 3 + 2] = (Math.random() - .5) * R;
    vel.push(new THREE.Vector3((Math.random() - .5) * .006, (Math.random() - .5) * .006, (Math.random() - .5) * .006));
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: .09, color: 0x67e8f9, transparent: true, opacity: .9, sizeAttenuation: true }));
  const maxSeg = N * 6;
  const lPos = new Float32Array(maxSeg * 6);
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  lGeo.setDrawRange(0, 0);
  const lines = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: .28 }));
  const net = new THREE.Group(); net.add(pts, lines); scene.add(net);

  // Wireframe core shapes
  const core = new THREE.Group();
  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: .35 }));
  const inner = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: .6 }));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, .015, 8, 120), new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: .55 }));
  ring.rotation.x = Math.PI / 2.4;
  core.add(ico, inner, ring);
  core.position.set(small ? 0 : 5.2, 0.4, -2);
  scene.add(core);

  let mx = 0, my = 0, tx = 0, ty = 0, sy = 0, sTarget = 0, running = true;
  addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  addEventListener('scroll', () => { sTarget = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); }, { passive: true });
  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    core.position.x = innerWidth < 760 ? 0 : 5.2;
  });
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(); });

  const clock = new THREE.Clock();
  function updateLinks() {
    let k = 0;
    for (let i = 0; i < N && k < maxSeg; i++) {
      for (let j = i + 1; j < N && k < maxSeg; j++) {
        const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < LINK * LINK) {
          lPos.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]], k * 6); k++;
        }
      }
    }
    lGeo.setDrawRange(0, k * 2);
    lGeo.attributes.position.needsUpdate = true;
  }

  function frame() {
    const t = clock.getElapsedTime();
    for (let i = 0; i < N; i++) {
      for (let a = 0; a < 3; a++) {
        pos[i * 3 + a] += vel[i].getComponent(a);
        const lim = a === 0 ? R * 1.1 : a === 1 ? R * .7 : R * .5;
        if (Math.abs(pos[i * 3 + a]) > lim) vel[i].setComponent(a, -vel[i].getComponent(a));
      }
    }
    pGeo.attributes.position.needsUpdate = true;
    updateLinks();
    sy += (sTarget - sy) * .05; tx += (mx - tx) * .04; ty += (my - ty) * .04;
    net.rotation.y = t * .03 + tx * .5; net.rotation.x = ty * .3 + sy * .8;
    core.rotation.y = t * .18 + sy * 3; core.rotation.x = t * .08;
    inner.rotation.y = -t * .5; ring.rotation.z = t * .25;
    core.position.y = .4 + Math.sin(t * .8) * .25 - sy * 6;
    camera.position.x = tx * 1.5; camera.position.y = -ty * 1 - sy * 3; camera.position.z = 14 - sy * 3;
    camera.lookAt(0, -sy * 3, 0);
    renderer.render(scene, camera);
  }
  function loop() { if (!running) return; frame(); requestAnimationFrame(loop); }
  if (calm) { frame(); } else { loop(); }
} catch (err) {
  console.warn('WebGL background unavailable:', err);
  if (canvas) canvas.remove();
}

})();

// 프로미 월드 공용 화면 톤 — 콘셉트 지도처럼 맑고 밝게. (2026-11-24 의뢰자: "배경톤이 너무 어둡고 칙칙함")
// 사용: import { setupLook, LOOK } from '../assets_3d_env/look.js';  const look = setupLook(THREE, scene, renderer, { preset: 'day' });  매 프레임 look.update(dt, camera)
// preset: 'day'(광장·체험관, 파란 하늘) | 'dawn'(약속산, 캠페인 사이트의 분홍·복숭아빛 새벽 설경)
export const LOOK = {
  day:  { top: '#58b9ff', mid: '#a9dcff', bottom: '#e9f8ff', hemiSky: 0xffffff, hemiGround: 0xd6f0a8, hemi: 1.55, sun: 0xfff1cf, sunI: 1.75, fill: .55, fog: 0xdff3ff, grass: 0x8edb5a, path: 0xf6e3b4, water: 0x5fd0f0 },
  dawn: { top: '#ffb7a8', mid: '#ffd1c2', bottom: '#fff0e2', hemiSky: 0xfff3ee, hemiGround: 0xe9e0ff, hemi: 1.6, sun: 0xffe2b8, sunI: 1.6, fill: .6, fog: 0xffe6dc, grass: 0xf6f3ff, path: 0xf3d9b0, water: 0xbfe6f7 }
};
export function setupLook(THREE, scene, renderer, opt = {}) {
  const P = LOOK[opt.preset || 'day'];
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
  // 하늘: 세로 그러데이션 돔
  const cv = document.createElement('canvas'); cv.width = 4; cv.height = 256; const c = cv.getContext('2d'); const g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, P.top); g.addColorStop(.55, P.mid); g.addColorStop(1, P.bottom); c.fillStyle = g; c.fillRect(0, 0, 4, 256);
  const st = new THREE.CanvasTexture(cv); st.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 24, 16), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -10; scene.add(sky); scene.background = null;
  scene.fog = new THREE.Fog(P.fog, opt.fogNear || 120, opt.fogFar || 520);
  // 조명: 어두운 면이 생기지 않게 반구광을 넉넉히
  const hemi = new THREE.HemisphereLight(P.hemiSky, P.hemiGround, P.hemi); scene.add(hemi);
  const sun = new THREE.DirectionalLight(P.sun, P.sunI); sun.position.set(40, 80, 50); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, P.fill); fill.position.set(-30, 30, 60); scene.add(fill);
  // 뭉게구름
  const ccv = document.createElement('canvas'); ccv.width = 256; ccv.height = 128; const k = ccv.getContext('2d'); k.fillStyle = '#fff';
  [[70, 80, 42], [118, 62, 54], [170, 78, 44], [96, 92, 40], [150, 94, 40]].forEach(([x, y, r]) => { k.beginPath(); k.arc(x, y, r, 0, 7); k.fill(); });
  const ct = new THREE.CanvasTexture(ccv); ct.colorSpace = THREE.SRGBColorSpace; const clouds = [];
  for (let i = 0; i < (opt.clouds ?? 9); i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, transparent: true, opacity: .95, fog: false, depthWrite: false })); const a = i / 9 * Math.PI * 2 + Math.random(), r = 300 + Math.random() * 260;
    s.position.set(Math.cos(a) * r, 120 + Math.random() * 110, Math.sin(a) * r); const w = 110 + Math.random() * 110; s.scale.set(w, w * .5, 1); scene.add(s); clouds.push(s); }
  return { sky, hemi, sun, fill, clouds, colors: P, update(dt, cam) { sky.position.copy(cam.position); clouds.forEach(s => { s.position.x += dt * 1.2; if (s.position.x > 600) s.position.x = -600; }); } };
}

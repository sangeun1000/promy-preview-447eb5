/* 프로미 월드 배경음악 (광장·안전체험관 공용) — 파일 없이 브라우저에서 합성.
   사용: <script src="../assets_promy/bgm.js" data-mood="plaza|hall"></script>
   · 첫 클릭/키/터치 때 시작(브라우저 자동재생 규칙)
   · 세 월드 공용 소리 설정(localStorage 'yaksok-sound' = on/off)을 따라 켜고 끈다
   · 바람 같은 잡음은 쓰지 않는다 */
(function () {
  var me = document.currentScript, MOOD = (me && me.dataset.mood) || 'plaza';
  // 곡 설정: 코드 진행(근음 기준 반음), 템포, 멜로디 음계
  var SONG = {
    plaza: { bpm: 92, key: 60, prog: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], scale: [0, 2, 4, 7, 9, 12, 14, 16], vol: .16 },
    hall: { bpm: 108, key: 62, prog: [[0, 4, 7], [5, 9, 12], [-3, 0, 4], [7, 11, 14]], scale: [0, 2, 4, 5, 7, 9, 12, 14], vol: .15 }
  }[MOOD] || null;
  if (!SONG) return;
  var AC = null, OUT = null, on = true, step = 0, nextT = 0;
  function readOn() { try { return localStorage.getItem('yaksok-sound') !== 'off' } catch (e) { return true } }
  var hz = function (m) { return 440 * Math.pow(2, (m - 69) / 12) };
  function note(m, t, d, type, v) {
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = hz(m);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .02);
    g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(OUT); o.start(t); o.stop(t + d + .05);
  }
  function pad(ch, t, d) {
    ch.forEach(function (n) {
      var o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
      o.type = 'triangle'; o.frequency.value = hz(SONG.key - 12 + n); f.type = 'lowpass'; f.frequency.value = 1200;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .4); g.gain.setValueAtTime(.05, t + d - .4); g.gain.linearRampToValueAtTime(0, t + d);
      o.connect(f); f.connect(g); g.connect(OUT); o.start(t); o.stop(t + d + .05);
    });
  }
  var mel = 2;
  function tick() {
    if (!AC) return;
    var beat = 60 / SONG.bpm / 2; // 8분음표
    if (nextT < AC.currentTime) nextT = AC.currentTime + .05;
    while (nextT < AC.currentTime + .25) {
      var bar = Math.floor(step / 8), s8 = step % 8, ch = SONG.prog[bar % SONG.prog.length];
      if (s8 === 0) {
        pad(ch, nextT, beat * 8);
        note(SONG.key - 24 + ch[0], nextT, beat * 3.5, 'sine', .14);           // 베이스
      }
      if (s8 === 4) note(SONG.key - 24 + ch[0] + 7, nextT, beat * 3, 'sine', .1);
      // 통통 튀는 멜로디(마림바 느낌)
      var play = MOOD === 'hall' ? (s8 % 2 === 0 || Math.random() < .35) : (s8 % 2 === 0 && Math.random() < .85);
      if (play) {
        mel = Math.max(0, Math.min(SONG.scale.length - 1, mel + [-1, 1, 1, -2, 2, 0][Math.floor(Math.random() * 6)]));
        var m = SONG.key + SONG.scale[mel];
        note(m, nextT, beat * 1.6, 'triangle', .09);
        note(m + 12, nextT, beat * .8, 'sine', .025);
      }
      if (MOOD === 'hall' && (s8 === 2 || s8 === 6)) note(SONG.key + 24 + ch[1], nextT, beat * .4, 'square', .012);
      nextT += beat; step++;
    }
  }
  function apply() { on = readOn(); if (OUT) OUT.gain.setTargetAtTime(on ? SONG.vol : 0, AC.currentTime, .3) }
  function start() {
    if (AC) { if (AC.state === 'suspended') AC.resume(); return }
    try { AC = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { return }
    OUT = AC.createGain(); OUT.gain.value = 0; OUT.connect(AC.destination);
    nextT = AC.currentTime + .1; setInterval(tick, 100); apply();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { addEventListener(ev, start, { capture: true, passive: true }) });
  setInterval(function () { if (AC && readOn() !== on) apply() }, 400);              // 🔊 버튼으로 바뀐 설정 따라가기
  document.addEventListener('visibilitychange', function () { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume() });
  window.PROMY_BGM = { start: start };
})();

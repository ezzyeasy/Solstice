/**
 * SOLSTICE // The 24-Hour Time-Shift Slider Experience
 * Controls the arc of the sun, moon, atmospheric sky, and architectural lighting.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const timeSlider = document.getElementById('timeSlider');
  const clockDisplay = document.getElementById('clockDisplay');
  const phaseDisplay = document.getElementById('phaseDisplay');
  const timeBubble = document.getElementById('timeBubble');
  const bubbleTime = document.getElementById('bubbleTime');
  const sunOrb = document.getElementById('sunOrb');
  const moonOrb = document.getElementById('moonOrb');
  const starsLayer = document.getElementById('starsLayer');
  const skyAtmosphere = document.getElementById('skyAtmosphere');

  // Lighting Layers
  const layerMorning = document.getElementById('layerMorning');
  const layerNoon = document.getElementById('layerNoon');
  const layerSunset = document.getElementById('layerSunset');
  const layerNight = document.getElementById('layerNight');
  const interiorGlow = document.getElementById('interiorGlow');

  // Caption & Info
  const ambientTemp = document.getElementById('ambientTemp');
  const ambientMood = document.getElementById('ambientMood');
  const markerBtns = Array.from(document.querySelectorAll('.marker-btn'));

  // Autoplay Cycle
  const cycleBtn = document.getElementById('cycleBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const cycleLabel = document.getElementById('cycleLabel');

  let isPlaying = false;
  let animationFrameId = null;

  // -------------------------------------------------------------------------
  // Helper: Format minutes into HH:MM (24h)
  // -------------------------------------------------------------------------
  function formatTime(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const hh = String(hrs).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // -------------------------------------------------------------------------
  // Core Update Function: Maps minutes (0 to 1440) to lighting & sky
  // -------------------------------------------------------------------------
  function updateTimeExperience(minutes) {
    const m = parseInt(minutes, 10);
    const timeStr = formatTime(m);
    
    // 1. Text readouts & bubble
    clockDisplay.textContent = timeStr;
    bubbleTime.textContent = timeStr;
    
    // Position floating bubble along slider thumb
    const percent = (m / 1440) * 100;
    timeBubble.style.left = `${percent}%`;

    // 2. Celestial Arc: Sun (Daytime: 05:30 [330m] to 20:00 [1200m])
    const sunrise = 330;
    const sunset = 1200;

    if (m >= sunrise && m <= sunset) {
      // Daytime: Sun is visible
      const dayProgress = (m - sunrise) / (sunset - sunrise);
      const sunX = 10 + dayProgress * 80; // 10% to 90%
      const sunY = 75 - Math.sin(dayProgress * Math.PI) * 60; // Peak at 15% top

      sunOrb.style.opacity = '1';
      sunOrb.style.left = `${sunX}%`;
      sunOrb.style.top = `${sunY}%`;
    } else {
      // Sun is below the horizon
      sunOrb.style.opacity = '0';
    }

    // Celestial Arc: Moon (Nighttime: 19:30 [1170m] to 06:30 [390m])
    const moonRise = 1170;
    const moonSet = 390;
    let isMoonTime = false;
    let moonProgress = 0;

    if (m >= moonRise) {
      isMoonTime = true;
      moonProgress = (m - moonRise) / 660; // 660 total night minutes
    } else if (m <= moonSet) {
      isMoonTime = true;
      moonProgress = (m + (1440 - moonRise)) / 660;
    }

    if (isMoonTime) {
      const moonX = 15 + moonProgress * 70;
      const moonY = 70 - Math.sin(moonProgress * Math.PI) * 50;
      moonOrb.style.opacity = '1';
      moonOrb.style.left = `${moonX}%`;
      moonOrb.style.top = `${moonY}%`;
    } else {
      moonOrb.style.opacity = '0';
    }

    // 3. Lighting Overlay Blend Calculations
    let mornOp = 0, noonOp = 0, sunOp = 0, nightOp = 0, intGlow = 0;
    let skyBg = '';
    let accentCol = '#f59e0b';
    let phaseName = 'DAYLIGHT';
    let tempText = '24°C • Calm';
    let moodText = 'Clear sky across the horizon';

    if (m >= 0 && m < 300) {
      // Deep Night (00:00 - 05:00)
      nightOp = 0.9;
      intGlow = 0.85;
      starsLayer.style.opacity = '0.9';
      skyBg = 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 45%, #020617 85%)';
      accentCol = '#38bdf8';
      phaseName = 'MIDNIGHT • STARLIT';
      tempText = '14°C • Starlit Silence';
      moodText = 'Canyon immersed in celestial night and deep obsidian shadows';
    } 
    else if (m >= 300 && m < 480) {
      // Dawn / First Light (05:00 - 08:00)
      const prog = (m - 300) / 180;
      mornOp = Math.sin(prog * Math.PI) * 0.85;
      nightOp = (1 - prog) * 0.85;
      intGlow = (1 - prog) * 0.7;
      starsLayer.style.opacity = `${(1 - prog) * 0.8}`;
      skyBg = 'radial-gradient(circle at 50% 30%, #f472b6 0%, #fb923c 35%, #1e1b4b 80%)';
      accentCol = '#f472b6';
      phaseName = 'DAWN • FIRST LIGHT';
      tempText = '17°C • Fresh Dawn Breeze';
      moodText = 'Pastel hues spilling over the mountains as the sun awakens';
    } 
    else if (m >= 480 && m < 660) {
      // Morning (08:00 - 11:00)
      const prog = (m - 480) / 180;
      mornOp = (1 - prog) * 0.4;
      noonOp = prog * 0.45;
      starsLayer.style.opacity = '0';
      intGlow = 0;
      skyBg = 'radial-gradient(circle at 50% 15%, #bae6fd 0%, #38bdf8 45%, #0284c7 90%)';
      accentCol = '#0ea5e9';
      phaseName = 'MORNING • CLARITY';
      tempText = '23°C • Clear Air';
      moodText = 'Crisp sunlight illuminating the architecture';
    } 
    else if (m >= 660 && m < 960) {
      // High Noon (11:00 - 16:00)
      noonOp = 0.55;
      starsLayer.style.opacity = '0';
      intGlow = 0;
      skyBg = 'radial-gradient(circle at 50% 10%, #ffffff 0%, #38bdf8 35%, #0369a1 85%)';
      accentCol = '#eab308';
      phaseName = 'HIGH NOON • RADIANCE';
      tempText = '31°C • Zenith Heat';
      moodText = 'Sun at its zenith casting razor-sharp architectural shadows';
    } 
    else if (m >= 960 && m < 1140) {
      // Golden Hour / Sunset (16:00 - 19:00)
      const prog = (m - 960) / 180;
      noonOp = (1 - prog) * 0.3;
      sunOp = prog * 0.85;
      intGlow = prog * 0.75;
      starsLayer.style.opacity = '0';
      skyBg = 'radial-gradient(circle at 75% 25%, #fdba74 0%, #ea580c 40%, #1e1b4b 85%)';
      accentCol = '#f59e0b';
      phaseName = 'GOLDEN HOUR • SUNSET';
      tempText = '27°C • Amber Glow';
      moodText = 'Warm golden light bathing the surfaces before nightfall';
    } 
    else if (m >= 1140 && m < 1290) {
      // Twilight / Dusk (19:00 - 21:30)
      const prog = (m - 1140) / 150;
      sunOp = (1 - prog) * 0.8;
      nightOp = prog * 0.75;
      intGlow = 0.85;
      starsLayer.style.opacity = `${prog * 0.7}`;
      skyBg = 'radial-gradient(circle at 65% 20%, #a855f7 0%, #4338ca 40%, #090d16 85%)';
      accentCol = '#a855f7';
      phaseName = 'TWILIGHT • DUSK';
      tempText = '21°C • Cool Descent';
      moodText = 'The last embers of daylight fade as sanctuary lights illuminate';
    } 
    else {
      // Late Night (21:30 - 24:00)
      nightOp = 0.88;
      intGlow = 0.85;
      starsLayer.style.opacity = '0.9';
      skyBg = 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 45%, #020617 85%)';
      accentCol = '#38bdf8';
      phaseName = 'NIGHT • REST';
      tempText = '16°C • Nocturnal Quiet';
      moodText = 'Silent starlight reflected peacefully across the still waters';
    }

    // Apply layers opacity
    layerMorning.style.opacity = String(mornOp);
    layerNoon.style.opacity = String(noonOp);
    layerSunset.style.opacity = String(sunOp);
    layerNight.style.opacity = String(nightOp);
    interiorGlow.style.opacity = String(intGlow);

    // Apply atmosphere colors
    skyAtmosphere.style.background = skyBg;
    phaseDisplay.textContent = phaseName;
    ambientTemp.textContent = tempText;
    ambientMood.textContent = moodText;

    // Apply theme variable
    document.documentElement.style.setProperty('--accent-color', accentCol);
    document.documentElement.style.setProperty('--accent-glow', `${accentCol}66`);

    // 4. Update Marker active highlights
    markerBtns.forEach(btn => {
      const bTime = parseInt(btn.dataset.time, 10);
      const isClose = Math.abs(bTime - m) < 90;
      btn.classList.toggle('active', isClose);
    });
  }

  // -------------------------------------------------------------------------
  // Slider Input Listener
  // -------------------------------------------------------------------------
  timeSlider.addEventListener('input', (e) => {
    updateTimeExperience(e.target.value);
  });

  // Marker Clicks
  markerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTime = parseInt(btn.dataset.time, 10);
      timeSlider.value = targetTime;
      updateTimeExperience(targetTime);
    });
  });

  // Keyboard Navigation (Left / Right Arrow)
  window.addEventListener('keydown', (e) => {
    let currentVal = parseInt(timeSlider.value, 10);
    if (e.key === 'ArrowRight') {
      currentVal = Math.min(1440, currentVal + 15);
      timeSlider.value = currentVal;
      updateTimeExperience(currentVal);
    } else if (e.key === 'ArrowLeft') {
      currentVal = Math.max(0, currentVal - 15);
      timeSlider.value = currentVal;
      updateTimeExperience(currentVal);
    } else if (e.key === ' ') {
      e.preventDefault();
      cycleBtn.click();
    }
  });

  // -------------------------------------------------------------------------
  // Autoplay 24H Cycle
  // -------------------------------------------------------------------------
  function cycleStep() {
    if (!isPlaying) return;
    let current = parseInt(timeSlider.value, 10);
    current = (current + 3) % 1440; // Increment 3 minutes each frame
    timeSlider.value = current;
    updateTimeExperience(current);
    animationFrameId = requestAnimationFrame(cycleStep);
  }

  cycleBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      cycleLabel.textContent = 'Pause';
      animationFrameId = requestAnimationFrame(cycleStep);
    } else {
      pauseIcon.classList.add('hidden');
      playIcon.classList.remove('hidden');
      cycleLabel.textContent = 'Play 24H';
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  });

  // -------------------------------------------------------------------------
  // Initial Boot: Set to Golden Hour (18:30 = 1110 minutes)
  // -------------------------------------------------------------------------
  updateTimeExperience(timeSlider.value);
});

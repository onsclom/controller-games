const audioContext = new AudioContext();
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

export function playHitSound() {
  const osc = audioContext.createOscillator();
  osc.connect(masterGain);
  osc.frequency.value = 440;
  osc.type = "triangle";
  osc.start();
  osc.stop(audioContext.currentTime + 0.025);
}

export function playBounceSound() {
  const osc = audioContext.createOscillator();
  osc.connect(masterGain);
  osc.frequency.value = 220;
  osc.type = "sine";
  osc.start();
  osc.stop(audioContext.currentTime + 0.025);
}

export function playScoreSound() {
  const osc = audioContext.createOscillator();
  osc.connect(masterGain);
  osc.frequency.value = 880;
  osc.type = "sine";
  osc.start();
  osc.stop(audioContext.currentTime + 0.025);
}

export function playMenuChangeSound() {
  const osc = audioContext.createOscillator();
  osc.connect(masterGain);
  osc.frequency.value = 440;
  osc.type = "sine";
  osc.start();
  osc.stop(audioContext.currentTime + 0.025);
}

// fixes:
// The AudioContext was not allowed to start.
// It must be resumed (or created) after a user gesture on the page.
// https://goo.gl/7K7WLu

document.body.onclick = () => audioContext.resume();
// on gamepad connected too
window.addEventListener("gamepadconnected", () => audioContext.resume());

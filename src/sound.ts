const audioContext = new AudioContext();
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

export function playSound(props: {
  type: "sine" | "triangle" | "sawtooth" | "square";
  frequency: number;
  duration: number;
}) {
  const osc = audioContext.createOscillator();
  osc.connect(masterGain);
  osc.frequency.value = props.frequency;
  osc.type = props.type;
  osc.start();
  osc.stop(audioContext.currentTime + props.duration);
}

// TODO: inline playSound and remove game specific sounds?

export function playHitSound() {
  playSound({
    type: "triangle",
    frequency: 440,
    duration: 0.025,
  });
}

export function playBounceSound() {
  playSound({
    type: "sine",
    frequency: 220,
    duration: 0.025,
  });
}

export function playScoreSound() {
  playSound({
    type: "sine",
    frequency: 880,
    duration: 0.025,
  });
}

export function playMenuChangeSound() {
  playSound({
    type: "sine",
    frequency: 440,
    duration: 0.025,
  });
}

// fixes:
// The AudioContext was not allowed to start.
// It must be resumed (or created) after a user gesture on the page.
// https://goo.gl/7K7WLu

// on gamepad connected too
document.body.onclick = () => audioContext.resume();
window.addEventListener("gamepadconnected", () => audioContext.resume());

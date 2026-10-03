import { CardRarity } from "../types/game";

type AudioSession = {
  context: AudioContext;
  master: GainNode;
};

let activeSession: AudioSession | null = null;

const scheduleTone = (session: AudioSession, frequency: number, start: number, duration: number, volume: number, type: OscillatorType = "sine") => {
  const oscillator = session.context.createOscillator();
  const gain = session.context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(.06, duration / 3));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(session.master);
  oscillator.start(start);
  oscillator.stop(start + duration + .03);
};

export const startGachaMusic = (enabled: boolean) => {
  stopGachaMusic();
  if (!enabled) return;
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.setValueAtTime(.0001, context.currentTime);
  master.gain.exponentialRampToValueAtTime(.5, context.currentTime + .35);
  master.connect(context.destination);
  const session = { context, master };
  activeSession = session;

  void context.resume().then(() => {
    if (activeSession !== session || context.state !== "running") return;
    const notes = [523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 739.99];
    const bass = [130.81, 146.83, 110, 123.47];
    const start = context.currentTime + .03;
    scheduleTone(session, 783.99, start, .18, .16, "triangle");
    scheduleTone(session, 1046.5, start + .1, .4, .12, "sine");
    for (let step = 0; step < 160; step += 1) {
      const at = start + .5 + step * .3;
      scheduleTone(session, notes[step % notes.length], at, .27, .105, step % 2 ? "triangle" : "sine");
      if (step % 2 === 0) scheduleTone(session, notes[(step + 2) % notes.length] * 2, at + .07, .15, .045, "triangle");
      if (step % 8 === 0) {
        const root = bass[(step / 8) % bass.length];
        scheduleTone(session, root, at, 2.2, .08, "sine");
        scheduleTone(session, root * 1.5, at, 1.6, .04, "sine");
      }
    }
  }).catch(() => stopGachaMusic());
};

export const playGachaRevealSound = (rarity: CardRarity) => {
  const session = activeSession;
  if (!session || session.context.state === "closed") return;
  const start = session.context.currentTime + .02;
  const chord = rarity === 4 ? [523.25, 659.25, 783.99, 1046.5] : rarity === 3 ? [392, 493.88, 587.33] : [329.63, 440];
  chord.forEach((frequency, index) => scheduleTone(session, frequency, start + index * .085, rarity === 4 ? .85 : .48, rarity === 4 ? .11 : .07, index % 2 ? "triangle" : "sine"));
};

export const stopGachaMusic = () => {
  const session = activeSession;
  activeSession = null;
  if (!session || session.context.state === "closed") return;
  const now = session.context.currentTime;
  session.master.gain.cancelScheduledValues(now);
  session.master.gain.setValueAtTime(Math.max(session.master.gain.value, .0001), now);
  session.master.gain.exponentialRampToValueAtTime(.0001, now + .35);
  window.setTimeout(() => void session.context.close(), 420);
};

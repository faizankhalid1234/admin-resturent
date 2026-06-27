import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const wavPath = path.resolve(publicDir, "alert.wav");
const ringtonePath = path.resolve(publicDir, "original_iphone.mp3");

const sampleRate = 44100;
const duration = 1.2;
const numSamples = Math.floor(sampleRate * duration);
const dataSize = numSamples * 2;
const wavBuffer = Buffer.alloc(44 + dataSize);

function writeTone(startSec, lenSec, freq, volume) {
  const start = Math.floor(startSec * sampleRate);
  const end = Math.min(numSamples, start + Math.floor(lenSec * sampleRate));
  for (let i = start; i < end; i++) {
    const t = (i - start) / sampleRate;
    const env = Math.min(1, t / 0.02) * Math.max(0, 1 - (t - lenSec + 0.08) / 0.12);
    const sample = Math.sin(2 * Math.PI * freq * t) * volume * env;
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32767)));
    wavBuffer.writeInt16LE(intSample, 44 + i * 2);
  }
}

wavBuffer.write("RIFF", 0);
wavBuffer.writeUInt32LE(36 + dataSize, 4);
wavBuffer.write("WAVE", 8);
wavBuffer.write("fmt ", 12);
wavBuffer.writeUInt32LE(16, 16);
wavBuffer.writeUInt16LE(1, 20);
wavBuffer.writeUInt16LE(1, 22);
wavBuffer.writeUInt32LE(sampleRate, 24);
wavBuffer.writeUInt32LE(sampleRate * 2, 28);
wavBuffer.writeUInt16LE(2, 32);
wavBuffer.writeUInt16LE(16, 34);
wavBuffer.write("data", 36);
wavBuffer.writeUInt32LE(dataSize, 40);

writeTone(0, 0.35, 880, 0.55);
writeTone(0.42, 0.45, 659.25, 0.6);
writeTone(0.9, 0.25, 523.25, 0.35);

fs.writeFileSync(wavPath, wavBuffer);
console.log("Created", wavPath);

if (fs.existsSync(ringtonePath)) {
  console.log("Using custom ringtone:", ringtonePath);
} else {
  console.warn(
    "Missing admin/public/original_iphone.mp3 — add your iPhone ringtone there for the order alert."
  );
}

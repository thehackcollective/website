import { useSyncExternalStore } from 'react'
import { createListeners } from '@/lib/listeners'
import { readStored, writeStored } from '@/lib/stored'

type Wave = 'sine' | 'square' | 'triangle'
type Source = { type: Wave; frequency: number | { start: number; end: number } } | { type: 'noise' }
type Layer = {
  source: Source
  filter?: { type: BiquadFilterType; frequency: number; resonance?: number }
  delay?: number
  vary?: number
  attack: number
  decay: number
  release?: number
  gain: number
}

export type SoundName =
  | 'press'
  | 'tick'
  | 'release'
  | 'page'
  | 'pulse'
  | 'click'
  | 'key'
  | 'keyTick'
  | 'chime'

const soundPresets: Readonly<Record<SoundName, readonly Layer[]>> = {
  press: [
    {
      source: { type: 'noise' },
      filter: { type: 'highpass', frequency: 2400 },
      attack: 0.0003,
      decay: 0.009,
      gain: 0.13,
    },
    {
      source: { type: 'sine', frequency: 680 },
      attack: 0.0006,
      decay: 0.022,
      release: 0.008,
      gain: 0.24,
    },
  ],
  tick: [
    {
      source: { type: 'square', frequency: 2100 },
      filter: { type: 'bandpass', frequency: 2600, resonance: 1.6 },
      attack: 0.0004,
      decay: 0.028,
      gain: 0.24,
    },
  ],
  release: [
    {
      source: { type: 'noise' },
      filter: { type: 'lowpass', frequency: 1600, resonance: 0.9 },
      attack: 0.001,
      decay: 0.055,
      gain: 0.32,
    },
  ],
  page: [
    {
      source: { type: 'sine', frequency: { start: 430, end: 640 } },
      attack: 0.002,
      decay: 0.11,
      release: 0.03,
      gain: 0.4,
    },
  ],
  pulse: [
    {
      source: { type: 'sine', frequency: 330 },
      filter: { type: 'lowpass', frequency: 2200 },
      attack: 0.002,
      decay: 0.13,
      release: 0.04,
      gain: 0.5,
    },
  ],
  click: [
    {
      source: { type: 'sine', frequency: { start: 760, end: 280 } },
      attack: 0.002,
      decay: 0.022,
      gain: 0.22,
    },
  ],
  key: [
    {
      source: { type: 'noise' },
      filter: { type: 'bandpass', frequency: 3400, resonance: 3 },
      vary: 0.2,
      attack: 0.0005,
      decay: 0.028,
      gain: 1.1,
    },
    {
      source: { type: 'triangle', frequency: 250 },
      vary: 0.1,
      attack: 0.0005,
      decay: 0.04,
      gain: 0.25,
    },
  ],
  keyTick: [
    {
      source: { type: 'noise' },
      filter: { type: 'bandpass', frequency: 5200, resonance: 3 },
      attack: 0.0005,
      decay: 0.02,
      gain: 0.56,
    },
  ],
  chime: [
    { source: { type: 'sine', frequency: 659.25 }, attack: 0.02, decay: 0.8, gain: 0.25 },
    {
      source: { type: 'sine', frequency: 987.77 },
      delay: 0.12,
      attack: 0.02,
      decay: 0.8,
      gain: 0.25,
    },
    {
      source: { type: 'sine', frequency: 1318.5 },
      delay: 0.24,
      attack: 0.02,
      decay: 0.8,
      gain: 0.25,
    },
  ],
}

const { subscribe, notify } = createListeners()
let enabled: boolean | null = null

function soundOn(): boolean {
  if (enabled === null) {
    const stored = readStored('sound')
    enabled =
      stored === null
        ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : stored === '1'
  }
  return enabled
}

export const useSoundOn = () => useSyncExternalStore(subscribe, soundOn, () => false)

export function setSoundOn(next: boolean) {
  enabled = next
  writeStored('sound', next ? '1' : '0')
  notify()
}

const masterGain = 0.32

let context: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null

function ready() {
  if (context === null || context.state === 'closed') {
    context = new AudioContext({ latencyHint: 'interactive' })
    master = context.createGain()
    master.gain.value = masterGain
    master.connect(context.destination)
    noise = null
  }
  if (context.state === 'suspended') {
    const ctx = context
    void ctx.resume().catch((error: unknown) => {
      if (ctx.state !== 'closed') throw error
      if (context === ctx) {
        context = null
        master = null
        noise = null
      }
    })
  }
  return context
}

function noiseBuffer(ctx: AudioContext) {
  if (noise !== null) return noise
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.3), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  noise = buffer
  return buffer
}

function varied(value: number, vary = 0) {
  return value * (1 + (Math.random() * 2 - 1) * vary)
}

export function playSound(name: SoundName, level = 1) {
  if (typeof window === 'undefined' || !soundOn()) return
  const ctx = ready()
  const out = master
  if (out === null) return
  for (const layer of soundPresets[name]) {
    const start = ctx.currentTime + (layer.delay ?? 0)
    const env = ctx.createGain()
    const peak = varied(layer.gain, layer.vary) * level
    const duration = layer.attack + layer.decay + (layer.release ?? 0)
    env.gain.setValueAtTime(0.0001, start)
    if (layer.attack > 0) env.gain.linearRampToValueAtTime(peak, start + layer.attack)
    else env.gain.setValueAtTime(peak, start)
    env.gain.setTargetAtTime(0.0001, start + layer.attack, layer.decay / 3)
    let node: AudioScheduledSourceNode
    if (layer.source.type === 'noise') {
      const src = ctx.createBufferSource()
      src.buffer = noiseBuffer(ctx)
      node = src
    } else {
      const osc = ctx.createOscillator()
      osc.type = layer.source.type
      const f = layer.source.frequency
      if (typeof f === 'number') osc.frequency.setValueAtTime(varied(f, layer.vary), start)
      else {
        osc.frequency.setValueAtTime(f.start, start)
        osc.frequency.exponentialRampToValueAtTime(Math.max(f.end, 1), start + duration)
      }
      node = osc
    }
    let tail: AudioNode = node
    if (layer.filter !== undefined) {
      const filter = ctx.createBiquadFilter()
      filter.type = layer.filter.type
      filter.frequency.setValueAtTime(varied(layer.filter.frequency, layer.vary), start)
      filter.Q.value = layer.filter.resonance ?? 1
      tail.connect(filter)
      tail = filter
    }
    tail.connect(env)
    env.connect(out)
    node.start(start)
    node.stop(start + duration + 0.1)
    node.onended = () => env.disconnect()
  }
}

import type { Landmark, GestureResult, GestureName } from '../types'

const FINGER_TIPS = [8, 12, 16, 20] as const
const FINGER_PIPS = [6, 10, 14, 18] as const
const THUMB_TIP = 4
const THUMB_IP = 3
const WRIST = 0
const PALM_BASE = 9

/** Min time (ms) hand must hold a pose before we emit the gesture */
const HOLD_THRESHOLD_MS = 300
/** Max landmark drift (normalised) while holding — allows small tremors */
const DRIFT_TOLERANCE = 0.045

function dist(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function isFingerExtended(lm: Landmark[], tip: number, pip: number): boolean {
  return dist(lm[tip], lm[WRIST]) > dist(lm[pip], lm[WRIST]) * 1.05
}

function isThumbExtended(lm: Landmark[]): boolean {
  return dist(lm[THUMB_TIP], lm[WRIST]) > dist(lm[THUMB_IP], lm[WRIST]) * 1.1
}

function fingerSpread(lm: Landmark[]): number {
  const tips = [8, 12, 16, 20]
  let total = 0
  for (let i = 0; i < tips.length - 1; i++) {
    total += dist(lm[tips[i]], lm[tips[i + 1]])
  }
  return total
}

function fingertipCluster(lm: Landmark[]): number {
  const tips = [4, 8, 12, 16, 20]
  const palm = lm[PALM_BASE]
  let total = 0
  for (const t of tips) total += dist(lm[t], palm)
  return total / tips.length
}

/* ── Stability tracker ───────────────────────────────────── */
let prevGesture: GestureName | null = null
let holdStart = 0
let prevWrist: Landmark | null = null
let confirmed = false          // whether the current hold already fired

function palmCenter(lm: Landmark[]): Landmark {
  return lm[PALM_BASE]        // stable reference point
}

function resetHold() {
  prevGesture = null
  holdStart = 0
  prevWrist = null
  confirmed = false
}

/* ── Public API ──────────────────────────────────────────── */

export function classifyGesture(landmarks: Landmark[]): GestureResult | null {
  if (!landmarks || landmarks.length < 21) {
    resetHold()
    return null
  }

  const extendedCount = FINGER_TIPS.reduce(
    (c, tip, i) => c + (isFingerExtended(landmarks, tip, FINGER_PIPS[i]) ? 1 : 0),
    0,
  )

  const thumbOut = isThumbExtended(landmarks)
  const totalExtended = extendedCount + (thumbOut ? 1 : 0)
  const spread = fingerSpread(landmarks)
  const cluster = fingertipCluster(landmarks)
  const handSize = dist(landmarks[WRIST], landmarks[PALM_BASE])

  let detected: GestureResult | null = null

  // TIGER seal: index + middle extended & close together, ring + pinky curled
  const indexOut = isFingerExtended(landmarks, 8, 6)
  const middleOut = isFingerExtended(landmarks, 12, 10)
  const ringOut = isFingerExtended(landmarks, 16, 14)
  const pinkyOut = isFingerExtended(landmarks, 20, 18)
  const indexMiddleGap = dist(landmarks[8], landmarks[12])

  if (
    indexOut && middleOut && !ringOut && !pinkyOut &&
    indexMiddleGap < handSize * 0.5
  ) {
    const tightness = 1 - indexMiddleGap / (handSize * 0.5)
    const raw = 0.6 + tightness * 0.4
    detected = { gesture: 'TIGER', confidence: Math.round(Math.min(1, raw) * 100) }
  } else if (totalExtended >= 4 && spread > handSize * 0.8) {
    const raw = (totalExtended / 5) * Math.min(1, spread / (handSize * 1.2))
    detected = { gesture: 'PALM', confidence: Math.round(Math.min(1, raw) * 100) }
  } else if (totalExtended <= 1 && cluster < handSize * 0.9) {
    const tightness = 1 - cluster / (handSize * 1.2)
    const raw = Math.max(0, tightness + (totalExtended === 0 ? 0.2 : 0))
    detected = { gesture: 'FIST', confidence: Math.round(Math.min(1, raw) * 100) }
  }

  if (!detected) {
    resetHold()
    return null
  }

  /* ── Check stability ──────────────────────────────────── */
  const now = Date.now()
  const centre = palmCenter(landmarks)

  // Gesture type changed → restart hold timer
  if (detected.gesture !== prevGesture) {
    prevGesture = detected.gesture
    holdStart = now
    prevWrist = centre
    confirmed = false
    return null
  }

  // Hand moved too much → restart timer
  if (prevWrist && dist(centre, prevWrist) > DRIFT_TOLERANCE) {
    holdStart = now
    prevWrist = centre
    confirmed = false
    return null
  }

  prevWrist = centre

  // Still within the hold threshold → suppress
  if (now - holdStart < HOLD_THRESHOLD_MS) {
    return null
  }

  // Pose held long enough — emit (and keep emitting while held)
  confirmed = true
  return detected
}

import type { GestureResult, JutsuName, AttackEvent } from '../types'
import { JUTSU_MAP } from '../types'

const COMBO_WINDOW_MS = 1500
const COOLDOWN_MS = 2000

interface PendingInput {
  gesture: GestureResult | null
  gestureTime: number
  voice: JutsuName | null
  voiceConfidence: number
  voiceTime: number
}

export function createAttackResolver(onAttack: (event: AttackEvent) => void) {
  const pending: PendingInput = {
    gesture: null,
    gestureTime: 0,
    voice: null,
    voiceConfidence: 0,
    voiceTime: 0,
  }

  let lastFireTime = 0

  function tryResolve() {
    const now = Date.now()
    if (now - lastFireTime < COOLDOWN_MS) return

    const hasGesture = pending.gesture !== null && (now - pending.gestureTime < COMBO_WINDOW_MS)
    const hasVoice = pending.voice !== null && (now - pending.voiceTime < COMBO_WINDOW_MS)

    if (!hasGesture && !hasVoice) return

    let jutsu: JutsuName | null = null
    let gestureScore = 0
    let voiceScore = 0

    if (hasGesture && pending.gesture) {
      const mappedJutsu = JUTSU_MAP[pending.gesture.gesture]
      gestureScore = pending.gesture.confidence / 100

      if (hasVoice && pending.voice === mappedJutsu) {
        jutsu = mappedJutsu
        voiceScore = pending.voiceConfidence
      } else if (hasVoice && pending.voice !== mappedJutsu) {
        jutsu = pending.voice
        voiceScore = pending.voiceConfidence
        gestureScore = 0
      } else {
        jutsu = mappedJutsu
      }
    } else if (hasVoice && pending.voice) {
      jutsu = pending.voice
      voiceScore = pending.voiceConfidence
    }

    if (!jutsu) return

    const gestureWeight = 0.55
    const voiceWeight = 0.45
    const effectiveness = Math.round(
      (gestureScore * gestureWeight + voiceScore * voiceWeight) * 100,
    )

    onAttack({
      jutsu,
      effectiveness: Math.min(100, Math.max(5, effectiveness)),
      gesture: pending.gesture,
      voiceConfidence: pending.voiceConfidence,
      breakdown: {
        gestureScore: Math.round(gestureScore * 100),
        voiceScore: Math.round(voiceScore * 100),
      },
    })

    lastFireTime = now
    pending.gesture = null
    pending.voice = null
  }

  return {
    feedGesture(result: GestureResult) {
      pending.gesture = result
      pending.gestureTime = Date.now()
      tryResolve()
    },
    feedVoice(keyword: JutsuName, confidence: number) {
      pending.voice = keyword
      pending.voiceConfidence = confidence
      pending.voiceTime = Date.now()
      tryResolve()
    },
  }
}

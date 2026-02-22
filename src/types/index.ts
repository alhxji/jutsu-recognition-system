export interface Landmark {
  x: number
  y: number
  z: number
}

export type GestureName = 'PALM' | 'FIST' | 'TIGER'
export type JutsuName = 'rasengan' | 'chidori' | 'clone'

export interface GestureResult {
  gesture: GestureName
  confidence: number
}

export interface AttackEvent {
  jutsu: JutsuName
  effectiveness: number
  gesture: GestureResult | null
  voiceConfidence: number
  breakdown: {
    gestureScore: number
    voiceScore: number
  }
}

export const JUTSU_MAP: Record<GestureName, JutsuName> = {
  PALM: 'rasengan',
  FIST: 'chidori',
  TIGER: 'clone',
}

export const JUTSU_VOICE_MAP: Record<string, JutsuName> = {
  rasengan: 'rasengan',
  chidori: 'chidori',
  clone: 'clone',
}

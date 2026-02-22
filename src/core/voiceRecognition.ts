import type { JutsuName } from '../types'

const RASENGAN_VARIANTS = [
  'rasengan', 'rasa', 'rasen', 'raseng', 'rosen', 'rasing',
  'rosangan', 'lasinger', 'lasangan', 'lasing', 'lusingah',
  'resign', 'raisin', 'raising', 'raison', 'reason', 'risen',
  'rozangon', 'russingon', 'rossington', 'wrestling', 'resting',
  'resin', 'raisengan', 'rassen', 'rassegan', 'russegan',
  'sengan', 'rasagan', 'rosagan', 'russengan', 'rossigan',
  'rozigan', 'rasagan', 'rasongun', 'rosengun', 'roisengun',
  'risengon', 'rasengon', 'rusangon', 'roxengun', 'roxangan',
  'lusangan', 'lasengon', 'reasoning', 'reckoning', 'lessening',
  'listening', 'rinsing', 'resting gun', 'lesson gone',
]

const CHIDORI_VARIANTS = [
  'chidori', 'chido', 'chito', 'shidori', 'shitori',
  'chitari', 'chitary', 'chitore', 'kidori', 'chihuahua',
  'cedar', 'cheater', 'cheetah', 'cheddar',
]

const CHIDORI_PHRASES = [
  'she do', 'she door', 'she dory', 'she doing', 'she doe',
  'she doh', 'she done', 'she don', 'she told', 'she tore',
  'she tall', 'she doll', 'she dolly', 'she story', 'she tori',
  'she does', 'she dough', 'she though', 'she thought', 'she dog',
  'she dark', 'she dort', 'shi do', 'shi door', 'shi dory',
  'chi do', 'chi dory', 'chi dori', 'chi tori', 'chi door',
  'chi story', 'chi tall', 'chi told', 'chi tore',
  'key dory', 'key door', 'key story', 'key tori',
  'he dory', 'he door', 'he tori', 'he do re',
  'she dorry', 'she dowry', 'she dori', 'she dore',
  'she doory', 'she dawry', 'cheetah re', 'cedar e', 'cheddar e',
  'cheater e', 'kiddo re', 'hit ori', 'hit or e',
  'she\'d or', 'she door e', 'she tory',
]

const CLONE_VARIANTS = [
  'clone', 'clones', 'kage', 'kage bunshin', 'kage bunshin no jutsu',
  'shadow clone', 'shadow clones', 'bunshin', 'boon shin',
  'kagay', 'kahge', 'kaage', 'kahgay', 'kaga', 'kogay',
  'bunching', 'bun shin', 'boom shin', 'bonshin', 'bunsen',
  'cloning', 'clone jutsu', 'closing', 'blown',
]

const CLONE_PHRASES = [
  'kage bun', 'cog a bun', 'car gay bun', 'cod gay bun',
  'car gay boom', 'ka gay bun', 'ka gay boom', 'cage bun',
  'cage a bun', 'cod a bun', 'shadow clo', 'shadow blo',
]

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z\s]/g, '').trim()
}

function matchJutsu(transcript: string): { jutsu: JutsuName; confidence: number } | null {
  const raw = normalize(transcript)
  const collapsed = raw.replace(/\s+/g, '')

  for (const v of RASENGAN_VARIANTS) {
    if (raw.includes(v) || collapsed.includes(v.replace(/\s+/g, ''))) {
      return { jutsu: 'rasengan', confidence: v === 'rasengan' ? 1 : v.length >= 5 ? 0.85 : 0.7 }
    }
  }

  for (const v of CHIDORI_VARIANTS) {
    if (raw.includes(v) || collapsed.includes(v.replace(/\s+/g, ''))) {
      return { jutsu: 'chidori', confidence: v === 'chidori' ? 1 : v.length >= 5 ? 0.85 : 0.7 }
    }
  }

  for (const phrase of CHIDORI_PHRASES) {
    if (raw.includes(phrase)) {
      return { jutsu: 'chidori', confidence: phrase.length >= 6 ? 0.8 : 0.7 }
    }
  }

  if (/r[aoeiu]s[aeiou]n/i.test(collapsed)) return { jutsu: 'rasengan', confidence: 0.65 }
  if (/[lr][aoeiu]s[aeio]ng/i.test(collapsed)) return { jutsu: 'rasengan', confidence: 0.65 }
  if (/[lr][aoeiu][sz][aeiou]ng?[aoeiu]n/i.test(collapsed)) return { jutsu: 'rasengan', confidence: 0.6 }
  if (/s[eiu]ng[aoeiu]n/i.test(collapsed)) return { jutsu: 'rasengan', confidence: 0.55 }

  if (/[cs]h?[iea]d[oiau]/i.test(collapsed)) return { jutsu: 'chidori', confidence: 0.65 }
  if (/sh[iea]d[oiau]r/i.test(collapsed)) return { jutsu: 'chidori', confidence: 0.65 }
  if (/[cs]h[iea]t[oiau]r/i.test(collapsed)) return { jutsu: 'chidori', confidence: 0.6 }
  if (/[sc]h[iea][td][oiau][rl]?[iey]?/i.test(collapsed)) return { jutsu: 'chidori', confidence: 0.55 }
  if (/sh[eiu]d[oeau]/i.test(collapsed)) return { jutsu: 'chidori', confidence: 0.55 }
  if (/k[iea]d[oiau]r/i.test(collapsed)) return { jutsu: 'chidori', confidence: 0.55 }

  if (collapsed.startsWith('shedo') || collapsed.startsWith('shido') || collapsed.startsWith('chedo')) {
    return { jutsu: 'chidori', confidence: 0.6 }
  }
  if (collapsed.startsWith('chito') || collapsed.startsWith('shito') || collapsed.startsWith('cheeto')) {
    return { jutsu: 'chidori', confidence: 0.6 }
  }

  /* ── Clone / Kage Bunshin ──────────────────────────────── */
  for (const v of CLONE_VARIANTS) {
    if (raw.includes(v) || collapsed.includes(v.replace(/\s+/g, ''))) {
      return { jutsu: 'clone', confidence: v.length >= 5 ? 0.9 : 0.75 }
    }
  }
  for (const p of CLONE_PHRASES) {
    if (raw.includes(p)) {
      return { jutsu: 'clone', confidence: 0.8 }
    }
  }
  if (/kag[eai]/i.test(collapsed)) return { jutsu: 'clone', confidence: 0.7 }
  if (/bun\s*shin/i.test(raw) || /bunshin/i.test(collapsed)) return { jutsu: 'clone', confidence: 0.75 }
  if (/clo+ne?/i.test(collapsed)) return { jutsu: 'clone', confidence: 0.7 }

  return null
}

interface VoiceListener {
  start: () => void
  stop: () => void
  supported: boolean
}

type VoiceCallback = (keyword: JutsuName, confidence: number) => void
type SpeechActivityCallback = (transcript: string) => void

export function createVoiceListener(
  onKeyword: VoiceCallback,
  onSpeechActivity?: SpeechActivityCallback,
): VoiceListener {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) {
    return { start() {}, stop() {}, supported: false }
  }

  const recognition = new SR()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'
  recognition.maxAlternatives = 3

  let running = false

  recognition.onresult = (event: Event & { resultIndex: number; results: SpeechRecognitionResultList }) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      for (let j = 0; j < result.length; j++) {
        const transcript = result[j].transcript.toLowerCase().trim()
        if (transcript) onSpeechActivity?.(transcript)
        const match = matchJutsu(transcript)
        if (match) {
          const finalConf = match.confidence * (result[j].confidence ?? 0.8)
          onKeyword(match.jutsu, finalConf)
          return
        }
      }
    }
  }

  recognition.onerror = (event: Event & { error: string }) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return
  }

  recognition.onend = () => {
    if (running) {
      try { recognition.start() } catch (_) { /* restarting */ }
    }
  }

  return {
    start() {
      running = true
      try { recognition.start() } catch (_) { /* already started */ }
    },
    stop() {
      running = false
      try { recognition.stop() } catch (_) { /* already stopped */ }
    },
    supported: true,
  }
}

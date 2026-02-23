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

export type VoiceStatus = 'off' | 'starting' | 'listening' | 'hearing' | 'error' | 'denied'

interface VoiceListener {
  start: () => void
  stop: () => void
  restart: () => void
  supported: boolean
}

type VoiceCallback = (keyword: JutsuName, confidence: number) => void
type SpeechActivityCallback = (transcript: string) => void
type StatusCallback = (status: VoiceStatus, detail?: string) => void

export function createVoiceListener(
  onKeyword: VoiceCallback,
  onSpeechActivity?: SpeechActivityCallback,
  onStatus?: StatusCallback,
): VoiceListener {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) {
    return { start() {}, stop() {}, restart() {}, supported: false }
  }

  let recognition: InstanceType<typeof SR> | null = null
  let running = false
  let restartTimer: ReturnType<typeof setTimeout> | null = null
  let hearingTimer: ReturnType<typeof setTimeout> | null = null

  // ---------- Stable public status (decoupled from engine) ----------
  let publicStatus: VoiceStatus = 'off'
  let everConnected = false // true after first successful onaudiostart

  /** Only emits when status actually changes → no flicker */
  function setPublicStatus(next: VoiceStatus, detail?: string) {
    if (next === publicStatus && !detail) return   // dedupe
    publicStatus = next
    onStatus?.(next, detail)
  }

  /** Mark "hearing" for at least 800ms, then fall back to "listening" */
  function flashHearing() {
    if (hearingTimer) clearTimeout(hearingTimer)
    setPublicStatus('hearing')
    hearingTimer = setTimeout(() => {
      if (running && publicStatus === 'hearing') setPublicStatus('listening')
    }, 800)
  }
  // -------------------------------------------------------------------

  function createRecognition() {
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.maxAlternatives = 3

    // Mic connected — transition to "listening" (only meaningful on first connect)
    rec.onaudiostart = () => {
      everConnected = true
      setPublicStatus('listening')
    }

    // Ignore onspeechstart / onspeechend entirely — they fire on ambient noise
    // "hearing" is driven solely by actual transcription results below.

    rec.onresult = (event: Event & { resultIndex: number; results: SpeechRecognitionResultList }) => {
      // We got real speech — flash the "hearing" indicator
      flashHearing()

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        let matched = false
        for (let j = 0; j < result.length; j++) {
          const transcript = result[j].transcript.toLowerCase().trim()
          if (transcript && !matched) {
            onSpeechActivity?.(transcript)
          }
          const match = matchJutsu(transcript)
          if (match && !matched) {
            matched = true
            const finalConf = match.confidence * (result[j].confidence ?? 0.8)
            onKeyword(match.jutsu, finalConf)
          }
        }
      }
    }

    rec.onerror = (event: Event & { error: string }) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPublicStatus('denied', 'Mic permission denied — allow mic access and reload')
        running = false
        return
      }
      // no-speech & aborted are routine — ignore them, onend handles restart
      if (event.error === 'no-speech' || event.error === 'aborted') return
      // Real error
      if (event.error === 'network') {
        setPublicStatus('error', 'Network error — check internet connection')
      } else {
        setPublicStatus('error', `Speech error: ${event.error}`)
      }
    }

    rec.onend = () => {
      if (running) scheduleRestart()
    }

    return rec
  }

  function scheduleRestart() {
    if (restartTimer) clearTimeout(restartTimer)
    // If mic previously worked, restart quickly & silently (user stays on "listening")
    // If never connected or had an error, use backoff & show "starting"
    if (everConnected && publicStatus !== 'error') {
      restartTimer = setTimeout(() => { if (running) doStart() }, 120)
    } else {
      setPublicStatus('starting')
      restartTimer = setTimeout(() => { if (running) doStart() }, 500)
    }
  }

  function doStart() {
    try {
      recognition = createRecognition()
      recognition.start()
      // Don't emit status here — onaudiostart will emit "listening" when mic actually connects
    } catch (_) {
      setPublicStatus('error', 'Failed to start mic')
      // retry once more after 1s
      if (running) restartTimer = setTimeout(() => { if (running) doStart() }, 1000)
    }
  }

  return {
    start() {
      running = true
      everConnected = false
      setPublicStatus('starting')
      doStart()
    },
    stop() {
      running = false
      if (restartTimer) clearTimeout(restartTimer)
      if (hearingTimer) clearTimeout(hearingTimer)
      try { recognition?.stop() } catch (_) { /* ok */ }
      setPublicStatus('off')
    },
    restart() {
      if (restartTimer) clearTimeout(restartTimer)
      if (hearingTimer) clearTimeout(hearingTimer)
      try { recognition?.stop() } catch (_) { /* ok */ }
      everConnected = false
      running = true
      setPublicStatus('starting')
      setTimeout(() => doStart(), 200)
    },
    supported: true,
  }
}

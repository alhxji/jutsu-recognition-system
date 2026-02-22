import { useCallback, useEffect, useRef, useState } from 'react'
import CameraView from './components/CameraView'
import AttackEffect from './components/AttackEffect'
import BattleScene from './components/BattleScene'
import StatsPanel from './components/StatsPanel'
import CameraWarnings from './components/CameraWarnings'
import VoiceFeedback from './components/VoiceFeedback'
import HUD from './components/HUD'
import { createVoiceListener } from './core/voiceRecognition'
import { createAttackResolver } from './core/attackResolver'
import type { GestureResult, AttackEvent, JutsuName } from './types'

const EFFECT_DURATION = 1800

export default function App() {
  const [currentGesture, setCurrentGesture] = useState<string | null>(null)
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [attack, setAttack] = useState<AttackEvent | null>(null)
  const [showEffect, setShowEffect] = useState(false)
  const [attacking, setAttacking] = useState(false)
  const [brightness, setBrightness] = useState(128)
  const [handDetected, setHandDetected] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')
  const [lastKeyword, setLastKeyword] = useState('')

  const effectTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const transcriptTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const resolverRef = useRef(
    createAttackResolver((event: AttackEvent) => {
      setAttack(event)
      setShowEffect(true)
      setAttacking(true)

      if (effectTimer.current) clearTimeout(effectTimer.current)
      effectTimer.current = setTimeout(() => setShowEffect(false), EFFECT_DURATION)
    }),
  )

  const onGesture = useCallback((result: GestureResult) => {
    if (attacking) return
    setCurrentGesture(result.gesture)
    resolverRef.current.feedGesture(result)
  }, [attacking])

  const onGestureLost = useCallback(() => {
    setCurrentGesture(null)
  }, [])

  const onBrightness = useCallback((avg: number) => {
    setBrightness(avg)
  }, [])

  const onHandDetected = useCallback((detected: boolean) => {
    setHandDetected(detected)
  }, [])

  useEffect(() => {
    const voice = createVoiceListener(
      (keyword: JutsuName, confidence: number) => {
        setLastKeyword(keyword)
        resolverRef.current.feedVoice(keyword, confidence)
      },
      (transcript: string) => {
        setLastTranscript(transcript)
        if (transcriptTimer.current) clearTimeout(transcriptTimer.current)
        transcriptTimer.current = setTimeout(() => setLastTranscript(''), 3000)
      },
    )

    setVoiceSupported(voice.supported)
    if (voice.supported) {
      voice.start()
      setVoiceActive(true)
    }

    return () => {
      voice.stop()
      setVoiceActive(false)
    }
  }, [])

  const onManualJutsu = useCallback((jutsu: JutsuName) => {
    if (attacking) return
    const event: AttackEvent = {
      jutsu,
      effectiveness: 50,
      gesture: null,
      voiceConfidence: 0,
      breakdown: { gestureScore: 50, voiceScore: 0 },
    }
    setAttack(event)
    setShowEffect(true)
    setAttacking(true)
    if (effectTimer.current) clearTimeout(effectTimer.current)
    effectTimer.current = setTimeout(() => setShowEffect(false), EFFECT_DURATION)
  }, [attacking])

  const onBattleComplete = useCallback(() => {
    setAttacking(false)
  }, [])

  return (
    <>
      <CameraView
        onGesture={onGesture}
        onGestureLost={onGestureLost}
        paused={attacking}
        onBrightness={onBrightness}
        onHandDetected={onHandDetected}
      />
      {showEffect && <AttackEffect attack={attack} />}
      <BattleScene attack={attack} active={attacking} onComplete={onBattleComplete} />
      <StatsPanel
        attack={attack}
        currentGesture={currentGesture}
        voiceActive={voiceActive}
      />
      <CameraWarnings
        brightness={brightness}
        handDetected={handDetected}
        gestureActive={!!currentGesture}
      />
      <VoiceFeedback
        supported={voiceSupported}
        active={voiceActive}
        lastTranscript={lastTranscript}
        lastKeyword={lastKeyword}
      />
      <HUD onTrigger={onManualJutsu} />
    </>
  )
}

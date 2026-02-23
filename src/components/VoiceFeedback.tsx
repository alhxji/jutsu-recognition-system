import { useEffect, useState } from 'react'
import type { VoiceStatus } from '../core/voiceRecognition'
import styles from './VoiceFeedback.module.css'

interface Props {
  supported: boolean
  status: VoiceStatus
  statusDetail?: string
  lastTranscript: string
  lastKeyword: string
  onRetry?: () => void
}

const STATUS_LABELS: Record<VoiceStatus, string> = {
  off: 'MIC OFF',
  starting: 'STARTING…',
  listening: 'LISTENING',
  hearing: 'HEARING YOU',
  error: 'ERROR',
  denied: 'MIC BLOCKED',
}

function dotClass(status: VoiceStatus, supported: boolean) {
  if (!supported) return styles.unsupported
  if (status === 'hearing') return styles.hearing
  if (status === 'listening') return styles.active
  if (status === 'starting') return styles.starting
  if (status === 'error' || status === 'denied') return styles.error
  return ''
}

export default function VoiceFeedback({ supported, status, statusDetail, lastTranscript, lastKeyword, onRetry }: Props) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!lastKeyword) return
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 600)
    return () => clearTimeout(t)
  }, [lastKeyword])

  const isError = status === 'error' || status === 'denied'
  const showBars = status === 'listening' || status === 'hearing'

  return (
    <div className={styles.container}>
      <div
        className={`${styles.micRow} ${isError ? styles.micRowError : ''}`}
        onClick={isError ? onRetry : undefined}
        style={isError ? { cursor: 'pointer' } : undefined}
      >
        <div className={`${styles.micDot} ${dotClass(status, supported)}`} />
        <span className={styles.micLabel}>
          {!supported ? 'VOICE NOT SUPPORTED' : STATUS_LABELS[status]}
        </span>
        {showBars && (
          <div className={styles.bars}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.bar} style={{ '--d': `${i * 0.1}s` } as React.CSSProperties} />
            ))}
          </div>
        )}
      </div>

      {statusDetail && (
        <div className={`${styles.detail} ${isError ? styles.detailError : ''}`}>
          {statusDetail}
          {isError && ' — tap mic to retry'}
        </div>
      )}

      {lastTranscript && (
        <div className={styles.transcript}>
          "{lastTranscript}"
        </div>
      )}

      {lastKeyword && (
        <div className={`${styles.matched} ${flash ? styles.flash : ''}`}>
          ⚡ {lastKeyword.toUpperCase()} detected
        </div>
      )}

      {supported && showBars && !lastKeyword && !statusDetail && (
        <div className={styles.tip}>
          Say a jutsu name clearly
        </div>
      )}
    </div>
  )
}

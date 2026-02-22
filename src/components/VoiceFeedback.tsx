import { useEffect, useState } from 'react'
import styles from './VoiceFeedback.module.css'

interface Props {
  supported: boolean
  active: boolean
  lastTranscript: string
  lastKeyword: string
}

export default function VoiceFeedback({ supported, active, lastTranscript, lastKeyword }: Props) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!lastKeyword) return
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 600)
    return () => clearTimeout(t)
  }, [lastKeyword])

  return (
    <div className={styles.container}>
      <div className={styles.micRow}>
        <div className={`${styles.micDot} ${!supported ? styles.unsupported : active ? styles.active : ''}`} />
        <span className={styles.micLabel}>
          {!supported ? 'VOICE NOT SUPPORTED' : active ? 'LISTENING' : 'MIC OFF'}
        </span>
        {active && (
          <div className={styles.bars}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.bar} style={{ '--d': `${i * 0.1}s` } as React.CSSProperties} />
            ))}
          </div>
        )}
      </div>

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

      {supported && active && !lastKeyword && (
        <div className={styles.tip}>
          Say "Rasengan" or "Chidori" clearly
        </div>
      )}
    </div>
  )
}

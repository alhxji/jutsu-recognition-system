import { useEffect, useRef, useState } from 'react'
import type { AttackEvent } from '../types'
import styles from './StatsPanel.module.css'

const HIDE_DELAY = 4000

interface Props {
  attack: AttackEvent | null
  currentGesture: string | null
  voiceActive: boolean
}

export default function StatsPanel({ attack, currentGesture, voiceActive }: Props) {
  const [visible, setVisible] = useState(false)
  const attackCount = useRef(0)
  const [stableKey, setStableKey] = useState(0)

  useEffect(() => {
    if (attack) {
      attackCount.current++
      setStableKey(attackCount.current)
    }
  }, [attack])

  useEffect(() => {
    if (currentGesture || attack) {
      setVisible(true)
    }

    if (!currentGesture && !attack) return

    const timer = setTimeout(() => {
      if (!currentGesture) setVisible(false)
    }, HIDE_DELAY)

    return () => clearTimeout(timer)
  }, [currentGesture, attack])

  if (!visible) return null

  return (
    <div className={`${styles.panel} ${!currentGesture && !attack ? styles.fadeOut : styles.fadeIn}`}>
      <div className={styles.status}>
        <div className={styles.indicator}>
          <span className={`${styles.dot} ${currentGesture ? styles.active : ''}`} />
          <span className={styles.indicatorLabel}>
            {currentGesture ? currentGesture : 'NO SIGN'}
          </span>
        </div>
        <div className={styles.indicator}>
          <span className={`${styles.dot} ${voiceActive ? styles.listening : ''}`} />
          <span className={styles.indicatorLabel}>MIC</span>
        </div>
      </div>

      {attack && (
        <div
          key={stableKey}
          className={`${styles.stats} ${attack.jutsu === 'rasengan' ? styles.rasengan : styles.chidori}`}
        >
          <div className={styles.jutsuName}>{attack.jutsu.toUpperCase()}</div>

          <div className={styles.effectivenessBar}>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${attack.effectiveness}%` }}
              />
            </div>
            <span className={styles.percent}>{attack.effectiveness}%</span>
          </div>

          <div className={styles.breakdown}>
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>Hand Sign</span>
              <div className={styles.miniBar}>
                <div
                  className={styles.miniFill}
                  style={{ width: `${attack.breakdown.gestureScore}%` }}
                />
              </div>
              <span className={styles.breakdownValue}>{attack.breakdown.gestureScore}%</span>
            </div>
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>Voice</span>
              <div className={styles.miniBar}>
                <div
                  className={styles.miniFill}
                  style={{ width: `${attack.breakdown.voiceScore}%` }}
                />
              </div>
              <span className={styles.breakdownValue}>{attack.breakdown.voiceScore}%</span>
            </div>
          </div>

          <div className={styles.rating}>
            {attack.effectiveness >= 90
              ? 'PERFECT JUTSU'
              : attack.effectiveness >= 70
                ? 'STRONG CAST'
                : attack.effectiveness >= 50
                  ? 'DECENT ATTEMPT'
                  : 'WEAK CAST'}
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import styles from './CameraWarnings.module.css'

interface Props {
  brightness: number
  handDetected: boolean
  gestureActive: boolean
}

interface Warning {
  icon: string
  message: string
  severity: 'info' | 'warn' | 'error'
}

export default function CameraWarnings({ brightness, handDetected, gestureActive }: Props) {
  const [warnings, setWarnings] = useState<Warning[]>([])

  useEffect(() => {
    const w: Warning[] = []

    if (brightness > 0 && brightness < 40) {
      w.push({ icon: '🌑', message: 'Too dark — turn on a light or move to a brighter spot', severity: 'error' })
    } else if (brightness > 0 && brightness < 70) {
      w.push({ icon: '🔅', message: 'Low light — detection may be unreliable', severity: 'warn' })
    } else if (brightness > 220) {
      w.push({ icon: '☀️', message: 'Too bright — move away from direct light', severity: 'warn' })
    }

    if (handDetected && !gestureActive) {
      w.push({ icon: '👋', message: 'Hand seen but no sign — try open palm or fist', severity: 'info' })
    }

    setWarnings(w)
  }, [brightness, handDetected, gestureActive])

  if (warnings.length === 0) return null

  return (
    <div className={styles.container}>
      {warnings.map((w, i) => (
        <div key={i} className={`${styles.warning} ${styles[w.severity]}`}>
          <span className={styles.icon}>{w.icon}</span>
          <span className={styles.msg}>{w.message}</span>
        </div>
      ))}
    </div>
  )
}

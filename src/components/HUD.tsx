import type { JutsuName } from '../types'
import styles from './HUD.module.css'

interface Props {
  onTrigger?: (jutsu: JutsuName) => void
}

export default function HUD({ onTrigger }: Props) {
  return (
    <div className={styles.hud}>
      <button className={styles.row} onClick={() => onTrigger?.('rasengan')}>
        <span className={styles.gesture}>✋ Open Palm</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.jutsu}>Rasengan</span>
      </button>
      <button className={styles.row} onClick={() => onTrigger?.('chidori')}>
        <span className={styles.gesture}>✊ Fist</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.jutsu}>Chidori</span>
      </button>
      <button className={styles.row} onClick={() => onTrigger?.('clone')}>
        <span className={styles.gesture}>🤞 Tiger Seal</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.jutsu}>Kage Bunshin</span>
      </button>
      <div className={styles.hint}>Use gesture + voice for max power</div>
    </div>
  )
}

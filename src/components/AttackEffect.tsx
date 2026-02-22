import type { AttackEvent } from '../types'
import styles from './AttackEffect.module.css'

interface Props {
  attack: AttackEvent | null
}

export default function AttackEffect({ attack }: Props) {
  if (!attack) return null

  const jutsu = attack.jutsu
  const modeClass = jutsu === 'rasengan' ? styles.rasengan
    : jutsu === 'chidori' ? styles.chidori
    : styles.clone

  return (
    <div
      key={Date.now()}
      className={`${styles.overlay} ${modeClass}`}
    >
      <div className={styles.flash} />
      <div className={styles.center}>
        <div className={styles.orb}>
          {jutsu === 'rasengan' ? (
            <div className={styles.rasenganBall} />
          ) : jutsu === 'chidori' ? (
            <div className={styles.chidoriBolt}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.lightning} style={{
                  '--angle': `${i * 60}deg`,
                  '--delay': `${i * 0.05}s`,
                } as React.CSSProperties} />
              ))}
            </div>
          ) : (
            <div className={styles.cloneEffect}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.cloneShadow} style={{
                  '--clone-i': i,
                } as React.CSSProperties} />
              ))}
            </div>
          )}
        </div>
        <div className={styles.label}>
          {jutsu === 'rasengan' ? 'RASENGAN' : jutsu === 'chidori' ? 'CHIDORI' : 'KAGE BUNSHIN'}
        </div>
      </div>
    </div>
  )
}

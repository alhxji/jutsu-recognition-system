import { useEffect, useState } from 'react'
import type { AttackEvent } from '../types'
import styles from './BattleScene.module.css'

type Phase = 'idle' | 'charge' | 'dash' | 'impact' | 'recover'

interface Props {
  attack: AttackEvent | null
  active: boolean
  onComplete: () => void
}

export default function BattleScene({ attack, active, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [lastAttack, setLastAttack] = useState<AttackEvent | null>(null)

  useEffect(() => {
    if (!active || !attack) {
      if (phase !== 'idle' && phase !== 'recover') setPhase('idle')
      return
    }

    setLastAttack(attack)
    setPhase('charge')

    const isClone = attack.jutsu === 'clone'
    // Clone: longer charge to summon clones, then they all rush
    const chargeTime = isClone ? 600 : 400
    const dashTime = isClone ? 500 : 400
    const impactTime = isClone ? 1400 : 1200

    const t1 = setTimeout(() => setPhase('dash'), chargeTime)
    const t2 = setTimeout(() => setPhase('impact'), chargeTime + dashTime)
    const t3 = setTimeout(() => {
      setPhase('recover')
      setTimeout(() => {
        setPhase('idle')
        onComplete()
      }, 600)
    }, chargeTime + dashTime + impactTime)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [active, attack, onComplete])

  const displayAttack = lastAttack
  const isRasengan = displayAttack?.jutsu === 'rasengan'
  const isClone = displayAttack?.jutsu === 'clone'
  const jutsuClass = isRasengan ? styles.rasengan
    : isClone ? styles.clone
    : styles.chidori
  const isAnimating = phase !== 'idle' && phase !== 'recover'

  return (
    <div className={styles.box}>
      <div className={styles.boxHeader}>
        <span className={styles.boxTitle}>BATTLE</span>
        {displayAttack && phase === 'idle' && (
          <span className={styles.lastHit}>
            Last: {displayAttack.jutsu === 'clone' ? 'KAGE BUNSHIN' : displayAttack.jutsu.toUpperCase()} — {displayAttack.effectiveness}%
          </span>
        )}
      </div>
      <div className={styles.scene}>
        <div className={styles.arena}>
          {/* Main player */}
          <div className={`${styles.player} ${styles[phase]}`}>
            <div className={styles.playerBody}>
              <div className={styles.head} />
              <div className={styles.torso} />
              <div className={`${styles.armFront} ${phase === 'dash' || phase === 'impact' ? styles.armExtended : ''}`} />
              <div className={styles.armBack} />
              <div className={`${styles.legFront} ${phase === 'dash' ? styles.legStride : ''}`} />
              <div className={styles.legBack} />
            </div>
            <div className={styles.playerLabel}>YOU</div>
            {isAnimating && displayAttack && !isClone && (
              <div className={`${styles.chakra} ${jutsuClass}`}>
                {isRasengan ? (
                  <div className={styles.rasenganOrb} />
                ) : (
                  <div className={styles.chidoriSpark}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={styles.sparkLine} style={{
                        '--i': i,
                      } as React.CSSProperties} />
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Clone jutsu: smoke puff during charge */}
            {isClone && phase === 'charge' && (
              <div className={styles.smokePuff} />
            )}
          </div>

          {/* Shadow clones — appear during charge, dash + impact with player */}
          {isClone && isAnimating && (
            <>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`${styles.shadowClone} ${styles[phase]}`}
                  style={{
                    '--clone-offset': `${(i - 1) * 14}px`,
                    '--clone-delay': `${i * 0.08}s`,
                    animationDelay: `${i * 0.08}s`,
                  } as React.CSSProperties}
                >
                  <div className={styles.cloneBody}>
                    <div className={styles.cloneHead} />
                    <div className={styles.cloneTorso} />
                    <div className={`${styles.cloneArm} ${phase === 'dash' || phase === 'impact' ? styles.armExtended : ''}`} />
                    <div className={`${styles.cloneLeg} ${phase === 'dash' ? styles.legStride : ''}`} />
                  </div>
                </div>
              ))}
            </>
          )}

          {phase === 'impact' && displayAttack && (
            <div className={`${styles.impactZone} ${jutsuClass}`}>
              <div className={styles.impactRing} />
              <div className={styles.impactRing2} />
              <div className={styles.impactFlash} />
              {isClone && <div className={styles.impactRing3} />}
              <div className={styles.dmgNumber}>
                {displayAttack.effectiveness}%
              </div>
            </div>
          )}

          <div className={`${styles.target} ${phase === 'impact' ? styles.targetHit : ''}`}>
            <div className={styles.targetBody}>
              <div className={styles.targetHead} />
              <div className={styles.targetTorso} />
              <div className={styles.targetArmL} />
              <div className={styles.targetArmR} />
              <div className={styles.targetLegL} />
              <div className={styles.targetLegR} />
            </div>
            <div className={styles.targetLabel}>ENEMY</div>
          </div>

          <div className={styles.ground} />
        </div>

        {phase === 'idle' && !lastAttack && (
          <div className={styles.idleHint}>Waiting for jutsu…</div>
        )}
      </div>
    </div>
  )
}

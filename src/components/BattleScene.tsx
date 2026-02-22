import { useEffect, useMemo, useState } from 'react'
import type { AttackEvent } from '../types'
import styles from './BattleScene.module.css'

type Phase = 'idle' | 'charge' | 'dash' | 'impact' | 'recover'

/**
 * 3 combo attack routes, Naruto-style:
 *  uppercut  — rushes in low, kicks enemy upward
 *  aerial    — jumps in from above, kicks mid-air
 *  slam      — leaps high, crashes down on enemy
 */
const COMBO_ROUTES = ['uppercut', 'aerial', 'slam'] as const
type ComboRoute = typeof COMBO_ROUTES[number]

function shuffleRoutes(): ComboRoute[] {
  const arr = [...COMBO_ROUTES] as ComboRoute[]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface Props {
  attack: AttackEvent | null
  active: boolean
  onComplete: () => void
}

export default function BattleScene({ attack, active, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [lastAttack, setLastAttack] = useState<AttackEvent | null>(null)
  const [cloneActive, setCloneActive] = useState(false)

  // Randomise combo routes each time
  const routes = useMemo(() => shuffleRoutes(), [attack])

  useEffect(() => {
    if (!active || !attack) {
      if (phase !== 'idle' && phase !== 'recover') setPhase('idle')
      setCloneActive(false)
      return
    }

    setLastAttack(attack)
    setPhase('charge')

    const isClone = attack.jutsu === 'clone'
    const chargeTime = isClone ? 500 : 400
    const dashTime = isClone ? 200 : 400
    const impactTime = isClone ? 1600 : 1200  // slightly longer for the gang-up feel

    // Activate clones after a brief charge
    if (isClone) {
      const ct = setTimeout(() => setCloneActive(true), 300)
      var cloneTimer = ct
    }

    const t1 = setTimeout(() => setPhase('dash'), chargeTime)
    const t2 = setTimeout(() => setPhase('impact'), chargeTime + dashTime)
    const t3 = setTimeout(() => {
      setPhase('recover')
      setCloneActive(false)
      setTimeout(() => {
        setPhase('idle')
        onComplete()
      }, 600)
    }, chargeTime + dashTime + impactTime)

    return () => {
      if (cloneTimer) clearTimeout(cloneTimer)
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
          {/* Main player — stays back during clone combo */}
          <div className={`${styles.player} ${isClone ? styles.idle : styles[phase]}`}>
            <div className={styles.playerBody}>
              <div className={styles.head} />
              <div className={styles.torso} />
              <div className={`${styles.armFront} ${!isClone && (phase === 'dash' || phase === 'impact') ? styles.armExtended : ''}`} />
              <div className={styles.armBack} />
              <div className={`${styles.legFront} ${!isClone && phase === 'dash' ? styles.legStride : ''}`} />
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
            {isClone && phase === 'charge' && (
              <div className={styles.smokePuff} />
            )}
          </div>

          {/* Clone combo — 3 clones, all rush at once from different angles */}
          {isClone && cloneActive && routes.map((route, i) => (
            <div
              key={`${route}-${i}`}
              className={`${styles.comboClone} ${styles[`combo_${route}`]}`}
            >
              <div className={`${styles.cloneBody} ${styles[`dim${i}`]}`}>
                <div className={styles.cloneHead} />
                <div className={styles.cloneTorso} />
                <div className={styles.cloneArm} />
                <div className={styles.cloneLeg} />
              </div>
            </div>
          ))}

          {/* All clones hit at the same time */}
          {isClone && phase === 'impact' && displayAttack && (
            <>
              <div className={`${styles.comboHit} ${styles.clone}`}>
                <div className={styles.impactRing} />
                <div className={styles.impactRing2} />
                <div className={styles.impactFlash} />
              </div>
              <div className={`${styles.comboDmg} ${styles.clone}`}>
                <div className={styles.dmgNumber}>
                  {displayAttack.effectiveness}%
                </div>
              </div>
            </>
          )}

          {/* Normal jutsu impact */}
          {!isClone && phase === 'impact' && displayAttack && (
            <div className={`${styles.impactZone} ${jutsuClass}`}>
              <div className={styles.impactRing} />
              <div className={styles.impactRing2} />
              <div className={styles.impactFlash} />
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

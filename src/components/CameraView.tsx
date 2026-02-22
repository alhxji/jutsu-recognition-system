import { useRef, useEffect, useCallback, useState } from 'react'
import { Hands, Results } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { HAND_CONNECTIONS } from '@mediapipe/hands'
import { classifyGesture } from '../core/gestureClassifier'
import type { Landmark, GestureResult } from '../types'
import styles from './CameraView.module.css'

interface Props {
  onGesture: (result: GestureResult) => void
  onGestureLost: () => void
  paused?: boolean
  onBrightness?: (avg: number) => void
  onHandDetected?: (detected: boolean) => void
}

export default function CameraView({ onGesture, onGestureLost, paused, onBrightness, onHandDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const frameCount = useRef(0)

  const onResults = useCallback(
    (results: Results) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight

      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

      frameCount.current++
      if (onBrightness && frameCount.current % 15 === 0) {
        const sample = ctx.getImageData(
          Math.floor(canvas.width * 0.3),
          Math.floor(canvas.height * 0.3),
          Math.floor(canvas.width * 0.4),
          Math.floor(canvas.height * 0.4),
        )
        let sum = 0
        for (let i = 0; i < sample.data.length; i += 16) {
          sum += (sample.data[i] + sample.data[i + 1] + sample.data[i + 2]) / 3
        }
        const avg = sum / (sample.data.length / 16)
        onBrightness(avg)
      }

      const hasHands = !!(results.multiHandLandmarks?.length)
      onHandDetected?.(hasHands)

      if (results.multiHandLandmarks?.length) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: '#ffffff30',
            lineWidth: 2,
          })
          drawLandmarks(ctx, landmarks, {
            color: '#4fc3f7',
            fillColor: '#4fc3f780',
            lineWidth: 1,
            radius: 3,
          })
        }

        if (!paused) {
          const lm = results.multiHandLandmarks[0] as Landmark[]
          const result = classifyGesture(lm)
          if (result) {
            onGesture(result)
          } else {
            onGestureLost()
          }
        }
      } else if (!paused) {
        onGestureLost()
      }

      ctx.restore()
    },
    [onGesture, onGestureLost, paused, onBrightness, onHandDetected],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    })

    hands.onResults(onResults)

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video })
      },
      width: 1280,
      height: 720,
    })

    camera.start().then(() => setReady(true))

    return () => {
      camera.stop()
      hands.close()
    }
  }, [onResults])

  return (
    <div className={styles.container}>
      <video ref={videoRef} className={styles.video} playsInline />
      <canvas ref={canvasRef} className={styles.canvas} />
      {!ready && <div className={styles.loading}>Initializing camera…</div>}
    </div>
  )
}

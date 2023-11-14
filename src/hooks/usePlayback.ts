import { React } from "../deps.ts"
import { playbackWorker } from "../worker/playback.worker.ts"
import {
  BrowserCallData,
  PlayState,
  TypedCallParams,
  WorkerCall,
  WorkerCallTypings,
} from "../worker/playback.worker.types.ts"
import { usePlaybackProgress } from "./usePlaybackProgress.ts"

export type ReportedPlayState = {
  state: PlayState
  reportedAt: Date
}

const typedWorkerCall = <C extends WorkerCall>(
  worker: Worker | undefined,
  ...[call, data]: TypedCallParams<WorkerCallTypings, C>
) => worker?.postMessage([call, data])

const blobbedWorker = URL.createObjectURL(
  new Blob(["(", playbackWorker.toString(), ")()"], {
    type: "application/javascript",
  }),
)

type Props = {
  estimationUpdateInterval?: number
  reportCheckpoint?: (time: number) => void
  checkpoints: number[]
  debugLog?: (message: string) => void
}
export const usePlayback = (
  { estimationUpdateInterval, checkpoints, reportCheckpoint, debugLog }: Props,
) => {
  // ------------  State  ------------
  const workerRef = React.useRef<Worker>()
  const [reportedPlayState, setReportedPlayState] = React.useState<
    ReportedPlayState | undefined
  >(
    undefined,
  )

  const isReady = React.useMemo(() => {
    return reportedPlayState !== undefined
  }, [reportedPlayState])

  const estimatedProgress = usePlaybackProgress(
    reportedPlayState,
    estimationUpdateInterval,
  )

  const [controlStartTime, setControlStartTime] = React.useState<number>(0)

  // ------------  Worker  ------------
  React.useEffect(() => {
    const newWorker = new Worker(blobbedWorker)
    workerRef.current = newWorker

    return () => newWorker.terminate()
  }, [])

  React.useEffect(() => {
    if (!workerRef.current) return

    const onMessage = (event: MessageEvent<BrowserCallData>) => {
      const [eventCall, eventData] = event.data
      switch (eventCall) {
        case "reachedCheckpoint": {
          const now = Date.now()

          if (debugLog) {
            // At what time the main thread expected the checkpoint to be reached
            const expectedTime = controlStartTime + eventData.time
            // At what time the worker meant to reach the checkpoint
            const workerAimedAt = eventData.startTime + eventData.time
            // How much time the worker was off by
            const error = now - workerAimedAt
            // How much time the worker has been off by cumulatively
            const accError = now - expectedTime

            // error and accError should be equal, as the worker tries to correct itself
            debugLog(
              `Reporting checkpoint ${eventData.time}, (error ${error}ms, accumulated error ${accError}ms)`,
            )
          }

          const checkpoint = eventData.time
          reportCheckpoint?.(checkpoint)
          break
        }
        case "reportPlayState":
          setReportedPlayState({ state: eventData, reportedAt: new Date() })
          break
      }
    }

    workerRef.current.addEventListener("message", onMessage)
    return () => {
      workerRef.current?.removeEventListener("message", onMessage)
    }
  }, [reportCheckpoint, controlStartTime])

  React.useEffect(() => {
    if (!workerRef.current) return
    typedWorkerCall(workerRef.current, "setCheckpoints", checkpoints)
  }, [checkpoints, workerRef.current])

  // ------------  Controls  ------------
  const play = React.useCallback(() => {
    const newProgress = reportedPlayState?.state.progress ?? 0
    typedWorkerCall(workerRef.current, "setPlayState", {
      playing: true,
      progress: newProgress,
    })
    setControlStartTime(Date.now() - newProgress)
  }, [])
  const pause = React.useCallback(() => {
    const newProgress = reportedPlayState?.state.progress ?? 0
    typedWorkerCall(workerRef.current, "setPlayState", {
      playing: false,
      progress: newProgress,
    })
    setControlStartTime(Date.now() - newProgress)
  }, [])
  const stop = React.useCallback(() => {
    typedWorkerCall(workerRef.current, "setPlayState", {
      playing: false,
      progress: 0,
    })
    setControlStartTime(Date.now())
  }, [])
  const setLooping = React.useCallback((looping: boolean) => {
    typedWorkerCall(workerRef.current, "setPlayState", { looping })
    setControlStartTime(Date.now())
  }, [])
  const setPlaybackProgress = React.useCallback((progress: number) => {
    if (!workerRef.current) return
    typedWorkerCall(workerRef.current, "setPlayState", { progress })
    setControlStartTime(Date.now())
  }, [])

  return {
    isReady,
    playState: reportedPlayState?.state,
    estimatedProgress: estimatedProgress,
    play,
    pause,
    stop,
    setLooping,
    setPlaybackProgress,
  }
}

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
}
export const usePlayback = (
  { estimationUpdateInterval, checkpoints, reportCheckpoint }: Props,
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
        case "reachedCheckpoint":
          reportCheckpoint?.(eventData)
          break
        case "reportPlayState":
          setReportedPlayState({ state: eventData, reportedAt: new Date() })
          break
      }
    }

    workerRef.current.addEventListener("message", onMessage)
    return () => {
      workerRef.current?.removeEventListener("message", onMessage)
    }
  }, [reportCheckpoint])

  React.useEffect(() => {
    if (!workerRef.current) return
    typedWorkerCall(workerRef.current, "setCheckpoints", checkpoints)
  }, [checkpoints, workerRef.current])

  // ------------  Controls  ------------
  const play = React.useCallback(() => {
    typedWorkerCall(workerRef.current, "setPlayState", { playing: true })
  }, [])
  const pause = React.useCallback(() => {
    typedWorkerCall(workerRef.current, "setPlayState", { playing: false })
  }, [])
  const stop = React.useCallback(() => {
    typedWorkerCall(workerRef.current, "setPlayState", {
      playing: false,
      progress: 0,
    })
  }, [])
  const setLooping = React.useCallback((looping: boolean) => {
    typedWorkerCall(workerRef.current, "setPlayState", { looping })
  }, [])
  const setPlaybackProgress = React.useCallback((progress: number) => {
    if (!workerRef.current) return
    typedWorkerCall(workerRef.current, "setPlayState", { progress })
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

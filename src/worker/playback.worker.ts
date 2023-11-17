// @ts-ignore: "Must ignore to prevent build errors"
/// <reference lib="deno.worker" />
import type {
  BrowserCall,
  BrowserCallTypings,
  PlayState,
  TypedCallParams,
  WorkerCallData,
} from "../types.ts"

export const playbackWorker = () => {
  // -----------------  Utils  -----------------
  const typedBrowserCall = <C extends BrowserCall>(
    ...[call, data]: TypedCallParams<BrowserCallTypings, C>
  ) => postMessage([call, data])

  // ------------  State  ------------
  let timesToReport: number[] = []
  let startTime: number | undefined
  let timeoutId: number | undefined

  let lastReportedProgress: number | undefined

  let currentPlayState: PlayState = {
    looping: false,
    playing: false,
    progress: 0,
  }

  const calcCurrentProgress = () => {
    if (startTime === undefined) return 0
    return performance.now() - startTime
  }

  // ------------  Logic  ------------
  const createNextTimeout = () => {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
    if (!currentPlayState.playing) return

    const currProg = calcCurrentProgress()
    const nextTime = timesToReport.find((time) =>
      time >= currProg &&
      time !== lastReportedProgress
    )
    if (nextTime === undefined) {
      if (currentPlayState.looping) {
        setPlayState({ progress: 0 })
        createNextTimeout()
      } else {
        setPlayState({ progress: 0, playing: false })
      }
      return
    }

    const newProgress = calcCurrentProgress()
    setPlayState({ progress: newProgress }, false, false)

    timeoutId = setTimeout(() => {
      lastReportedProgress = nextTime
      typedBrowserCall("reachedCheckpoint", nextTime)
      setPlayState({ progress: nextTime }, false, false)
      createNextTimeout()
    }, nextTime - newProgress)
  }

  const setPlayState = (
    newState: Partial<PlayState>,
    recalcStart = true,
    reportToMain = true,
  ) => {
    const newProgress = newState.progress ?? calcCurrentProgress()

    currentPlayState = {
      ...currentPlayState,
      ...newState,
      progress: newProgress,
    }

    if (recalcStart) {
      startTime = performance.now() - currentPlayState.progress
    }

    if (!reportToMain) return
    typedBrowserCall("reportPlayState", currentPlayState)
  }

  // ------------  Events  ------------
  addEventListener("message", (event: MessageEvent<WorkerCallData>) => {
    const [type, param] = event.data
    switch (type) {
      case "setCheckpoints":
        timesToReport = param
        break
      case "setPlayState":
        setPlayState(param)
        if (param.progress !== undefined) {
          lastReportedProgress = undefined
        }
        createNextTimeout()
        break
    }
  })

  // ------------  Init  ------------
  typedBrowserCall("reportPlayState", currentPlayState)
  typedBrowserCall("reportTime", performance.now())
}

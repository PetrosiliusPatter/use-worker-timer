// @ts-ignore: "Must ignore to prevent build errors"
/// <reference lib="deno.worker" />
import type {
  BrowserCall,
  BrowserCallTypings,
  PlayState,
  TypedCallParams,
  WorkerCallData,
} from "./playback.worker.types.ts"

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

  // ------------  Logic  ------------
  const createNextTimeout = () => {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
    if (!currentPlayState.playing) return

    const nextTime = timesToReport.find((time) =>
      time >= (startTime ? Date.now() - startTime : 0) && time !== lastReportedProgress
    )
    if (nextTime === undefined) {
      if (currentPlayState.looping) {
        setPlayState({ progress: 0 }, true)
        createNextTimeout()
      } else {
        setPlayState({ progress: 0, playing: false }, true)
      }
      return
    }

    const newProgress = startTime ? Date.now() - startTime : 0
    setPlayState({ progress: newProgress }, false)

    timeoutId = setTimeout(() => {
      lastReportedProgress = nextTime
      typedBrowserCall("reachedCheckpoint", { time: nextTime, startTime: startTime ?? 0 })
      setPlayState({ progress: nextTime }, false)
      createNextTimeout()
    }, nextTime - newProgress)
  }

  const setPlayState = (newState: Partial<PlayState>, recalcStart = true) => {
    let newProgress = newState.progress
    if (newProgress === undefined && startTime !== undefined) {
      newProgress = currentPlayState.playing
        ? Date.now() - startTime
        : currentPlayState.progress
    }

    currentPlayState = {
      ...currentPlayState,
      ...newState,
      progress: newProgress ?? 0,
    }

    if (recalcStart) {
      console.log("Recalculating start time")
      startTime = Date.now() - currentPlayState.progress
    }
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
      case "requestPlayState":
        typedBrowserCall("reportPlayState", currentPlayState)
        break
    }
  })

  // ------------  Init  ------------
  typedBrowserCall("reportPlayState", currentPlayState)
}

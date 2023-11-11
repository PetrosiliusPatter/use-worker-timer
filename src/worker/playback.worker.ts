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

    setPlayState({ progress: startTime ? Date.now() - startTime : 0 })

    const nextTime = timesToReport.find((time) =>
      time >= currentPlayState.progress && time !== lastReportedProgress
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

    const timeUntilNext = nextTime - currentPlayState.progress

    timeoutId = setTimeout(() => {
      lastReportedProgress = nextTime
      typedBrowserCall("reachedCheckpoint", nextTime)
      setPlayState({ progress: nextTime })
      createNextTimeout()
    }, timeUntilNext)
  }

  const setPlayState = (newState: Partial<PlayState>) => {
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

    startTime = Date.now() - currentPlayState.progress
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

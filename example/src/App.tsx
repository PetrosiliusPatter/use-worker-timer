import { useCallback, useMemo } from "react"
import { usePlayback } from "use-worker-timer"
import { DemoWrapper, ProgressContainer, ProgressSlider } from "./styles"
import { formatMs } from "./utils"

const exampleCheckpoints = [
  { time: 0, callback: () => console.log("Start") },
  { time: 5000, callback: () => console.log("5 seconds") },
  { time: 10000, callback: () => console.log("10 seconds") },
  { time: 15000, callback: () => console.log("15 seconds (Halftime!)") },
  { time: 20000, callback: () => console.log("20 seconds") },
  { time: 25000, callback: () => console.log("25 seconds") },
  { time: 30000, callback: () => console.log("30 seconds (End)!") },
]
const endTime = Math.max(...exampleCheckpoints.map(({ time }) => time))

const reportCheckpoint = (ms: number) => {
  const checkpoint = exampleCheckpoints.find(({ time }) => time === ms)
  if (checkpoint) checkpoint.callback()
}

const App = () => {
  // ------- Playback Controls -------
  const {
    isReady,
    playState,
    estimatedProgress,
    play,
    pause,
    stop,
    setLooping,
    setPlaybackProgress,
  } = usePlayback({
    reportCheckpoint,
    checkpoints: exampleCheckpoints.map(({ time }) => time),
    estimationUpdateInterval: 100,
  })

  const toggleLooping = useCallback(() => {
    if (!playState) return
    setLooping(!playState.looping)
  }, [playState, setLooping])

  // ------- Playback Info -------
  const progressLabels = useMemo(
    () => ({
      reported: formatMs(playState?.progress ?? 0),
      estimated: formatMs(estimatedProgress ?? 0),
    }),
    [estimatedProgress, playState?.progress],
  )

  // ------- Render -------
  return (
    <DemoWrapper>
      <span>Worker is {isReady ? "" : "not"} ready</span>
      <button onClick={play}>play</button>
      <button onClick={pause}>pause</button>
      <button onClick={stop}>stop</button>
      <button onClick={toggleLooping}>
        Toggle looping (currently {playState?.looping ? "on" : "off"})
      </button>
      <ProgressContainer>
        <ProgressSlider
          type="range"
          min={0}
          max={endTime}
          value={estimatedProgress ?? 0}
          onChange={(e) => setPlaybackProgress(e.target.valueAsNumber)}
        />
        {progressLabels?.reported !== undefined && (
          <span>Reported progress: {progressLabels?.reported}</span>
        )}
        {progressLabels?.estimated !== undefined && (
          <span>Estimated progress: {progressLabels?.estimated}</span>
        )}
      </ProgressContainer>
    </DemoWrapper>
  )
}

export default App

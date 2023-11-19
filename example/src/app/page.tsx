'use client'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {usePlayback} from 'use-worker-timer'
import {DemoWrapper, ProgressContainer, ProgressSlider} from './styles'
import {formatMs, urlWithBasePath} from './utils'
import {LagGraph} from './components/LogGraph/LogGraph'

const checkpoints = Array.from({length: 4 * 8}).map(
  (_, i) => (i * (60 * 1000)) / 60
) // 8 bars at 60bpm
const endTime = Math.max(...checkpoints)

const App = () => {
  // ------- Sound -------
  const [soundEffect, setSoundEffect] = useState<HTMLAudioElement>()
  useEffect(() => setSoundEffect(new Audio(urlWithBasePath('/snare.wav'))), [])

  const reportCheckpoint = useCallback(() => soundEffect?.play(), [soundEffect])

  // ------- Playback Controls -------
  const {
    isReady,
    playState,
    estimatedProgress,
    lagLog,
    play,
    pause,
    stop,
    setLooping,
    setPlaybackProgress,
  } = usePlayback({
    reportCheckpoint,
    checkpoints,
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
    [estimatedProgress, playState?.progress]
  )

  const trimmedLog = useMemo(
    () => lagLog.completeLog.slice(-checkpoints.length),
    [lagLog.completeLog]
  )

  // ------- Render -------
  return (
    <DemoWrapper>
      <span>Worker is {!isReady && 'not'} ready</span>
      <button onClick={play}>play</button>
      <button onClick={pause}>pause</button>
      <button onClick={stop}>stop</button>
      <button onClick={toggleLooping}>
        Toggle looping (currently {playState?.looping ? 'on' : 'off'})
      </button>
      <ProgressContainer>
        <ProgressSlider
          type='range'
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
      <LagGraph data={trimmedLog} />
    </DemoWrapper>
  )
}

export default App

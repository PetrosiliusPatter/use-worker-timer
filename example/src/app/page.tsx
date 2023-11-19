'use client'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {usePlayback} from 'use-worker-timer'
import {
  ControllRow,
  DemoWrapper,
  Description,
  InfoText,
  ProgressContainer,
  ProgressSlider,
} from './styles'
import {formatMs, urlWithBasePath} from './utils'
import {LagGraph} from './components/LogGraph/LogGraph'

const checkpoints = Array.from({length: 4 * 8}).map(
  (_, i) => (i * (60 * 1000)) / 60
) // 8 bars at 60bpm, totalling at 32 seconds
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
      <Description>
        This is a demo of the{' '}
        <a href={'https://github.com/PetrosiliusPatter/use-worker-timer'}>
          use-worker-timer
        </a>{' '}
        package .
        <br />
        It provides an easy-to-use hook, with which you can schedule callbacks
        to be called at certain times. Using a web worker has the advantage of
        running the timer on a separate thread, preventing it from being blocked
        by resource-intensive main thread operations. <br />
        Particularly valuable for music applications, where precise timing is
        essential. <br />
        <br />
        The hook offers functions to control playback, access the last reported
        playstate, view a log of the lag between callback scheduling and
        execution, and the estimated progress since the last reported playstate.
        <br />
        <br />
        For this demo, the worker will play a snare sound every second and log
        the time lag between scheduling and execution. <br />
        Its essential to acknowledge that achieving perfect accuracy in
        JavaScript remains challenging due to inherent language limitations.
        Although threading-related inaccuracies have been addressed, overall
        timing precision is still influenced by platform and browser performance
        characteristics. For this reason, the timer might still be inaccurate by
        a few milliseconds. <br />
      </Description>
      <InfoText>Worker is {!isReady && 'not'} ready</InfoText>
      <ControllRow>
        <button onClick={play}>Play</button>
        <button onClick={pause}>Pause</button>
        <button onClick={stop}>Stop</button>
        <button onClick={toggleLooping}>
          Toggle Looping (Currently {playState?.looping ? 'on' : 'off'})
        </button>
      </ControllRow>
      <ProgressContainer>
        <ProgressSlider
          type='range'
          min={0}
          max={endTime}
          value={estimatedProgress ?? 0}
          onChange={(e) => setPlaybackProgress(e.target.valueAsNumber)}
        />
        {progressLabels?.reported !== undefined && (
          <InfoText>Reported progress: {progressLabels?.reported}</InfoText>
        )}
        {progressLabels?.estimated !== undefined && (
          <InfoText>Estimated progress: {progressLabels?.estimated}</InfoText>
        )}
      </ProgressContainer>
      <LagGraph data={trimmedLog} />
    </DemoWrapper>
  )
}

export default App

import {useCallback, useEffect, useMemo, useState} from 'react'
import {usePlayback} from 'use-worker-timer'
import {DemoWrapper, ProgressContainer, ProgressSlider} from './styles'
import {formatMs} from './utils'

import snareSound from './assets/snare.wav'

const soundSpacing = (60 * 1000) / 160

const App = () => {
  // ------- Sound -------
  const [soundEffect, setSoundEffect] = useState<HTMLAudioElement | undefined>(
    undefined
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    setSoundEffect(new Audio(snareSound))
  }, [])

  const checkpoints = useMemo(
    () =>
      Array.from({length: 4 * 16}).map((_, i, arr) => ({
        time: i * soundSpacing, // 160 bpm
        callback: () => {
          const isLast = i === arr.length - 1
          if (isLast) {
            console.log('Reached the end of the song')
            return
          }
          soundEffect.play()
        },
      })),
    [soundEffect]
  )

  const endTime = useMemo(
    () => Math.max(...checkpoints.map(({time}) => time)),
    [checkpoints]
  )

  const reportCheckpoint = useCallback(
    (ms: number) => checkpoints.find(({time}) => time === ms)?.callback(),
    [checkpoints]
  )

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
    checkpoints: checkpoints.map(({time}) => time),
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

  // ------- Render -------
  return (
    <DemoWrapper>
      <span>Worker is {isReady ? '' : 'not'} ready</span>
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
    </DemoWrapper>
  )
}

export default App

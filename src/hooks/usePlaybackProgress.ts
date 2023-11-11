import { React } from "../deps.ts"
import { ReportedPlayState } from "./usePlayback.ts"

export const usePlaybackProgress = (
  lastReportedState?: ReportedPlayState,
  interval?: number,
) => {
  const [estimation, setEstimation] = React.useState<number | undefined>(
    undefined,
  )

  React.useEffect(() => {
    if (!lastReportedState) return
    if (!lastReportedState.state.playing) {
      setEstimation(lastReportedState.state.progress)
      return
    }
    if (!interval) {
      setEstimation(lastReportedState.state.progress)
      return
    }

    const newInterval = setInterval(() => {
      const now = new Date()
      const elapsed = now.getTime() - lastReportedState.reportedAt.getTime()
      setEstimation(lastReportedState.state.progress + elapsed)
    }, interval)

    return () => clearInterval(newInterval)
  }, [lastReportedState, interval])

  return estimation
}

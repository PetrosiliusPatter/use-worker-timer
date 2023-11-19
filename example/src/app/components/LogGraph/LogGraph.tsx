import {useMemo} from 'react'
import {Line} from 'react-chartjs-2'

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import {StyledLog} from './styles'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const minBoundary = 30

type Props = {
  data: number[]
}
export const LagGraph = ({data}: Props) => {
  const min = useMemo(() => Math.min(...data), [data])
  const max = useMemo(() => Math.max(...data), [data])

  const chartData = useMemo(
    () => ({
      labels: data.map(() => ''),
      datasets: [
        {
          label: 'Lag in ms',
          data: data,
          fill: false,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    }),
    [data]
  )

  const chartOptions = useMemo(
    () => ({
      animation: false as const, // as const to fix type error
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          min: Math.min(-minBoundary, min),
          max: Math.max(minBoundary, max),
          title: {
            text: 'Lag in ms',
            display: true,
          },
        },
      },
    }),
    [max, min]
  )

  return (
    <StyledLog>
      <Line options={chartOptions} data={chartData} />
    </StyledLog>
  )
}

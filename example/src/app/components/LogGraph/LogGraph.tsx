import {useMemo} from 'react'
import {Line} from 'react-chartjs-2'
import {LagLog} from 'use-worker-timer'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
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

type Props = {
  data: LagLog[]
}
export const LagGraph = ({data}: Props) => {
  const min = useMemo(() => Math.min(...data.map(({value}) => value)), [data])
  const max = useMemo(() => Math.max(...data.map(({value}) => value)), [data])

  const chartData = useMemo(
    () => ({
      labels: data.map(({value}) => ''),
      datasets: [
        {
          label: 'Lag in ms',
          data: data.map(({value}) => value),
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
          min: Math.min(-20, min),
          max: Math.max(20, max),
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

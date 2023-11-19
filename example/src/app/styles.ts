import styled from 'styled-components'

export const DemoWrapper = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.5rem;
  padding: 2rem;
`

export const ProgressContainer = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`

export const ProgressSlider = styled.input`
  width: 80%;
  height: 40px;
`

export const ControllRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`

export const InfoText = styled.span`
  font-size: 0.8rem;
  color: #c1c1c1;
`

export const Description = styled.span`
  font-size: 1rem;
  width: 700px;
  max-width: 80vw;
  color: #ffffff;
  a {
    color: #f5a152;
    text-decoration: underline;
  }
`

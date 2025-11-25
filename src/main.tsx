import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ThanksgivingOptimizer from './ThanksgivingOptimizer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThanksgivingOptimizer />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TodoDetail from './pages/Todo.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TodoDetail />
  </StrictMode>,
)

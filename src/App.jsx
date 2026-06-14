import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { SimulationProvider } from './context/SimulationContext.jsx'
import AppRouter from './router/AppRouter.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SimulationProvider>
            <AppRouter />
          </SimulationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
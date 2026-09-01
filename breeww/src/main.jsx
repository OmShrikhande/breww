import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { WalletProvider } from './context/WalletContext'
import { WebSocketProvider } from './context/WebSocketContext'
import { AudioProvider } from './context/AudioContext'
import PageRoot from './pageRegistry.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <WalletProvider>
        <WebSocketProvider>
          <AudioProvider>
            <PageRoot />
          </AudioProvider>
        </WebSocketProvider>
      </WalletProvider>
    </AuthProvider>
  </StrictMode>,
)

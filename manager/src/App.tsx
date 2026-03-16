import { useState } from 'react'
import StatusPage from './pages/Status'
import LogsPage from './pages/Logs'
import ChatPage from './pages/Chat'
import SettingsPage from './pages/Settings'
import { useBridgeStore } from './store/bridge'

type Page = 'status' | 'logs' | 'chat' | 'settings'

const navItems = [
  { id: 'status' as Page, label: 'Status', icon: '📊' },
  { id: 'logs' as Page, label: 'Logs', icon: '📝' },
  { id: 'chat' as Page, label: 'Chat', icon: '💬' },
  { id: 'settings' as Page, label: 'Settings', icon: '⚙️' },
]

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('status')
  const { status } = useBridgeStore()

  const renderPage = () => {
    switch (currentPage) {
      case 'status': return <StatusPage />
      case 'logs': return <LogsPage />
      case 'chat': return <ChatPage />
      case 'settings': return <SettingsPage />
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Claude-to-IM</h1>
          <span>
            {status.running ? '● Running' : '○ Stopped'}
          </span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
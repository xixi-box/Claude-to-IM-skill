import { useState, useEffect } from 'react'
import StatusPage from './pages/Status'
import LogsPage from './pages/Logs'
import ChatPage from './pages/Chat'
import SettingsPage from './pages/Settings'
import { useBridgeStore } from './store/bridge'
import { getTranslation } from './i18n'

type Page = 'status' | 'logs' | 'chat' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('status')
  const { status, settings, fetchSettings } = useBridgeStore()
  const t = (key: any) => getTranslation(settings.language, key)

  // 加载设置
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // 应用主题
  useEffect(() => {
    const applyTheme = () => {
      let theme = settings.theme
      if (theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      document.documentElement.setAttribute('data-theme', theme)
    }
    applyTheme()

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [settings.theme])

  const navItems = [
    { id: 'status' as Page, label: t('status'), icon: '📊' },
    { id: 'logs' as Page, label: t('logs'), icon: '📝' },
    { id: 'chat' as Page, label: t('chat'), icon: '💬' },
    { id: 'settings' as Page, label: t('settings'), icon: '⚙️' },
  ]

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
            {status.running ? `● ${t('running')}` : `○ ${t('stopped')}`}
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
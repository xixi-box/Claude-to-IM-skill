import { useState, useEffect } from 'react'
import StatusPage from './pages/Status'
import LogsPage from './pages/Logs'
import ChatPage from './pages/Chat'
import ConfigPage from './pages/Config'
import SettingsPage from './pages/Settings'
import InstallPage from './pages/Install'
import { useBridgeStore } from './store/bridge'
import { getTranslation } from './i18n'

type Page = 'status' | 'logs' | 'chat' | 'config' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('status')
  const { status, settings, fetchSettings, skillStatus, fetchSkillStatus } = useBridgeStore()
  const t = (key: any) => getTranslation(settings.language, key)

  // 加载设置和技能状态
  useEffect(() => {
    fetchSettings()
    fetchSkillStatus()
  }, [fetchSettings, fetchSkillStatus])

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

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [settings.theme])

  // 如果未安装技能，显示安装页面
  if (!skillStatus.installed) {
    return <InstallPage />
  }

  const navItems = [
    { id: 'status' as Page, label: t('status'), icon: '📊' },
    { id: 'config' as Page, label: t('config'), icon: '🔌' },
    { id: 'logs' as Page, label: t('logs'), icon: '📝' },
    { id: 'chat' as Page, label: t('chat'), icon: '💬' },
    { id: 'settings' as Page, label: t('settings'), icon: '⚙️' },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'status': return <StatusPage />
      case 'logs': return <LogsPage />
      case 'chat': return <ChatPage />
      case 'config': return <ConfigPage />
      case 'settings': return <SettingsPage />
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Claude-to-IM</h1>
          <span className={status.running ? 'status-running' : 'status-stopped'}>
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
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="version">v1.0.0</span>
        </div>
      </aside>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
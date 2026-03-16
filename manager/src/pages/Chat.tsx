import { useEffect, useState } from 'react'
import { useBridgeStore, ChatMessage } from '../store/bridge'
import { getTranslation } from '../i18n'
import dayjs from 'dayjs'

export default function ChatPage() {
  const { messages, fetchMessages, clearMessages, settings } = useBridgeStore()
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const t = (key: any) => getTranslation(settings.language, key)

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const sessions = [...new Set(messages.map(m => m.session_id))]

  const filteredMessages = messages.filter(m => {
    if (selectedSession && m.session_id !== selectedSession) return false
    if (platformFilter !== 'all' && m.platform !== platformFilter) return false
    return true
  })

  const handleClearAll = async () => {
    if (confirm(t('confirmClearAll'))) {
      await clearMessages()
    }
  }

  const handleClearOld = async () => {
    if (confirm(t('confirmClearOld'))) {
      await clearMessages('old')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('chatTitle')}</h2>
        <p>{t('chatSubtitle')}</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <select
              className="form-input"
              style={{ width: 200 }}
              value={selectedSession || ''}
              onChange={e => setSelectedSession(e.target.value || null)}
            >
              <option value="">{t('allSessions')}</option>
              {sessions.map(s => (
                <option key={s} value={s}>{s.slice(0, 20)}...</option>
              ))}
            </select>
            <select
              className="form-input"
              style={{ width: 120 }}
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
            >
              <option value="all">{t('allPlatforms')}</option>
              <option value="telegram">Telegram</option>
              <option value="discord">Discord</option>
              <option value="feishu">Feishu</option>
              <option value="qq">QQ</option>
            </select>
          </div>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={handleClearOld}>
              {t('clearOld')}
            </button>
            <button className="btn btn-error" onClick={handleClearAll}>
              {t('clearAll')}
            </button>
          </div>
        </div>

        <div className="chat-list" style={{ maxHeight: 500, overflow: 'auto' }}>
          {filteredMessages.length === 0 ? (
            <div className="empty-state">
              <p>{t('noMessages')}</p>
            </div>
          ) : (
            filteredMessages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className="chat-header">
                  <span>{msg.role === 'user' ? t('user') : 'Claude'}</span>
                  <span>({msg.platform})</span>
                  <span>{dayjs(msg.timestamp).format('HH:mm:ss')}</span>
                </div>
                <div className="chat-content">
                  {msg.content.slice(0, 500)}
                  {msg.content.length > 500 && '...'}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          {filteredMessages.length} {t('messages')}
        </div>
      </div>
    </div>
  )
}
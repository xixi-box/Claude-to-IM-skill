import { useEffect } from 'react'
import { useBridgeStore } from '../store/bridge'
import { getTranslation } from '../i18n'

export default function StatusPage() {
  const { status, fetchStatus, start, stop, restart, settings } = useBridgeStore()
  const t = (key: any) => getTranslation(settings.language, key)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('statusTitle')}</h2>
        <p>{t('statusSubtitle')}</p>
      </div>

      <div className="card">
        <div className="card-title">{t('overview')}</div>
        <div className="status-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="status-item">
            <div className="status-label">{t('status')}</div>
            <div className={`status-value ${status.running ? 'running' : 'stopped'}`}>
              {status.running ? t('running') : t('stopped')}
            </div>
          </div>
          <div className="status-item">
            <div className="status-label">{t('pid')}</div>
            <div className="status-value">{status.pid || '-'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{t('controls')}</div>
        <div className="btn-group">
          <button className="btn btn-success" onClick={start} disabled={status.running}>
            {t('start')}
          </button>
          <button className="btn btn-error" onClick={stop} disabled={!status.running}>
            {t('stop')}
          </button>
          <button className="btn btn-secondary" onClick={restart} disabled={!status.running}>
            {t('restart')}
          </button>
        </div>
      </div>

      {status.platforms.length > 0 && (
        <div className="card">
          <div className="card-title">{t('connectedPlatforms')}</div>
          <div className="platform-tags">
            {status.platforms.map(p => (
              <span key={p} className="platform-tag active">{p}</span>
            ))}
          </div>
        </div>
      )}

      {status.last_error && (
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <div className="card-title" style={{ color: 'var(--error)' }}>{t('lastError')}</div>
          <pre style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {status.last_error}
          </pre>
        </div>
      )}
    </div>
  )
}
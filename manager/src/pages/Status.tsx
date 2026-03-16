import { useEffect } from 'react'
import { useBridgeStore } from '../store/bridge'

export default function StatusPage() {
  const { status, fetchStatus, start, stop, restart } = useBridgeStore()

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return (
    <div className="page">
      <div className="page-header">
        <h2>Status</h2>
        <p>View bridge service status</p>
      </div>

      <div className="card">
        <div className="card-title">Overview</div>
        <div className="status-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="status-item">
            <div className="status-label">Status</div>
            <div className={`status-value ${status.running ? 'running' : 'stopped'}`}>
              {status.running ? 'Running' : 'Stopped'}
            </div>
          </div>
          <div className="status-item">
            <div className="status-label">PID</div>
            <div className="status-value">{status.pid || '-'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Controls</div>
        <div className="btn-group">
          <button className="btn btn-success" onClick={start} disabled={status.running}>
            Start
          </button>
          <button className="btn btn-error" onClick={stop} disabled={!status.running}>
            Stop
          </button>
          <button className="btn btn-secondary" onClick={restart} disabled={!status.running}>
            Restart
          </button>
        </div>
      </div>

      {status.platforms.length > 0 && (
        <div className="card">
          <div className="card-title">Connected Platforms</div>
          <div className="platform-tags">
            {status.platforms.map(p => (
              <span key={p} className="platform-tag active">{p}</span>
            ))}
          </div>
        </div>
      )}

      {status.last_error && (
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <div className="card-title" style={{ color: 'var(--error)' }}>Last Error</div>
          <pre style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {status.last_error}
          </pre>
        </div>
      )}
    </div>
  )
}
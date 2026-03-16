import { useEffect, useState } from 'react'
import { useBridgeStore, LogLine } from '../store/bridge'

export default function LogsPage() {
  const { logs, fetchLogs } = useBridgeStore()
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all')

  useEffect(() => {
    fetchLogs(200)
    const interval = setInterval(() => fetchLogs(200), 3000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return log.level === filter
  })

  return (
    <div className="page">
      <div className="page-header">
        <h2>System Logs</h2>
        <p>View bridge service logs</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="btn-group">
            {(['all', 'info', 'warn', 'error'] as const).map(f => (
              <button
                key={f}
                className={`btn btn-secondary ${filter === f ? 'btn-primary' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={() => fetchLogs(500)}>
            Refresh
          </button>
        </div>

        <div className="log-viewer" style={{ height: 500, overflow: 'auto' }}>
          {filteredLogs.length === 0 ? (
            <div className="empty-state">
              <p>No logs</p>
            </div>
          ) : (
            filteredLogs.map((log, i) => (
              <div key={i} className="log-line">
                <span className="log-time">{log.time}</span>
                <span className={`log-level ${log.level}`}>[{log.level.toUpperCase()}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
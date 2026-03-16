import { useEffect, useState } from 'react'
import { useBridgeStore, Settings } from '../store/bridge'

export default function SettingsPage() {
  const { settings, fetchSettings, saveSettings } = useBridgeStore()
  const [localSettings, setLocalSettings] = useState<Settings>(settings)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    saveSettings(localSettings)
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure application preferences</p>
      </div>

      <div className="card">
        <div className="card-title">Startup</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.auto_start}
              onChange={e => updateSetting('auto_start', e.target.checked)}
            />
            <span>Auto-start on login</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.start_minimized}
              onChange={e => updateSetting('start_minimized', e.target.checked)}
            />
            <span>Start minimized to tray</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.auto_start_bridge}
              onChange={e => updateSetting('auto_start_bridge', e.target.checked)}
            />
            <span>Auto-start bridge on launch</span>
          </label>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Notifications</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.notify_on_start}
              onChange={e => updateSetting('notify_on_start', e.target.checked)}
            />
            <span>Notify on bridge start</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.notify_on_stop}
              onChange={e => updateSetting('notify_on_stop', e.target.checked)}
            />
            <span>Notify on bridge stop</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.notify_on_message}
              onChange={e => updateSetting('notify_on_message', e.target.checked)}
            />
            <span>Notify on new message</span>
          </label>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Data Cleanup</div>
        <div className="form-group">
          <label className="form-label">Message retention (days)</label>
          <select
            className="form-input"
            style={{ width: 200 }}
            value={localSettings.message_retention_days}
            onChange={e => updateSetting('message_retention_days', parseInt(e.target.value))}
          >
            <option value={1}>1 day</option>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={0}>Never</option>
          </select>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Messages older than this will be automatically deleted
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Appearance</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Theme</label>
            <select
              className="form-input"
              value={localSettings.theme}
              onChange={e => updateSetting('theme', e.target.value)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              className="form-input"
              value={localSettings.language}
              onChange={e => updateSetting('language', e.target.value)}
            >
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={() => fetchSettings()}>
          Reset
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useBridgeStore, Settings } from '../store/bridge'
import { getTranslation } from '../i18n'

export default function SettingsPage() {
  const { settings, fetchSettings, saveSettings } = useBridgeStore()
  const [localSettings, setLocalSettings] = useState<Settings>(settings)
  const t = (key: any) => getTranslation(settings.language, key)

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
        <h2>{t('settingsTitle')}</h2>
        <p>{t('settingsSubtitle')}</p>
      </div>

      <div className="card">
        <div className="card-title">{t('startup')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.auto_start}
              onChange={e => updateSetting('auto_start', e.target.checked)}
            />
            <span>{t('autoStart')}</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.start_minimized}
              onChange={e => updateSetting('start_minimized', e.target.checked)}
            />
            <span>{t('startMinimized')}</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.auto_start_bridge}
              onChange={e => updateSetting('auto_start_bridge', e.target.checked)}
            />
            <span>{t('autoStartBridge')}</span>
          </label>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{t('notifications')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.notify_on_start}
              onChange={e => updateSetting('notify_on_start', e.target.checked)}
            />
            <span>{t('notifyOnStart')}</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.notify_on_stop}
              onChange={e => updateSetting('notify_on_stop', e.target.checked)}
            />
            <span>{t('notifyOnStop')}</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={localSettings.notify_on_message}
              onChange={e => updateSetting('notify_on_message', e.target.checked)}
            />
            <span>{t('notifyOnMessage')}</span>
          </label>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{t('dataCleanup')}</div>
        <div className="form-group">
          <label className="form-label">{t('messageRetention')}</label>
          <select
            className="form-input"
            style={{ width: 200 }}
            value={localSettings.message_retention_days}
            onChange={e => updateSetting('message_retention_days', parseInt(e.target.value))}
          >
            <option value={1}>1 {t('days')}</option>
            <option value={3}>3 {t('days')}</option>
            <option value={7}>7 {t('days')}</option>
            <option value={14}>14 {t('days')}</option>
            <option value={30}>30 {t('days')}</option>
            <option value={0}>{t('never')}</option>
          </select>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {t('messageRetentionHint')}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{t('appearance')}</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('theme')}</label>
            <select
              className="form-input"
              value={localSettings.theme}
              onChange={e => updateSetting('theme', e.target.value)}
            >
              <option value="system">{t('themeSystem')}</option>
              <option value="light">{t('themeLight')}</option>
              <option value="dark">{t('themeDark')}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('language')}</label>
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
          {t('reset')}
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          {t('save')}
        </button>
      </div>
    </div>
  )
}
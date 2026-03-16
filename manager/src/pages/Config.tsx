import { useEffect, useState } from 'react'
import { useBridgeStore, BridgeConfig } from '../store/bridge'
import { getTranslation } from '../i18n'

const platformOptions = [
  { id: 'telegram', label: 'Telegram' },
  { id: 'discord', label: 'Discord' },
  { id: 'feishu', label: '飞书 / Lark' },
  { id: 'qq', label: 'QQ' },
]

export default function ConfigPage() {
  const { config, fetchConfig, saveConfig, settings } = useBridgeStore()
  const [localConfig, setLocalConfig] = useState<BridgeConfig>(config)
  const [activePlatform, setActivePlatform] = useState<string>('general')
  const t = (key: any) => getTranslation(settings.language, key)

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const updateConfig = (key: keyof BridgeConfig, value: string) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }))
  }

  const toggleChannel = (channel: string) => {
    const current = localConfig.CTI_ENABLED_CHANNELS || ''
    const channels = current.split(',').filter(Boolean)
    const exists = channels.includes(channel)
    const newChannels = exists
      ? channels.filter(c => c !== channel)
      : [...channels, channel]
    updateConfig('CTI_ENABLED_CHANNELS', newChannels.join(','))
  }

  const handleSave = () => {
    saveConfig(localConfig)
  }

  const enabledChannels = (localConfig.CTI_ENABLED_CHANNELS || '').split(',').filter(Boolean)

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('configTitle')}</h2>
        <p>{t('configSubtitle')}</p>
      </div>

      {/* 平台选择 */}
      <div className="card">
        <div className="card-title">{t('enabledPlatforms')}</div>
        <div className="platform-tags">
          {platformOptions.map(p => (
            <span
              key={p.id}
              className={`platform-tag ${enabledChannels.includes(p.id) ? 'active' : ''}`}
              onClick={() => toggleChannel(p.id)}
            >
              {p.label}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
          {t('enabledPlatformsHint')}
        </p>
      </div>

      {/* 选项卡 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { id: 'general', label: t('general') },
          { id: 'telegram', label: 'Telegram' },
          { id: 'discord', label: 'Discord' },
          { id: 'feishu', label: t('feishu') },
          { id: 'qq', label: 'QQ' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`btn ${activePlatform === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActivePlatform(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 通用设置 */}
      {activePlatform === 'general' && (
        <div className="card">
          <div className="card-title">{t('generalSettings')}</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('runtime')}</label>
              <select
                className="form-input"
                value={localConfig.CTI_RUNTIME || 'claude'}
                onChange={e => updateConfig('CTI_RUNTIME', e.target.value)}
              >
                <option value="claude">Claude Code</option>
                <option value="codex">Codex</option>
                <option value="auto">{t('autoDetect')}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('defaultMode')}</label>
              <select
                className="form-input"
                value={localConfig.CTI_DEFAULT_MODE || 'code'}
                onChange={e => updateConfig('CTI_DEFAULT_MODE', e.target.value)}
              >
                <option value="code">Code</option>
                <option value="plan">Plan</option>
                <option value="ask">Ask</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('defaultWorkdir')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="C:\Users\YourName\Projects"
              value={localConfig.CTI_DEFAULT_WORKDIR || ''}
              onChange={e => updateConfig('CTI_DEFAULT_WORKDIR', e.target.value)}
            />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {t('defaultWorkdirHint')}
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">{t('defaultModel')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="claude-sonnet-4-6 (optional)"
              value={localConfig.CTI_DEFAULT_MODEL || ''}
              onChange={e => updateConfig('CTI_DEFAULT_MODEL', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('anthropicApiKey')}</label>
            <input
              type="password"
              className="form-input"
              placeholder={t('anthropicApiKeyHint')}
              value={localConfig.ANTHROPIC_API_KEY || ''}
              onChange={e => updateConfig('ANTHROPIC_API_KEY', e.target.value)}
            />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {t('anthropicApiKeyDesc')}
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">{t('anthropicBaseUrl')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://api.anthropic.com"
              value={localConfig.ANTHROPIC_BASE_URL || ''}
              onChange={e => updateConfig('ANTHROPIC_BASE_URL', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Telegram 配置 */}
      {activePlatform === 'telegram' && (
        <div className="card">
          <div className="card-title">Telegram {t('config')}</div>
          <div className="form-group">
            <label className="form-label">{t('botToken')} *</label>
            <input
              type="password"
              className="form-input"
              placeholder="123456789:AABbCc..."
              value={localConfig.CTI_TG_BOT_TOKEN || ''}
              onChange={e => updateConfig('CTI_TG_BOT_TOKEN', e.target.value)}
            />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {t('tgBotTokenHint')}
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">{t('chatId')} *</label>
            <input
              type="text"
              className="form-input"
              placeholder="123456789"
              value={localConfig.CTI_TG_CHAT_ID || ''}
              onChange={e => updateConfig('CTI_TG_CHAT_ID', e.target.value)}
            />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {t('chatIdHint')}
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">{t('allowedUsers')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="user_id_1,user_id_2"
              value={localConfig.CTI_TG_ALLOWED_USERS || ''}
              onChange={e => updateConfig('CTI_TG_ALLOWED_USERS', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Discord 配置 */}
      {activePlatform === 'discord' && (
        <div className="card">
          <div className="card-title">Discord {t('config')}</div>
          <div className="form-group">
            <label className="form-label">{t('botToken')} *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Bot Token"
              value={localConfig.CTI_DISCORD_BOT_TOKEN || ''}
              onChange={e => updateConfig('CTI_DISCORD_BOT_TOKEN', e.target.value)}
            />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {t('discordBotTokenHint')}
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">{t('allowedUsers')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="user_id_1,user_id_2"
              value={localConfig.CTI_DISCORD_ALLOWED_USERS || ''}
              onChange={e => updateConfig('CTI_DISCORD_ALLOWED_USERS', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('allowedChannels')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="channel_id_1"
              value={localConfig.CTI_DISCORD_ALLOWED_CHANNELS || ''}
              onChange={e => updateConfig('CTI_DISCORD_ALLOWED_CHANNELS', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('allowedGuilds')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="guild_id_1"
              value={localConfig.CTI_DISCORD_ALLOWED_GUILDS || ''}
              onChange={e => updateConfig('CTI_DISCORD_ALLOWED_GUILDS', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Feishu 配置 */}
      {activePlatform === 'feishu' && (
        <div className="card">
          <div className="card-title">{t('feishu')} {t('config')}</div>
          <div className="form-group">
            <label className="form-label">App ID *</label>
            <input
              type="text"
              className="form-input"
              placeholder="cli_xxx"
              value={localConfig.CTI_FEISHU_APP_ID || ''}
              onChange={e => updateConfig('CTI_FEISHU_APP_ID', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">App Secret *</label>
            <input
              type="password"
              className="form-input"
              placeholder="App Secret"
              value={localConfig.CTI_FEISHU_APP_SECRET || ''}
              onChange={e => updateConfig('CTI_FEISHU_APP_SECRET', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('feishuDomain')}</label>
            <select
              className="form-input"
              value={localConfig.CTI_FEISHU_DOMAIN || 'https://open.feishu.cn'}
              onChange={e => updateConfig('CTI_FEISHU_DOMAIN', e.target.value)}
            >
              <option value="https://open.feishu.cn">飞书 (中国)</option>
              <option value="https://open.larksuite.com">Lark (国际)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('allowedUsers')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="user_id_1,user_id_2"
              value={localConfig.CTI_FEISHU_ALLOWED_USERS || ''}
              onChange={e => updateConfig('CTI_FEISHU_ALLOWED_USERS', e.target.value)}
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 8 }}>
            {t('feishuPublishHint')}
          </p>
        </div>
      )}

      {/* QQ 配置 */}
      {activePlatform === 'qq' && (
        <div className="card">
          <div className="card-title">QQ {t('config')}</div>
          <div className="form-group">
            <label className="form-label">App ID *</label>
            <input
              type="text"
              className="form-input"
              placeholder="从 q.qq.com 获取"
              value={localConfig.CTI_QQ_APP_ID || ''}
              onChange={e => updateConfig('CTI_QQ_APP_ID', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">App Secret *</label>
            <input
              type="password"
              className="form-input"
              placeholder="App Secret"
              value={localConfig.CTI_QQ_APP_SECRET || ''}
              onChange={e => updateConfig('CTI_QQ_APP_SECRET', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('allowedUsers')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="openid_1,openid_2 (不是QQ号)"
              value={localConfig.CTI_QQ_ALLOWED_USERS || ''}
              onChange={e => updateConfig('CTI_QQ_ALLOWED_USERS', e.target.value)}
            />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {t('qqAllowedUsersHint')}
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 8 }}>
            {t('qqSandboxHint')}
          </p>
        </div>
      )}

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={() => fetchConfig()}>
          {t('reset')}
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          {t('saveConfig')}
        </button>
      </div>
    </div>
  )
}
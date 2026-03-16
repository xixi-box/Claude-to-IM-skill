import { useEffect } from 'react'
import { useBridgeStore } from '../store/bridge'
import { getTranslation } from '../i18n'

export default function InstallPage() {
  const { skillStatus, isInstalling, fetchSkillStatus, installSkill, settings } = useBridgeStore()
  const t = (key: any) => getTranslation(settings.language, key)

  useEffect(() => {
    fetchSkillStatus()
  }, [fetchSkillStatus])

  const handleInstall = async () => {
    await installSkill()
  }

  return (
    <div className="install-page">
      <div className="install-card">
        <div className="install-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>Claude-to-IM</h1>
        <p className="install-subtitle">{t('installSubtitle')}</p>

        {!skillStatus.installed && !skillStatus.error && (
          <div className="install-status">
            <div className="status-icon warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>{t('skillNotInstalled')}</p>
          </div>
        )}

        {skillStatus.error && (
          <div className="install-status error">
            <p>{skillStatus.error}</p>
          </div>
        )}

        {skillStatus.installed && (
          <div className="install-status success">
            <div className="status-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>{t('skillInstalled')} v{skillStatus.version}</p>
          </div>
        )}

        <div className="install-requirements">
          <h3>{t('requirements')}</h3>
          <ul>
            <li>
              <span className="req-icon">✓</span>
              Node.js >= 20
            </li>
            <li>
              <span className="req-icon">✓</span>
              Git
            </li>
            <li>
              <span className="req-icon">✓</span>
              Claude Code CLI
            </li>
          </ul>
        </div>

        <button
          className="install-btn"
          onClick={handleInstall}
          disabled={isInstalling || skillStatus.installed}
        >
          {isInstalling ? (
            <>
              <span className="spinner"></span>
              {t('installing')}
            </>
          ) : skillStatus.installed ? (
            t('installed')
          ) : (
            t('installNow')
          )}
        </button>

        {skillStatus.installed && (
          <p className="install-hint">{t('installHint')}</p>
        )}
      </div>
    </div>
  )
}
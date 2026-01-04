import { useTranslation } from 'react-i18next';
import "../css/Modal.css";

function SettingsModal({ showSettings, setShowSettings, lightragUrl, setLightragUrl, databaseUrl, setDatabaseUrl, maxContextTokens, setMaxContextTokens, saveConfig }) {
  const { t, i18n } = useTranslation();

  if (!showSettings) {
    return null;
  }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setShowSettings(false)} title={t('close')}>
          &times;
        </button>
        <h3>{t('setting')}</h3>

        <div className="modal-row">
          <label htmlFor="language-select">{t('language')}</label>
          <select id="language-select" onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>

        <div className="modal-row">
          <label htmlFor="lightrag-url-input">{t('homepage:setting.lightrag_url')}</label>
          <input
            id="lightrag-url-input"
            type="text"
            value={lightragUrl}
            onChange={e => setLightragUrl(e.target.value)}
            placeholder="http://localhost:9621"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                saveConfig();
              }
            }}
          />
        </div>

        <div className="modal-row">
          <label htmlFor="database-url-input">{t('homepage:setting.database_url')}</label>
          <input
            id="database-url-input"
            type="text"
            value={databaseUrl}
            onChange={e => setDatabaseUrl(e.target.value)}
            placeholder="postgresql+asyncpg://postgres:postgres@localhost:5432/mm_enshu"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                saveConfig();
              }
            }}
          />
        </div>

        <div className="modal-row">
          <label htmlFor="max-context-tokens-input">{t('homepage:setting.max_context_tokens')}</label>
          <input
            id="max-context-tokens-input"
            type="number"
            value={maxContextTokens}
            onChange={e => setMaxContextTokens(parseInt(e.target.value) || 4096)}
            min="1024"
            placeholder="4096"
            max="50000"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                saveConfig();
              }
            }}
          />
        </div>

        <div className="modal-actions">
          <button onClick={saveConfig}>{t('save')}</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
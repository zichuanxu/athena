import { useTranslation } from 'react-i18next';

function RenameChatModal({ renameModal, setRenameModal, renameChat }) {

  const { t } = useTranslation('chat');

  if (!renameModal.open) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={() => setRenameModal({ open: false, session_id: null, title: "" })}
          title="Close"
        >
          &times;
        </button>
        <h3>{t('modals.rename.title')}</h3>
        <div className="modal-row">
          <label htmlFor="rename-input">{t('modals.rename.label')}</label>
          <input
            id="rename-input"
            type="text"
            value={renameModal.title}
            onChange={e => setRenameModal({ ...renameModal, title: e.target.value })}
            placeholder={t('modals.rename.placeholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                renameChat();
              }
            }}
          />
        </div>
        <div className="modal-actions">
          <button
            onClick={() => setRenameModal({ open: false, session_id: null, title: "" })}
            className="cancel-btn"
          >
            {t('common:cancel')}
          </button>
          <button onClick={renameChat}>{t('common:save')}</button>
        </div>
      </div>
    </div>
  );
}

export default RenameChatModal;
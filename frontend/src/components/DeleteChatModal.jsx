import { useTranslation } from 'react-i18next';

function DeleteChatModal({ deleteModal, setDeleteModal, deleteChat }) {
  const { t } = useTranslation('chat');

  if (!deleteModal.open) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={() => setDeleteModal({ open: false, session_id: null })}
          title="Close"
        >
          &times;
        </button>
        <h3>{t('modals.delete.title')}</h3>
        <div className="modal-row">
          <p>{t('modals.delete.confirm')}</p>
        </div>
        <div className="modal-actions">
          <button
            onClick={() => setDeleteModal({ open: false, session_id: null })}
            className="cancel-btn"
          >
            {t('common:cancel')}
          </button>
          <button
            onClick={() => deleteChat(deleteModal.session_id)}
            className="delete-btn"
          >
            {t('common:delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteChatModal;
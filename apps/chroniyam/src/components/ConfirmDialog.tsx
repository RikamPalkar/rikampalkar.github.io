type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal confirm-dialog">
        <header className="modal-header">
          <h2>{title}</h2>
        </header>
        <div className="confirm-message">
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          {cancelText && (
            <button
              type="button"
              className="btn secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className={`btn ${isDangerous ? 'danger' : 'primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

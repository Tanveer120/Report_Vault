import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-surface-600 mb-6">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={confirming}>
          Cancel
        </Button>
        <Button variant={variant} onClick={handleConfirm} loading={confirming}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

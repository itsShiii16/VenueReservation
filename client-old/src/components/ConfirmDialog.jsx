/**
 * ConfirmDialog.jsx — Confirmation dialog built on Modal
 */

import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

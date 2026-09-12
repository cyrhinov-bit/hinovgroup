import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'secondary';
  confirmVariant?: 'danger' | 'primary' | 'secondary' | string;
  warningNote?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant,
  confirmVariant = 'danger',
  warningNote,
  isLoading = false,
}) => {
  const activeVariant = variant || (confirmVariant === 'primary' ? 'primary' : confirmVariant === 'secondary' ? 'secondary' : 'danger');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeVariant === 'danger'
                ? 'bg-red-50 text-red-600'
                : 'bg-[#FDF5EB] text-[#D38323]'
            }`}
          >
            <AlertTriangle size={24} />
          </div>
          <div className="text-sm text-[#5F6673] space-y-2">
            <p>{message}</p>
            {warningNote && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium">
                ⚠️ {warningNote}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={activeVariant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={() => {
              onConfirm();
            }}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

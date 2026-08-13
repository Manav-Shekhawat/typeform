import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteQuestionModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteQuestionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Question">
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this question? It will be removed from the current form. 
          Existing historical responses will remain preserved.
        </p>
        
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white border-transparent"
          >
            {isDeleting ? 'Deleting...' : 'Delete question'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

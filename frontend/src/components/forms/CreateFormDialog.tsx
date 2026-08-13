import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api/client';
import { Form } from '@/lib/api/types';

interface CreateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (form: Form) => void;
}

export function CreateFormDialog({ isOpen, onClose, onSuccess }: CreateFormDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newForm = await api.post<Form>('/api/v1/forms', {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      
      onSuccess(newForm);
      setTitle('');
      setDescription('');
      router.push(`/forms/${newForm.id}/builder`);
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string }, message?: string };
      setError(e?.data?.detail || e.message || 'An error occurred while creating the form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new form">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Form Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            placeholder="e.g. Customer Feedback Survey"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none"
            placeholder="What is this form about?"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Form
          </Button>
        </div>
      </form>
    </Modal>
  );
}

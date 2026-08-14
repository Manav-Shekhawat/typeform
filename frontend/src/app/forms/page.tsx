'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Form } from '@/lib/api/types';
import { FormGrid } from '@/components/forms/FormGrid';
import { CreateFormDialog } from '@/components/forms/CreateFormDialog';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function FormsList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [renameFormId, setRenameFormId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get<Form[]>('/api/v1/forms');
      setForms(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchForms();
  }, []);

  const handleCreateSuccess = (newForm: Form) => {
    setForms([newForm, ...forms]);
    setIsCreateModalOpen(false);
  };

  const openRenameModal = (id: string) => {
    const form = forms.find(f => f.id === id);
    if (form) {
      setNewTitle(form.title);
      setRenameFormId(id);
      setActionError(null);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameFormId || !newTitle.trim()) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      const updated = await api.patch<Form>(`/api/v1/forms/${renameFormId}`, { title: newTitle.trim() });
      setForms(forms.map(f => f.id === renameFormId ? updated : f));
      setRenameFormId(null);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e.message || 'Failed to rename form');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await api.post<Form>(`/api/v1/forms/${id}/duplicate`);
      setForms([duplicated, ...forms]);
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert(e.message || 'Failed to duplicate form');
    }
  };

  const handleDelete = async () => {
    if (!deleteFormId) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      await api.delete(`/api/v1/forms/${deleteFormId}`);
      setForms(forms.filter(f => f.id !== deleteFormId));
      setDeleteFormId(null);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e.message || 'Failed to delete form');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Workspace
          </h1>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            + Create Form
          </Button>
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl h-[160px] animate-pulse p-5 flex flex-col justify-between">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-16 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-red-100 rounded-xl p-8 text-center max-w-2xl mx-auto mt-12">
            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load workspace</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={fetchForms} variant="secondary">
              Try Again
            </Button>
          </div>
        ) : (
          <FormGrid 
            forms={forms} 
            onCreateClick={() => setIsCreateModalOpen(true)}
            onRename={openRenameModal}
            onDuplicate={handleDuplicate}
            onDelete={(id) => { setDeleteFormId(id); setActionError(null); }}
          />
        )}

      </div>

      <CreateFormDialog 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={handleCreateSuccess}
      />

      <Modal isOpen={!!renameFormId} onClose={() => setRenameFormId(null)} title="Rename Form">
        <form onSubmit={handleRename}>
          <div className="mb-4">
            <label htmlFor="form-title" className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
            <input 
              id="form-title"
              type="text" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
              autoFocus
            />
          </div>
          {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setRenameFormId(null)} disabled={isActionLoading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isActionLoading || !newTitle.trim()}>
              {isActionLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteFormId} onClose={() => setDeleteFormId(null)} title="Delete Form">
        <div className="mb-6">
          <p className="text-sm text-gray-500">Are you sure you want to delete this form? This action cannot be undone and all responses will be permanently removed.</p>
        </div>
        {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => setDeleteFormId(null)} disabled={isActionLoading}>Cancel</Button>
          <Button type="button" variant="primary" onClick={handleDelete} disabled={isActionLoading}>
            {isActionLoading ? 'Deleting...' : 'Delete Form'}
          </Button>
        </div>
      </Modal>
    </main>
  );
}

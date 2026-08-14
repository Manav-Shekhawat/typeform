import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export function ShareModal({ isOpen, onClose, slug }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const url = typeof window !== 'undefined' ? `${window.location.origin}/f/${slug}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 relative">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Published</h2>
          <p className="text-sm text-gray-500 mt-1">Your form is live and ready to receive responses.</p>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Share link</label>
          <div className="flex space-x-2">
            <input 
              type="text"
              readOnly
              value={url}
              className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button variant={copied ? "secondary" : "primary"} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

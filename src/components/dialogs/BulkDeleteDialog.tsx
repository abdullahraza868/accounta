import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  clientNames: string[];
  onConfirmDelete: () => void;
}

export function BulkDeleteDialog({ 
  isOpen, 
  onClose, 
  selectedCount, 
  clientNames,
  onConfirmDelete 
}: BulkDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmText.toLowerCase() === 'delete';

  const handleDelete = () => {
    if (isConfirmed) {
      onConfirmDelete();
      setConfirmText('');
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-red-900">
              Confirm Bulk Delete
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-red-600 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Warning Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 mb-2">
                  WARNING: This action cannot be undone!
                </p>
                <p className="text-sm text-red-800">
                  You are about to permanently delete{' '}
                  <span className="font-semibold">{selectedCount} client{selectedCount > 1 ? 's' : ''}</span>{' '}
                  and all associated data including:
                </p>
                <ul className="text-sm text-red-800 mt-2 space-y-1 list-disc list-inside">
                  <li>Client profile information</li>
                  <li>All documents and files</li>
                  <li>Project history</li>
                  <li>Communication records</li>
                  <li>Financial data and invoices</li>
                  <li>All related metadata</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Client List */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Clients to be deleted:
            </h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
              <div className="p-4 space-y-2">
                {clientNames.slice(0, 10).map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>{name}</span>
                  </div>
                ))}
                {clientNames.length > 10 && (
                  <div className="text-sm text-gray-500 italic pt-2 border-t border-gray-200">
                    ...and {clientNames.length - 10} more client{clientNames.length - 10 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-red-600">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-2">
              This confirmation is required to prevent accidental deletions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-red-600">{selectedCount}</span> client{selectedCount > 1 ? 's' : ''} will be permanently deleted
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!isConfirmed}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Permanently
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

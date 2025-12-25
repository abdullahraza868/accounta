import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Search,
  X,
  Trash2,
  Settings,
  Send,
  Plus,
  CheckCircle,
  Info,
  FileCheck
} from 'lucide-react';
import { cn } from './ui/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';
import { DocumentChecklistSettingsDialog, ChecklistSettings } from './DocumentChecklistSettingsDialog';

type ChecklistItem = {
  id: string;
  name: string;
  description: string;
};

type ChecklistSettings = {
  sendMethod: 'auto' | 'manual';
  autoSendDate?: string;
  emailSubject: string;
  emailBody: string;
};

interface DocumentChecklistViewProps {
  clientName: string;
  clientId: string;
}

export function DocumentChecklistView({ clientName, clientId }: DocumentChecklistViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checklist items - generated from approved and requested documents
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: '1', name: 'W2 Form', description: 'Wage and Tax Statement from employer' },
    { id: '2', name: '1099-INT', description: 'Interest Income' },
    { id: '3', name: '1099-DIV', description: 'Dividends and Distributions' },
    { id: '4', name: 'Schedule K-1', description: "Partner's Share of Income, Deductions, Credits" },
    { id: '5', name: 'Property Tax Statement', description: 'Real estate property tax documents' },
    { id: '6', name: 'Charitable Donations', description: 'Documentation of charitable contributions' },
    { id: '7', name: '1098', description: 'Mortgage Interest Statement' },
    { id: '8', name: 'Business Expenses', description: 'Business-related expense documentation' },
    { id: '9', name: 'Medical Expenses', description: 'Healthcare and medical expense receipts' },
    { id: '10', name: 'Estimated Tax Payments', description: 'Quarterly estimated tax payment records' },
  ]);

  // Settings - default values
  const [checklistSettings, setChecklistSettings] = useState<ChecklistSettings>({
    sendMethod: 'manual',
    emailSubject: 'Document Checklist for {tax_year} Tax Return - {firm_name}',
    emailBody: `Dear {client_name},

We hope this message finds you well. As we prepare for your {tax_year} tax return, we need you to gather and submit the following documents:

{document_list}

Please upload these documents through your secure client portal:
{portal_link}

If you have any additional documents that may apply to new deductions or credits for {tax_year}, please include those as well.

Important Notes:
• All documents should be complete and clearly legible
• If you have questions about any item, please contact us
• The deadline for submission is {due_date}

Thank you for your prompt attention to this matter. We look forward to serving you this tax season.

Best regards,
{firm_name}
{firm_phone}
{firm_email}`,
  });

  // Dialogs
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  // Edit tracking for auto-save
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return checklistItems;
    
    const query = searchQuery.toLowerCase();
    return checklistItems.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }, [checklistItems, searchQuery]);

  // Auto-save when editing
  const handleUpdateItem = (id: string, field: 'name' | 'description', value: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    
    // Simulate auto-save
    if (editingId !== id) {
      setEditingId(id);
      setTimeout(() => {
        setEditingId(null);
        // toast.success('Saved');
      }, 500);
    }
  };

  // Delete item from checklist
  const handleDeleteItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('Document removed from checklist');
  };

  // Save settings
  const handleSaveSettings = (settings: ChecklistSettings) => {
    setChecklistSettings(settings);
    // Toast is handled by the settings dialog
  };

  // Send to client
  const handleSendToClient = () => {
    // Log activity
    console.log('Sending checklist to client:', clientName);
    toast.success(`Document checklist sent to ${clientName}`);
    setShowSendDialog(false);
  };

  // Add new document to checklist - inline form
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDescription, setNewDocDescription] = useState('');

  const handleSaveInlineDocument = () => {
    if (!newDocName.trim()) {
      toast.error('Document name is required');
      return;
    }

    const newDoc: ChecklistItem = {
      id: Date.now().toString(),
      name: newDocName.trim(),
      description: newDocDescription.trim(),
    };

    // Add to the beginning of the list
    setChecklistItems((prev) => [newDoc, ...prev]);
    toast.success('Document added to checklist');
    
    // Reset form
    setNewDocName('');
    setNewDocDescription('');
    setIsAddingInline(false);
  };

  const handleCancelInlineAdd = () => {
    setNewDocName('');
    setNewDocDescription('');
    setIsAddingInline(false);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl text-gray-900 dark:text-white mb-1">
                Document Checklist
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {clientName} - Manage document requirements
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSettingsDialog(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => setShowSendDialog(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Client
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Educational Info Box */}
          <Card className="mb-6 border-2 border-purple-200/60 dark:border-purple-700/60 bg-gradient-to-br from-purple-50/80 via-purple-50/40 to-gray-50/50 dark:from-purple-900/20 dark:via-purple-900/10 dark:to-gray-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 flex items-center justify-center border-2 border-purple-200 dark:border-purple-800">
                  <FileCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    What is Document Checklist?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                    Document Checklist is a customizable list that can be sent to clients in future years. It's automatically generated from approved and requested documents, helping you maintain consistency year over year.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Auto-populated from approved documents
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Customized per client
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Reusable for future years
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsAddingInline(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                  >
                    <Plus className="w-4 h-4" />
                    Add Document Manually
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {/* Inline Add Form - Shows as first item */}
          {isAddingInline && (
            <Card className="border-2 border-purple-300 dark:border-purple-700 shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 dark:bg-purple-600 text-white flex items-center justify-center font-medium text-sm">
                    <Plus className="w-4 h-4" />
                  </div>

                  {/* Editable Fields */}
                  <div className="flex-1 space-y-3">
                    {/* Document Name */}
                    <div>
                      <Input
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        className="font-medium bg-white dark:bg-gray-800 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Document name"
                        autoFocus
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Input
                        value={newDocDescription}
                        onChange={(e) => setNewDocDescription(e.target.value)}
                        className="bg-white dark:bg-gray-800 border-purple-300 focus:border-purple-500 focus:ring-purple-500 text-sm text-gray-600 dark:text-gray-400"
                        placeholder="Description (optional)"
                      />
                    </div>
                  </div>

                  {/* Cancel Button */}
                  <button
                    onClick={handleCancelInlineAdd}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
              <div className="flex gap-2 justify-end px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-800">
                <Button
                  variant="outline"
                  onClick={handleCancelInlineAdd}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveInlineDocument}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              </div>
            </Card>
          )}

          {filteredItems.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                No documents found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'No documents in the checklist'}
              </p>
            </Card>
          ) : (
            filteredItems.map((item, index) => (
              <Card
                key={item.id}
                className="border border-gray-200/60 hover:shadow-md transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </div>

                    {/* Editable Fields */}
                    <div className="flex-1 space-y-3">
                      {/* Document Name */}
                      <div>
                        <Input
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                          className="font-medium bg-white dark:bg-gray-800 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          placeholder="Document name"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <Input
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          className="bg-white dark:bg-gray-800 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-sm text-gray-600 dark:text-gray-400"
                          placeholder="Description"
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove from checklist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Footer */}
        {filteredItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {filteredItems.length} document{filteredItems.length !== 1 ? 's' : ''} in checklist
              {searchQuery && ` (filtered from ${checklistItems.length} total)`}
            </p>
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <DocumentChecklistSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        settings={checklistSettings}
        onSave={handleSaveSettings}
        clientName={clientName}
        isGlobal={false}
      />

      {/* Send to Client Confirmation Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby="send-description">
          <DialogHeader>
            <DialogTitle>Send Document Checklist</DialogTitle>
            <DialogDescription id="send-description">
              Are you sure you want to send this document checklist to {clientName}?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                This will send a notification to the client with:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                <li>{checklistItems.length} document requirements</li>
                <li>Instructions for uploading documents</li>
                <li>Link to their secure portal</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendToClient}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
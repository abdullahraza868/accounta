import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Settings,
  FileSignature,
  Mail,
  Bell,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Image as ImageIcon,
  Link,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

type EmailSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EmailSignature = {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  includeImage: boolean;
  imageUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
};

export function EmailSettingsDialog({ open, onOpenChange }: EmailSettingsDialogProps) {
  const [signatures, setSignatures] = useState<EmailSignature[]>([
    {
      id: '1',
      name: 'Professional',
      content: `Sarah Johnson, CPA\nSenior Tax Accountant\n\nAccounta Tax & Accounting\n📧 sarah@firm.com\n📱 (555) 123-4567\n🌐 www.firm.com`,
      isDefault: true,
      includeImage: true,
      imageUrl: 'https://via.placeholder.com/150x50/6366f1/ffffff?text=Firm+Logo',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahjohnson',
      },
    },
  ]);

  const [editingSignature, setEditingSignature] = useState<EmailSignature | null>(null);
  const [newSignatureName, setNewSignatureName] = useState('');
  const [newSignatureContent, setNewSignatureContent] = useState('');
  const [signatureIncludeImage, setSignatureIncludeImage] = useState(false);
  const [signatureImageUrl, setSignatureImageUrl] = useState('');
  const [signatureLinkedIn, setSignatureLinkedIn] = useState('');
  const [signatureTwitter, setSignatureTwitter] = useState('');
  const [signatureFacebook, setSignatureFacebook] = useState('');
  const [showSignatureEditor, setShowSignatureEditor] = useState(false);

  // Auto-reply settings
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplySubject, setAutoReplySubject] = useState('Out of Office');
  const [autoReplyMessage, setAutoReplyMessage] = useState('');
  const [autoReplyStartDate, setAutoReplyStartDate] = useState('');
  const [autoReplyEndDate, setAutoReplyEndDate] = useState('');

  // Notification settings
  const [notifyNewEmail, setNotifyNewEmail] = useState(true);
  const [notifyEmailFailed, setNotifyEmailFailed] = useState(true);


  const handleSaveSettings = () => {
    toast.success('Email settings saved successfully');
    onOpenChange(false);
  };

  const handleAddSignature = () => {
    if (!newSignatureName.trim() || !newSignatureContent.trim()) {
      toast.error('Please enter signature name and content');
      return;
    }

    const newSignature: EmailSignature = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSignatureName,
      content: newSignatureContent,
      isDefault: signatures.length === 0,
      includeImage: signatureIncludeImage,
      imageUrl: signatureImageUrl || undefined,
      socialLinks: {
        linkedin: signatureLinkedIn || undefined,
        twitter: signatureTwitter || undefined,
        facebook: signatureFacebook || undefined,
      },
    };

    setSignatures([...signatures, newSignature]);
    setNewSignatureName('');
    setNewSignatureContent('');
    setSignatureIncludeImage(false);
    setSignatureImageUrl('');
    setSignatureLinkedIn('');
    setSignatureTwitter('');
    setSignatureFacebook('');
    setShowSignatureEditor(false);
    toast.success('Signature added successfully');
  };

  const handleUpdateSignature = () => {
    if (!editingSignature) return;

    setSignatures(signatures.map(sig =>
      sig.id === editingSignature.id
        ? {
            ...editingSignature,
            name: newSignatureName,
            content: newSignatureContent,
            includeImage: signatureIncludeImage,
            imageUrl: signatureImageUrl || undefined,
            socialLinks: {
              linkedin: signatureLinkedIn || undefined,
              twitter: signatureTwitter || undefined,
              facebook: signatureFacebook || undefined,
            },
          }
        : sig
    ));

    setEditingSignature(null);
    setNewSignatureName('');
    setNewSignatureContent('');
    setSignatureIncludeImage(false);
    setSignatureImageUrl('');
    setSignatureLinkedIn('');
    setSignatureTwitter('');
    setSignatureFacebook('');
    setShowSignatureEditor(false);
    toast.success('Signature updated successfully');
  };

  const handleEditSignature = (signature: EmailSignature) => {
    setEditingSignature(signature);
    setNewSignatureName(signature.name);
    setNewSignatureContent(signature.content);
    setSignatureIncludeImage(signature.includeImage);
    setSignatureImageUrl(signature.imageUrl || '');
    setSignatureLinkedIn(signature.socialLinks?.linkedin || '');
    setSignatureTwitter(signature.socialLinks?.twitter || '');
    setSignatureFacebook(signature.socialLinks?.facebook || '');
    setShowSignatureEditor(true);
  };

  const handleDeleteSignature = (id: string) => {
    setSignatures(signatures.filter(sig => sig.id !== id));
    toast.success('Signature deleted');
  };

  const handleSetDefaultSignature = (id: string) => {
    setSignatures(signatures.map(sig => ({
      ...sig,
      isDefault: sig.id === id,
    })));
    toast.success('Default signature updated');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="email-settings-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Email Settings
          </DialogTitle>
          <DialogDescription id="email-settings-description">
            Manage your email signatures, auto-reply, and notification preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signatures" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signatures">Signatures</TabsTrigger>
            <TabsTrigger value="auto-reply">Auto-Reply</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Signatures Tab */}
          <TabsContent value="signatures" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Email Signatures</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Create and manage your email signatures
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingSignature(null);
                  setNewSignatureName('');
                  setNewSignatureContent('');
                  setSignatureIncludeImage(false);
                  setSignatureImageUrl('');
                  setSignatureLinkedIn('');
                  setSignatureTwitter('');
                  setSignatureFacebook('');
                  setShowSignatureEditor(true);
                }}
                className="gap-2"
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Plus className="w-4 h-4" />
                Add Signature
              </Button>
            </div>

            {showSignatureEditor && (
              <Card className="p-4 border-2 border-dashed">
                <h4 className="text-sm font-medium mb-3">
                  {editingSignature ? 'Edit Signature' : 'New Signature'}
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="sig-name" className="text-sm">Signature Name</Label>
                    <Input
                      id="sig-name"
                      placeholder="e.g., Professional, Casual"
                      value={newSignatureName}
                      onChange={(e) => setNewSignatureName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sig-content" className="text-sm">Signature Content</Label>
                    <Textarea
                      id="sig-content"
                      placeholder="Your signature text..."
                      value={newSignatureContent}
                      onChange={(e) => setNewSignatureContent(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="sig-image"
                      checked={signatureIncludeImage}
                      onCheckedChange={setSignatureIncludeImage}
                    />
                    <Label htmlFor="sig-image" className="text-sm cursor-pointer">
                      Include logo/image
                    </Label>
                  </div>

                  {signatureIncludeImage && (
                    <div>
                      <Label htmlFor="sig-image-url" className="text-sm">Image URL</Label>
                      <Input
                        id="sig-image-url"
                        placeholder="https://example.com/logo.png"
                        value={signatureImageUrl}
                        onChange={(e) => setSignatureImageUrl(e.target.value)}
                      />
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label className="text-sm mb-2 block">Social Media Links (Optional)</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="LinkedIn URL"
                        value={signatureLinkedIn}
                        onChange={(e) => setSignatureLinkedIn(e.target.value)}
                      />
                      <Input
                        placeholder="Twitter URL"
                        value={signatureTwitter}
                        onChange={(e) => setSignatureTwitter(e.target.value)}
                      />
                      <Input
                        placeholder="Facebook URL"
                        value={signatureFacebook}
                        onChange={(e) => setSignatureFacebook(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={editingSignature ? handleUpdateSignature : handleAddSignature}
                      className="gap-2"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                    >
                      <Save className="w-4 h-4" />
                      {editingSignature ? 'Update' : 'Add'} Signature
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowSignatureEditor(false);
                        setEditingSignature(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-3">
              {signatures.map(signature => (
                <Card key={signature.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileSignature className="w-4 h-4 text-gray-400" />
                      <h4 className="text-sm font-medium">{signature.name}</h4>
                      {signature.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!signature.isDefault && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetDefaultSignature(signature.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSignature(signature)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSignature(signature.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    {signature.includeImage && signature.imageUrl && (
                      <div className="mb-3">
                        <img 
                          src={signature.imageUrl} 
                          alt="Signature" 
                          className="h-12 object-contain"
                        />
                      </div>
                    )}
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                      {signature.content}
                    </pre>
                    {signature.socialLinks && (Object.values(signature.socialLinks).some(link => link)) && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {signature.socialLinks.linkedin && (
                          <a 
                            href={signature.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                          </a>
                        )}
                        {signature.socialLinks.twitter && (
                          <a 
                            href={signature.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-500"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                            </svg>
                          </a>
                        )}
                        {signature.socialLinks.facebook && (
                          <a 
                            href={signature.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Auto-Reply Tab */}
          <TabsContent value="auto-reply" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Vacation/Out of Office Auto-Reply</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically reply to emails when you're away
              </p>
            </div>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="auto-reply-toggle" className="text-sm font-medium">
                  Enable Auto-Reply
                </Label>
                <Switch
                  id="auto-reply-toggle"
                  checked={autoReplyEnabled}
                  onCheckedChange={setAutoReplyEnabled}
                />
              </div>

              {autoReplyEnabled && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <Label htmlFor="auto-reply-subject" className="text-sm">Subject Line</Label>
                    <Input
                      id="auto-reply-subject"
                      placeholder="Out of Office"
                      value={autoReplySubject}
                      onChange={(e) => setAutoReplySubject(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="auto-reply-message" className="text-sm">Auto-Reply Message</Label>
                    <Textarea
                      id="auto-reply-message"
                      placeholder="Thank you for your email. I am currently out of the office..."
                      value={autoReplyMessage}
                      onChange={(e) => setAutoReplyMessage(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="auto-reply-start" className="text-sm">Start Date</Label>
                      <Input
                        id="auto-reply-start"
                        type="date"
                        value={autoReplyStartDate}
                        onChange={(e) => setAutoReplyStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="auto-reply-end" className="text-sm">End Date</Label>
                      <Input
                        id="auto-reply-end"
                        type="date"
                        value={autoReplyEndDate}
                        onChange={(e) => setAutoReplyEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Email Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose when you want to be notified
              </p>
            </div>

            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-new" className="text-sm font-medium">New Email</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Notify me when I receive new emails
                  </p>
                </div>
                <Switch
                  id="notify-new"
                  checked={notifyNewEmail}
                  onCheckedChange={setNotifyNewEmail}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-failed" className="text-sm font-medium">Email Failed to Deliver</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Notify me when an email fails to deliver
                  </p>
                </div>
                <Switch
                  id="notify-failed"
                  checked={notifyEmailFailed}
                  onCheckedChange={setNotifyEmailFailed}
                />
              </div>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSettings}
            style={{ backgroundColor: 'var(--primaryColor)' }}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

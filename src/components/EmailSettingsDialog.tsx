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
          <TabsContent value="signatures" className="space-y-6 mt-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Email Signatures</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                className="gap-2 shadow-sm"
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Plus className="w-4 h-4" />
                Add Signature
              </Button>
            </div>

            {showSignatureEditor && (
              <Card className="p-5 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/20 dark:to-transparent shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileSignature className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {editingSignature ? 'Edit Signature' : 'Create New Signature'}
                  </h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sig-name" className="text-sm font-medium mb-1.5 block">Signature Name</Label>
                    <Input
                      id="sig-name"
                      placeholder="e.g., Professional, Casual, Personal"
                      value={newSignatureName}
                      onChange={(e) => setNewSignatureName(e.target.value)}
                      className="bg-white dark:bg-gray-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sig-content" className="text-sm font-medium mb-1.5 block">Signature Content</Label>
                    <Textarea
                      id="sig-content"
                      placeholder="Your signature text...\n\nName\nTitle\nCompany\nEmail | Phone | Website"
                      value={newSignatureContent}
                      onChange={(e) => setNewSignatureContent(e.target.value)}
                      rows={6}
                      className="bg-white dark:bg-gray-900 font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Switch
                      id="sig-image"
                      checked={signatureIncludeImage}
                      onCheckedChange={setSignatureIncludeImage}
                    />
                    <Label htmlFor="sig-image" className="text-sm cursor-pointer font-medium">
                      Include logo/image
                    </Label>
                  </div>

                  {signatureIncludeImage && (
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Label htmlFor="sig-image-url" className="text-sm font-medium mb-1.5 block">Image URL</Label>
                      <Input
                        id="sig-image-url"
                        placeholder="https://example.com/logo.png"
                        value={signatureImageUrl}
                        onChange={(e) => setSignatureImageUrl(e.target.value)}
                      />
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Label className="text-sm font-medium mb-3 block">Social Media Links (Optional)</Label>
                    <div className="space-y-2.5">
                      <div>
                        <Label htmlFor="sig-linkedin" className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">LinkedIn</Label>
                        <Input
                          id="sig-linkedin"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={signatureLinkedIn}
                          onChange={(e) => setSignatureLinkedIn(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sig-twitter" className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Twitter</Label>
                        <Input
                          id="sig-twitter"
                          placeholder="https://twitter.com/yourhandle"
                          value={signatureTwitter}
                          onChange={(e) => setSignatureTwitter(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sig-facebook" className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Facebook</Label>
                        <Input
                          id="sig-facebook"
                          placeholder="https://facebook.com/yourpage"
                          value={signatureFacebook}
                          onChange={(e) => setSignatureFacebook(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      onClick={editingSignature ? handleUpdateSignature : handleAddSignature}
                      className="gap-2 shadow-sm"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                    >
                      <Save className="w-4 h-4" />
                      {editingSignature ? 'Update Signature' : 'Create Signature'}
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

            {signatures.length === 0 && !showSignatureEditor && (
              <Card className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <FileSignature className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No signatures yet</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Create your first email signature to get started
                </p>
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
                  Create Signature
                </Button>
              </Card>
            )}

            {signatures.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Your Signatures ({signatures.length})
                </h4>
                {signatures.map(signature => (
                  <Card 
                    key={signature.id} 
                    className={`p-4 transition-all hover:shadow-md ${
                      signature.isDefault ? 'ring-2 ring-purple-200 dark:ring-purple-800 bg-purple-50/30 dark:bg-purple-950/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          signature.isDefault 
                            ? 'bg-purple-100 dark:bg-purple-900/30' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <FileSignature className={`w-4 h-4 ${
                            signature.isDefault 
                              ? 'text-purple-600 dark:text-purple-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {signature.name}
                          </h4>
                          {signature.isDefault && (
                            <Badge 
                              variant="secondary" 
                              className="text-[10px] px-1.5 py-0 h-4 mt-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                            >
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!signature.isDefault && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSetDefaultSignature(signature.id)}
                            className="text-xs h-8 px-2"
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditSignature(signature)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSignature(signature.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                      {signature.includeImage && signature.imageUrl && (
                        <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                          <img 
                            src={signature.imageUrl} 
                            alt="Signature logo" 
                            className="h-10 object-contain"
                          />
                        </div>
                      )}
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                        {signature.content}
                      </pre>
                      {signature.socialLinks && (Object.values(signature.socialLinks).some(link => link)) && (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {signature.socialLinks.linkedin && (
                            <a 
                              href={signature.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                              title="LinkedIn"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                            </a>
                          )}
                          {signature.socialLinks.twitter && (
                            <a 
                              href={signature.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-500 transition-colors"
                              title="Twitter"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                              </svg>
                            </a>
                          )}
                          {signature.socialLinks.facebook && (
                            <a 
                              href={signature.socialLinks.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                              title="Facebook"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
            )}
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

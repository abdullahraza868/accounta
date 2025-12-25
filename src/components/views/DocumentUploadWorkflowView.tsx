import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, CheckCircle, Lock, Smartphone, FileText, ArrowLeft, ArrowRight, X, Check, Download, Monitor, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

type DocumentRequest = {
  id: string;
  name: string;
  description?: string;
  uploaded: boolean;
  file?: File;
};

export function DocumentUploadWorkflowView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const deviceParam = searchParams.get('device'); // 'desktop' or 'mobile' for testing
  const isMobile = deviceParam === 'mobile' ? true : deviceParam === 'desktop' ? false : window.innerWidth < 768;
  
  const [step, setStep] = useState<'code' | 'upload' | 'success'>('code');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mock data - in production, fetch from backend using token
  const clientName = 'Troy Business Services LLC';
  const phoneNumber = '***-***-1234';
  const [documents, setDocuments] = useState<DocumentRequest[]>([
    { id: '1', name: 'Form W-2', description: 'Wage and Tax Statement for 2024', uploaded: false },
    { id: '2', name: 'Bank Statement', description: 'December 2024 statement', uploaded: false },
    { id: '3', name: 'Tax Return', description: 'Prior year tax return', uploaded: false },
  ]);

  const currentDoc = documents[currentDocIndex];
  const completedCount = documents.filter(d => d.uploaded).length;
  const totalCount = documents.length;
  const allUploaded = completedCount === totalCount;

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pasteData.split('').concat(Array(6).fill('')).slice(0, 6);
    setVerificationCode(newCode);
    
    // Focus last filled input or first empty
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyCode = () => {
    const code = verificationCode.join('');
    if (code.length === 6) {
      toast.success('Code verified successfully');
      setStep('upload');
    } else {
      toast.error('Please enter a 6-digit code');
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Update document with file and trigger auto-upload
    const newDocs = [...documents];
    newDocs[currentDocIndex] = { ...currentDoc, file, uploaded: false };
    setDocuments(newDocs);
    
    // Auto-upload immediately after file selection
    handleUploadWithFile(file, currentDocIndex);
  };

  const handleUploadWithFile = async (file: File, docIndex: number) => {
    if (!file) return;

    setIsUploading(true);
    
    // Mock upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mark as uploaded
    const newDocs = [...documents];
    newDocs[docIndex] = { ...documents[docIndex], uploaded: true };
    setDocuments(newDocs);
    setIsUploading(false);

    toast.success(`${documents[docIndex].name} uploaded successfully`);

    // Move to next document or success
    if (docIndex < documents.length - 1) {
      setCurrentDocIndex(docIndex + 1);
    } else {
      setStep('success');
    }
  };

  const handleUpload = async () => {
    if (!currentDoc.file) return;

    setIsUploading(true);
    
    // Mock upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mark as uploaded
    const newDocs = [...documents];
    newDocs[currentDocIndex] = { ...currentDoc, uploaded: true };
    setDocuments(newDocs);
    setIsUploading(false);

    toast.success(`${currentDoc.name} uploaded successfully`);

    // Move to next document or success
    if (currentDocIndex < documents.length - 1) {
      setCurrentDocIndex(currentDocIndex + 1);
    } else {
      setStep('success');
    }
  };

  const renderCodeEntry = () => (
    <Card className="border-gray-200 dark:border-gray-700 shadow-xl">
      <CardContent className="pt-8 pb-8">
        {/* Firm Branding */}
        <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            Acounta
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {clientName}
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            Verify Your Identity
          </h2>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a verification code to
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                {phoneNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 6-Box Code Entry */}
          <div>
            <Label className="text-sm text-gray-700 dark:text-gray-300 mb-3 block text-center">
              Enter 6-Digit Code
            </Label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={cn(
                    "w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                    digit 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  )}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 h-12 text-base"
            onClick={handleVerifyCode}
            disabled={verificationCode.join('').length !== 6}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Verify Code
          </Button>

          <div className="text-center">
            <button className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
              Resend Code
            </button>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>For testing:</strong> Use any 6-digit code
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderMobileUpload = () => (
    <Card className="border-gray-200 dark:border-gray-700 shadow-xl">
      <CardContent className="pt-6 pb-6">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Identity Verified</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
              <Lock className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                Secure Upload
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {completedCount} of {totalCount} uploaded
            </div>
          </div>
          <Progress value={(completedCount / totalCount) * 100} className="h-2" />
        </div>

        {/* Current Document */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {currentDoc.name}
              </h2>
              {currentDoc.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentDoc.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
              Document {currentDocIndex + 1}/{totalCount}
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <MobileUploadArea
          document={currentDoc}
          onFileSelect={handleFileSelect}
          onUpload={handleUpload}
          isUploading={isUploading}
        />

        {/* Navigation */}
        {documents.length > 1 && (
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentDocIndex(Math.max(0, currentDocIndex - 1))}
              disabled={currentDocIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentDocIndex(Math.min(documents.length - 1, currentDocIndex + 1))}
              disabled={currentDocIndex === documents.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDesktopUpload = () => (
    <Card className="border-gray-200 dark:border-gray-700 shadow-xl max-w-4xl mx-auto">
      <CardContent className="pt-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Identity Verified</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
              <Lock className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                Secure Upload
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                Upload Requested Documents
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please upload the following {totalCount} documents
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {completedCount}/{totalCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </div>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc, index) => (
            <DesktopDocumentCard
              key={doc.id}
              document={doc}
              index={index}
              onFileSelect={(file) => {
                // Update document with file
                const newDocs = [...documents];
                newDocs[index] = { ...doc, file, uploaded: false };
                setDocuments(newDocs);
                
                // Auto-upload immediately
                setTimeout(async () => {
                  setIsUploading(true);
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  const updatedDocs = [...documents];
                  updatedDocs[index] = { ...updatedDocs[index], uploaded: true };
                  setDocuments(updatedDocs);
                  setIsUploading(false);
                  toast.success(`${doc.name} uploaded successfully`);
                  
                  // Check if all documents are uploaded
                  if (updatedDocs.every(d => d.uploaded)) {
                    setTimeout(() => setStep('success'), 500);
                  }
                }, 100);
              }}
              onUpload={async () => {
                setIsUploading(true);
                await new Promise(resolve => setTimeout(resolve, 1500));
                const newDocs = [...documents];
                newDocs[index] = { ...doc, uploaded: true };
                setDocuments(newDocs);
                setIsUploading(false);
                toast.success(`${doc.name} uploaded successfully`);
                
                if (newDocs.every(d => d.uploaded)) {
                  setTimeout(() => setStep('success'), 500);
                }
              }}
              isUploading={isUploading}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="border-gray-200 dark:border-gray-700 shadow-xl">
      <CardContent className="pt-12 pb-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          All Documents Uploaded!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Thank you for uploading your documents. We'll review them and get back to you shortly.
        </p>
        <div className="space-y-3 max-w-sm mx-auto">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {completedCount} documents uploaded
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Successfully received
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => navigate('/')}
        >
          Close
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Workflow Navigation - Testing Links */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Test Other Workflows
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                Testing Mode
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Upload Workflows */}
              <Button
                size="sm"
                variant="outline"
                className="justify-start text-xs h-auto py-2"
                onClick={() => window.open('/workflows/upload?device=desktop', '_blank')}
              >
                <Upload className="w-3 h-3 mr-1.5 text-purple-600" />
                <Monitor className="w-3 h-3 mr-1.5" />
                Upload Desktop
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="justify-start text-xs h-auto py-2"
                onClick={() => window.open('/workflows/upload?device=mobile', '_blank')}
              >
                <Upload className="w-3 h-3 mr-1.5 text-purple-600" />
                <Smartphone className="w-3 h-3 mr-1.5" />
                Upload Mobile
              </Button>
              
              {/* Download Workflows */}
              <Button
                size="sm"
                variant="outline"
                className="justify-start text-xs h-auto py-2"
                onClick={() => window.open('/workflows/download?device=desktop', '_blank')}
              >
                <Download className="w-3 h-3 mr-1.5 text-blue-600" />
                <Monitor className="w-3 h-3 mr-1.5" />
                Download Desktop
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="justify-start text-xs h-auto py-2"
                onClick={() => window.open('/workflows/download?device=mobile', '_blank')}
              >
                <Download className="w-3 h-3 mr-1.5 text-blue-600" />
                <Smartphone className="w-3 h-3 mr-1.5" />
                Download Mobile
              </Button>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs"
                onClick={() => navigate('/workflows/testing')}
              >
                View All Workflows
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Steps */}
        {step === 'code' && renderCodeEntry()}
        {step === 'upload' && (isMobile ? renderMobileUpload() : renderDesktopUpload())}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  );
}

// Mobile Upload Area Component
function MobileUploadArea({ 
  document, 
  onFileSelect, 
  onUpload, 
  isUploading 
}: { 
  document: DocumentRequest;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  isUploading: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
          isDragging ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" :
          document.file ? "border-green-300 bg-green-50 dark:bg-green-900/20" :
          "border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          id={`file-${document.id}`}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
        
        {document.file ? (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{document.file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {(document.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Tap to select file
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                PDF, JPG, or PNG (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {document.uploaded ? (
        <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-900 dark:text-green-100">
            Uploaded Successfully
          </span>
        </div>
      ) : document.file && isUploading ? (
        <div className="flex items-center justify-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-medium text-purple-900 dark:text-purple-100">
            Uploading...
          </span>
        </div>
      ) : null}
    </div>
  );
}

// Desktop Document Card Component
function DesktopDocumentCard({
  document,
  index,
  onFileSelect,
  onUpload,
  isUploading
}: {
  document: DocumentRequest;
  index: number;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  isUploading: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className={cn(
      "border-2 rounded-lg p-4 transition-all",
      document.uploaded 
        ? "border-green-300 bg-green-50 dark:bg-green-900/20"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {document.name}
          </h3>
          {document.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {document.description}
            </p>
          )}
        </div>
        {document.uploaded && (
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        )}
      </div>

      {/* Upload Area */}
      {!document.uploaded && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer mb-3",
            isDragging ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" :
            document.file ? "border-purple-300 bg-purple-50 dark:bg-purple-900/20" :
            "border-gray-300 dark:border-gray-600 hover:border-purple-400"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id={`desktop-file-${document.id}`}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
          
          {document.file ? (
            <div className="space-y-2">
              <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto" />
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {document.file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(document.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drop file or click
              </p>
            </div>
          )}
        </div>
      )}

      {document.uploaded ? (
        <div className="flex items-center justify-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-900 dark:text-green-100">
            Uploaded
          </span>
        </div>
      ) : document.file && isUploading ? (
        <div className="flex items-center justify-center gap-2 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
            Uploading...
          </span>
        </div>
      ) : null}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, CheckCircle, Lock, Smartphone, FileText, ArrowLeft, Download, Monitor, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';

export function DocumentUploadView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('doc');
  
  const [step, setStep] = useState<'code' | 'upload' | 'success'>('code');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Mock document name
  const documentName = 'W2_Form_2024.pdf';
  const clientName = 'Troy Business Services LLC';

  const handleVerifyCode = () => {
    // Mock verification - in real app, verify with backend
    if (verificationCode === '123456' || verificationCode.length === 6) {
      toast.success('Code verified successfully');
      setStep('upload');
    } else {
      toast.error('Invalid verification code');
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    // Mock upload - in real app, upload to backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUploading(false);
    setStep('success');
    toast.success('Document uploaded successfully');
  };

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

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Secure Document Upload
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {clientName}
          </p>
        </div>

        {step === 'code' && (
          <Card className="border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="pt-6 pb-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Verify Your Identity
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please enter the 6-digit code sent to your phone
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest font-mono mt-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && verificationCode.length === 6) {
                        handleVerifyCode();
                      }
                    }}
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Code
                </Button>

                <div className="text-center">
                  <button className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                    Resend Code
                  </button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    For testing: Use code <strong>123456</strong> or any 6-digit code
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'upload' && (
          <Card className="border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="pt-6 pb-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Identity Verified</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Document
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Replacing: <span className="font-medium text-gray-900 dark:text-white">{documentName}</span>
                </p>
              </div>

              <div className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                    isDragging
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : selectedFile
                      ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                  )}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
                      >
                        Choose Different File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          PDF, JPG, or PNG (max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Your document is encrypted and transmitted securely
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your document has been uploaded and will be reviewed by our team.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Uploaded successfully • {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You will receive an email notification once your document has been reviewed.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can now close this window.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Your Accounting Firm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
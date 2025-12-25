import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, CheckCircle, AlertCircle, Phone, FileText, ArrowRight, Lock,
  X, File, Download, Monitor, Smartphone, ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../components/ui/utils';
import { Badge } from '../../components/ui/badge';

type UploadStep = 'verify-phone' | 'upload-files' | 'success';

export function SecureUploadView() {
  const { clientId, token } = useParams<{ clientId: string; token: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<UploadStep>('verify-phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock client info (in real app, this would be fetched from API)
  const clientInfo = {
    name: 'John Smith',
    firmName: 'ABC Accounting Services',
    requestedDocument: 'W-2 Form for 2024',
  };

  // Phone verification
  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // In real implementation, this would call API to send SMS
    toast.success('Verification code sent to your phone');
    setCodeSent(true);
  };

  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    // In real implementation, this would verify the code with API
    if (verificationCode === '123456') {
      toast.success('Phone number verified!');
      setCurrentStep('upload-files');
    } else {
      toast.error('Invalid verification code. Try again.');
    }
  };

  // File upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload delay
    setTimeout(() => {
      clearInterval(interval);
      setUploading(false);
      setUploadProgress(100);
      setCurrentStep('success');
      toast.success('Documents uploaded successfully!');
    }, 2500);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Secure Document Upload
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {clientInfo.firmName}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={cn(
            "flex items-center gap-2",
            currentStep === 'verify-phone' && "text-purple-600 dark:text-purple-400",
            currentStep !== 'verify-phone' && "text-green-600 dark:text-green-400"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold",
              currentStep === 'verify-phone' && "bg-purple-100 dark:bg-purple-900/30",
              currentStep !== 'verify-phone' && "bg-green-100 dark:bg-green-900/30"
            )}>
              {currentStep === 'verify-phone' ? '1' : <CheckCircle className="w-5 h-5" />}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Verify Phone</span>
          </div>
          
          <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-700" />
          
          <div className={cn(
            "flex items-center gap-2",
            currentStep === 'upload-files' && "text-purple-600 dark:text-purple-400",
            currentStep === 'success' && "text-green-600 dark:text-green-400",
            currentStep === 'verify-phone' && "text-gray-400 dark:text-gray-600"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold",
              currentStep === 'upload-files' && "bg-purple-100 dark:bg-purple-900/30",
              currentStep === 'success' && "bg-green-100 dark:bg-green-900/30",
              currentStep === 'verify-phone' && "bg-gray-200 dark:bg-gray-700"
            )}>
              {currentStep === 'success' ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Upload Files</span>
          </div>
          
          <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-700" />
          
          <div className={cn(
            "flex items-center gap-2",
            currentStep === 'success' ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold",
              currentStep === 'success' ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-200 dark:bg-gray-700"
            )}>
              {currentStep === 'success' ? <CheckCircle className="w-5 h-5" /> : '3'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Complete</span>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="p-8 shadow-xl border-0">
          {/* Step 1: Phone Verification */}
          {currentStep === 'verify-phone' && (
            <div className="space-y-6">
              <div className="text-center">
                <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Verify Your Phone Number
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For security, we need to verify your identity before allowing file uploads
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Document Requested:</strong> {clientInfo.requestedDocument}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={codeSent}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendCode}
                      disabled={codeSent}
                      className="btn-primary"
                    >
                      {codeSent ? 'Code Sent' : 'Send Code'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    We'll send a 6-digit verification code via SMS
                  </p>
                </div>

                {codeSent && (
                  <div>
                    <Label htmlFor="code">Verification Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="code"
                        type="text"
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="flex-1 text-center text-2xl tracking-widest font-mono"
                        maxLength={6}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter the 6-digit code sent to your phone. For testing, use: <strong>123456</strong>
                    </p>
                  </div>
                )}
              </div>

              {codeSent && (
                <Button
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6}
                  className="w-full btn-primary gap-2"
                >
                  Verify & Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Step 2: Upload Files */}
          {currentStep === 'upload-files' && (
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Your Documents
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select the files you want to upload
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Requested:</strong> {clientInfo.requestedDocument}
                </AlertDescription>
              </Alert>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Click to select files or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, Word, JPG, PNG (Max 10MB per file)
                  </p>
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({uploadedFiles.length})</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <File className="w-8 h-8 text-purple-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={uploadedFiles.length === 0 || uploading}
                className="w-full btn-primary gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : `Upload ${uploadedFiles.length} File${uploadedFiles.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          )}

          {/* Step 3: Success */}
          {currentStep === 'success' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your documents have been securely uploaded to {clientInfo.firmName}
                </p>
              </div>

              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200 text-sm text-left">
                  <strong>What happens next?</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Your accountant will review the documents</li>
                    <li>You'll be notified once they're processed</li>
                    <li>If anything is missing, they'll reach out to you</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can safely close this window now.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <Lock className="w-3 h-3 inline mr-1" />
            Secured with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
}
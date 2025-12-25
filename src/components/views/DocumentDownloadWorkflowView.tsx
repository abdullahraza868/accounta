import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, CheckCircle, Lock, Smartphone, FileText, File, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';

type DocumentDownload = {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  downloaded: boolean;
};

export function DocumentDownloadWorkflowView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const deviceParam = searchParams.get('device'); // 'desktop' or 'mobile' for testing
  const isMobile = deviceParam === 'mobile' ? true : deviceParam === 'desktop' ? false : window.innerWidth < 768;
  
  const [step, setStep] = useState<'code' | 'download'>('code');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mock data - in production, fetch from backend using token
  const clientName = 'Troy Business Services LLC';
  const phoneNumber = '***-***-1234';
  const [documents, setDocuments] = useState<DocumentDownload[]>([
    { 
      id: '1', 
      name: '2024_Tax_Return.pdf', 
      size: '2.4 MB', 
      type: 'PDF',
      date: '2024-12-10',
      downloaded: false 
    },
    { 
      id: '2', 
      name: 'W2_2024.pdf', 
      size: '856 KB', 
      type: 'PDF',
      date: '2024-12-10',
      downloaded: false 
    },
    { 
      id: '3', 
      name: 'Tax_Summary_2024.pdf', 
      size: '1.2 MB', 
      type: 'PDF',
      date: '2024-12-10',
      downloaded: false 
    },
  ]);

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

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
    
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyCode = () => {
    const code = verificationCode.join('');
    if (code.length === 6) {
      toast.success('Code verified successfully');
      setStep('download');
    } else {
      toast.error('Please enter a 6-digit code');
    }
  };

  const handleDownload = (docId: string) => {
    // Mark as downloaded
    setDocuments(docs => docs.map(d => 
      d.id === docId ? { ...d, downloaded: true } : d
    ));
    
    // Simulate download
    const doc = documents.find(d => d.id === docId);
    toast.success(`Downloading ${doc?.name}...`);
    
    // In production, trigger actual download
    console.log('Downloading document:', docId);
  };

  const handleDownloadAll = () => {
    // Mark all as downloaded
    setDocuments(docs => docs.map(d => ({ ...d, downloaded: true })));
    toast.success(`Downloading ${documents.length} documents...`);
    
    // In production, trigger zip download
    console.log('Downloading all documents');
  };

  const renderCodeEntry = () => (
    <Card className="border-gray-200 dark:border-gray-700 shadow-xl">
      <CardContent className="pt-8 pb-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
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
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    digit 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  )}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 text-base"
            onClick={handleVerifyCode}
            disabled={verificationCode.join('').length !== 6}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Verify Code
          </Button>

          <div className="text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
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

  const renderMobileDownload = () => (
    <Card className="border-gray-200 dark:border-gray-700 shadow-xl">
      <CardContent className="pt-6 pb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Identity Verified</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
              <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Secure Download
              </span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Your Documents
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {documents.length} document{documents.length > 1 ? 's' : ''} ready to download
          </p>
        </div>

        {/* Download All Button */}
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 mb-4"
          onClick={handleDownloadAll}
        >
          <Download className="w-5 h-5 mr-2" />
          Download All ({documents.length})
        </Button>

        {/* Document List */}
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant={doc.downloaded ? "outline" : "default"}
                className={cn(
                  "w-full mt-3",
                  !doc.downloaded && "bg-blue-600 hover:bg-blue-700"
                )}
                onClick={() => handleDownload(doc.id)}
              >
                {doc.downloaded ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Downloaded
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDesktopDownload = () => (
    <Card className="border-gray-200 dark:border-gray-700 shadow-xl max-w-4xl mx-auto">
      <CardContent className="pt-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Identity Verified</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
              <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Secure Download
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                Your Documents
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {documents.length} document{documents.length > 1 ? 's' : ''} ready to download
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              onClick={handleDownloadAll}
            >
              <Download className="w-5 h-5 mr-2" />
              Download All
            </Button>
          </div>
        </div>

        {/* Document Table */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {doc.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-xs">
                      {doc.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {doc.size}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(doc.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant={doc.downloaded ? "outline" : "default"}
                      className={cn(
                        !doc.downloaded && "bg-blue-600 hover:bg-blue-700"
                      )}
                      onClick={() => handleDownload(doc.id)}
                    >
                      {doc.downloaded ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Download Information</p>
              <p className="text-blue-700 dark:text-blue-200">
                These documents are available for download for the next 7 days. After that, please contact us to request access again.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className={cn("w-full", step === 'download' && !isMobile ? "max-w-5xl" : "max-w-lg")}>
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Secure Document Download
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {clientName}
          </p>
        </div>

        {/* Steps */}
        {step === 'code' && renderCodeEntry()}
        {step === 'download' && (isMobile ? renderMobileDownload() : renderDesktopDownload())}
      </div>
    </div>
  );
}
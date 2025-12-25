import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Upload, FileSignature, FileText, MoveVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Form8879Dialog } from './Form8879Dialog';

type NewSignatureRequestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName?: string;
};

export function NewSignatureRequestDialog({ open, onOpenChange, clientName }: NewSignatureRequestDialogProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form8879InputRef = useRef<HTMLInputElement>(null);
  const [show8879Dialog, setShow8879Dialog] = useState(false);
  const [uploadDragActive, setUploadDragActive] = useState(false);
  const [form8879DragActive, setForm8879DragActive] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file) {
      onOpenChange(false);
      navigate('/signatures/upload-document', { state: { file } });
    }
  };

  const handleForm8879Upload = (file: File) => {
    if (file) {
      onOpenChange(false);
      navigate('/signatures/form-8879/verify', { state: { file } });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleForm8879InputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleForm8879Upload(file);
    }
  };

  // Upload Document drag handlers
  const handleUploadDrag = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUploadDragIn = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadDragActive(true);
  };

  const handleUploadDragOut = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadDragActive(false);
  };

  const handleUploadDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Form 8879 drag handlers
  const handleForm8879Drag = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleForm8879DragIn = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setForm8879DragActive(true);
  };

  const handleForm8879DragOut = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setForm8879DragActive(false);
  };

  const handleForm8879Drop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setForm8879DragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleForm8879Upload(files[0]);
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl" aria-describedby="new-signature-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
              New Signature Request
            </DialogTitle>
            <DialogDescription id="new-signature-description">
              {clientName ? `Choose how you'd like to create a signature request for ${clientName}` : "Choose how you'd like to create a signature request"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 py-4">
            {/* Upload Document - with drag and drop */}
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleUploadDragIn}
              onDragLeave={handleUploadDragOut}
              onDragOver={handleUploadDrag}
              onDrop={handleUploadDrop}
              className={`group relative p-6 border-2 rounded-lg transition-all text-center ${
                uploadDragActive 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105 shadow-lg' 
                  : 'border-dashed border-gray-300 dark:border-gray-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:border-purple-400'
              }`}
              onMouseEnter={(e) => {
                if (!uploadDragActive) {
                  e.currentTarget.style.borderColor = 'var(--primaryColor)';
                }
              }}
              onMouseLeave={(e) => {
                if (!uploadDragActive) {
                  e.currentTarget.style.borderColor = '';
                }
              }}
            >
              {/* Drag indicator badge */}
              <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                uploadDragActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60'
              }`}>
                <MoveVertical className="w-3 h-3" />
                <span>Drag</span>
              </div>
              
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3 transition-all ${
                uploadDragActive
                  ? 'bg-purple-200 dark:bg-purple-800 scale-110'
                  : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30'
              }`}>
                <Upload className={`w-8 h-8 transition-colors ${
                  uploadDragActive
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                }`} />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Upload Document
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {uploadDragActive ? '📥 Drop file here' : 'Click to browse'}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                or drag & drop
              </p>
            </button>

            {/* Form 8879 - with drag and drop */}
            <button
              onClick={() => form8879InputRef.current?.click()}
              onDragEnter={handleForm8879DragIn}
              onDragLeave={handleForm8879DragOut}
              onDragOver={handleForm8879Drag}
              onDrop={handleForm8879Drop}
              className={`group relative p-6 border-2 rounded-lg transition-all text-center ${
                form8879DragActive 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105 shadow-lg' 
                  : 'border-dashed border-gray-300 dark:border-gray-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:border-purple-400'
              }`}
              onMouseEnter={(e) => {
                if (!form8879DragActive) {
                  e.currentTarget.style.borderColor = 'var(--primaryColor)';
                }
              }}
              onMouseLeave={(e) => {
                if (!form8879DragActive) {
                  e.currentTarget.style.borderColor = '';
                }
              }}
            >
              {/* Drag indicator badge */}
              <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                form8879DragActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60'
              }`}>
                <MoveVertical className="w-3 h-3" />
                <span>Drag</span>
              </div>
              
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3 transition-all ${
                form8879DragActive
                  ? 'scale-110'
                  : ''
              }`}
                style={{ backgroundColor: form8879DragActive ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)' }}
              >
                <FileSignature className={`w-8 h-8 transition-all ${
                  form8879DragActive ? 'scale-110' : ''
                }`} style={{ color: 'var(--primaryColor)' }} />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Form 8879 (IRS)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {form8879DragActive ? '📥 Drop file here' : 'Click to browse'}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                or drag & drop
              </p>
            </button>

            {/* Template - no drag and drop */}
            <button
              onClick={() => {
                onOpenChange(false);
                navigate('/signature-templates');
              }}
              className="group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all text-center"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primaryColor)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
              }}
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Use Template</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select from saved document templates
              </p>
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <input
            ref={form8879InputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleForm8879InputChange}
            className="hidden"
          />
        </DialogContent>
      </Dialog>

      {/* Form 8879 Dialog - kept for backward compatibility but likely unused now */}
      <Form8879Dialog
        open={show8879Dialog}
        onOpenChange={setShow8879Dialog}
      />
    </>
  );
}
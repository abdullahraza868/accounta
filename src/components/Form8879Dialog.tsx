import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type Form8879DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function Form8879Dialog({ open, onOpenChange }: Form8879DialogProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When dialog opens, trigger file picker
  useEffect(() => {
    if (open) {
      onOpenChange(false);
      // Trigger file picker immediately
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
  }, [open, onOpenChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Navigate to verification view first where AI will extract recipients
      navigate('/signatures/form-8879/verify', { state: { file } });
    }
    // If user cancels, do nothing (they stay on current page)
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={handleFileChange}
      className="hidden"
    />
  );
}

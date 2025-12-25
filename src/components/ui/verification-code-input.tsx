import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useBranding } from '../../contexts/BrandingContext';

interface VerificationCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VerificationCodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  className = '',
}: VerificationCodeInputProps) {
  const { branding } = useBranding();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Convert value string to array of digits
  const digits = value.padEnd(length, '').split('').slice(0, length);

  useEffect(() => {
    // Auto-focus first empty input on mount
    const firstEmptyIndex = digits.findIndex(d => !d);
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus();
    } else if (value.length === 0) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  useEffect(() => {
    // Check if complete
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    const digit = newValue.replace(/\D/g, '').slice(-1);
    
    // Update the value
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newCode = newDigits.join('').replace(/\s/g, '');
    onChange(newCode);

    // Auto-advance to next input if digit was entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current input is empty, go back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        const newCode = newDigits.join('').replace(/\s/g, '');
        onChange(newCode);
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        // If current input has value, just clear it
        const newDigits = [...digits];
        newDigits[index] = '';
        const newCode = newDigits.join('').replace(/\s/g, '');
        onChange(newCode);
      }
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Handle delete
    if (e.key === 'Delete') {
      const newDigits = [...digits];
      newDigits[index] = '';
      const newCode = newDigits.join('').replace(/\s/g, '');
      onChange(newCode);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (pastedDigits) {
      onChange(pastedDigits);
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Select the content for easy replacement
    inputRefs.current[index]?.select();
  };

  const handleClick = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className={`flex gap-2 sm:gap-3 justify-center ${className}`}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          onClick={() => handleClick(index)}
          disabled={disabled}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: branding.colors.inputBackground,
            borderColor: focusedIndex === index 
              ? branding.colors.primaryButton 
              : branding.colors.inputBorder,
            color: branding.colors.inputText,
            boxShadow: focusedIndex === index 
              ? `0 0 0 3px ${branding.colors.primaryButton}20` 
              : 'none',
          }}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

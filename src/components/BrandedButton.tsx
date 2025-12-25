import { forwardRef } from 'react';
import { useBranding } from '../contexts/BrandingContext';
import { Button, ButtonProps } from './ui/button';

type BrandedButtonProps = ButtonProps & {
  brandVariant?: 'primary' | 'secondary' | 'danger' | 'default';
};

export const BrandedButton = forwardRef<HTMLButtonElement, BrandedButtonProps>(
  ({ brandVariant = 'default', style, className, ...props }, ref) => {
    const { branding } = useBranding();

    const getBrandedStyle = () => {
      if (brandVariant === 'primary') {
        return {
          background: branding.colors.primaryButton,
          color: branding.colors.primaryButtonText,
          ...style,
        };
      }
      if (brandVariant === 'secondary') {
        return {
          background: branding.colors.secondaryButton,
          color: branding.colors.secondaryButtonText,
          ...style,
        };
      }
      if (brandVariant === 'danger') {
        return {
          background: branding.colors.dangerButton,
          color: branding.colors.dangerButtonText,
          ...style,
        };
      }
      return style;
    };

    return (
      <Button
        ref={ref}
        style={getBrandedStyle()}
        className={className}
        {...props}
      />
    );
  }
);

BrandedButton.displayName = 'BrandedButton';

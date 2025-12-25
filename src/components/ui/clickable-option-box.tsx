/**
 * Clickable Option Box Component
 * 
 * A reusable, accessible component for creating clickable option cards with icons,
 * titles, descriptions, and checkboxes. Commonly used for settings, permissions,
 * and feature toggles.
 * 
 * Features:
 * - Full box clickability with proper event handling
 * - Visual feedback on selection (border, background highlighting)
 * - Icon integration with dynamic colors
 * - Checkbox integration with click propagation control
 * - Hover effects for better UX
 * - Brand color integration
 * 
 * Usage:
 * ```tsx
 * import { ClickableOptionBox } from './components/ui/clickable-option-box';
 * 
 * <ClickableOptionBox
 *   isChecked={hasPortalAccess}
 *   onToggle={() => setHasPortalAccess(!hasPortalAccess)}
 *   icon={Key}
 *   title="Enable Portal Access"
 *   description="Allow this user to log into the client portal"
 *   primaryColor="#8b5cf6"
 * />
 * ```
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Checkbox } from './checkbox';

interface ClickableOptionBoxProps {
  /** Whether the option is currently selected/checked */
  isChecked: boolean;
  
  /** Callback function when the option is toggled */
  onToggle: () => void;
  
  /** Lucide icon component to display */
  icon: LucideIcon;
  
  /** Main title/label for the option */
  title: string;
  
  /** Optional description text providing more context */
  description?: string;
  
  /** Primary brand color for highlighting (hex format) */
  primaryColor: string;
  
  /** Background color for the card (hex format). Defaults to white */
  cardBackground?: string;
  
  /** Border color for unchecked state (hex format). Defaults to light gray */
  borderColor?: string;
  
  /** Text color for the title (hex format). Defaults to dark gray */
  headingColor?: string;
  
  /** Text color for the description (hex format). Defaults to muted gray */
  mutedColor?: string;
  
  /** Optional additional content to display in the box */
  children?: ReactNode;
  
  /** Optional custom className for additional styling */
  className?: string;
}

export function ClickableOptionBox({
  isChecked,
  onToggle,
  icon: Icon,
  title,
  description,
  primaryColor,
  cardBackground = '#ffffff',
  borderColor = '#e5e7eb',
  headingColor = '#111827',
  mutedColor = '#6b7280',
  children,
  className = '',
}: ClickableOptionBoxProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${className}`}
      style={{ 
        borderColor: isChecked ? primaryColor : borderColor,
        background: isChecked ? `${primaryColor}10` : cardBackground,
      }}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: isChecked ? `${primaryColor}20` : '#f3f4f6' }}
          >
            <Icon className="w-5 h-5" style={{ color: isChecked ? primaryColor : '#9ca3af' }} />
          </div>
          <div className="flex-1">
            <p className="font-medium" style={{ color: headingColor }}>
              {title}
            </p>
            {description && (
              <p className="text-sm mt-1" style={{ color: mutedColor }}>
                {description}
              </p>
            )}
            {children && (
              <div className="mt-3">
                {children}
              </div>
            )}
          </div>
        </div>
        <Checkbox
          checked={isChecked}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

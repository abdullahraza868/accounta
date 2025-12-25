/**
 * Branded Style Utilities
 * 
 * This file provides utility functions and style objects that apply
 * platform branding colors throughout the application.
 */

export const brandedStyles = {
  // Primary button styles
  primaryButton: {
    background: 'var(--primaryColorBtn)',
    color: 'var(--primaryTextColorBtn)',
    boxShadow: '0 10px 15px -3px rgba(var(--primaryColorBtnRgb), 0.3)',
  },
  
  primaryButtonHover: {
    background: 'var(--primaryHoverColorBtn)',
    color: 'var(--primaryTextHoverColorBtn)',
    boxShadow: '0 10px 15px -3px rgba(var(--primaryColorBtnRgb), 0.4)',
  },

  // Secondary button styles
  secondaryButton: {
    background: 'var(--switchBgColor)',
    color: 'var(--switchTextColor)',
  },

  // Danger button styles
  dangerButton: {
    background: 'var(--dangerColorBtn)',
    color: 'var(--dangerTextColorBtn)',
    boxShadow: '0 10px 15px -3px rgba(var(--dangerColorBtnRgb), 0.3)',
  },

  dangerButtonHover: {
    background: 'var(--dangerHoverColorBtn)',
    color: 'var(--dangerTextHoverColorBtn)',
  },

  // Selected/Active states
  selectedItem: {
    background: 'var(--selectedBgColorSideMenu)',
    color: 'var(--selectedColorSideMenu)',
    boxShadow: '0 10px 15px -3px rgba(var(--primaryColorBtnRgb), 0.3)',
  },

  // Light background for selected items
  selectedItemLight: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.1)',
    color: 'var(--primaryColor)',
  },

  // Tab active state
  activeTab: {
    borderColor: 'var(--primaryColor)',
    color: 'var(--primaryColor)',
    background: 'rgba(var(--primaryColorBtnRgb), 0.05)',
  },

  // Icons
  iconPrimary: {
    color: 'var(--iconActiveColor)',
  },

  iconDefault: {
    color: 'var(--iconDefaultColor)',
  },

  iconDisabled: {
    color: 'var(--iconDisableColor)',
  },

  // Text colors
  textPrimary: {
    color: 'var(--primaryTextColor)',
  },

  textSecondary: {
    color: 'var(--secondaryTextColor)',
  },

  textMuted: {
    color: 'var(--secondaryUpperTextColor)',
  },

  // Backgrounds
  bgMain: {
    background: 'var(--backgroundColor)',
  },

  bgCard: {
    background: 'var(--middleBackgroundColor)',
  },

  // Borders
  border: {
    borderColor: 'var(--stokeColor)',
  },

  // Badge/Tag styles
  badgePrimary: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.1)',
    color: 'var(--primaryColor)',
    borderColor: 'rgba(var(--primaryColorBtnRgb), 0.2)',
  },

  // Hover states for items
  hoverItem: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.05)',
  },

  // Checked/selected checkbox style
  checkedItem: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.08)',
  },

  // Avatar fallback
  avatarFallback: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.15)',
    color: 'var(--primaryColor)',
  },

  // Gradient heading
  gradientHeading: {
    background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  // Bulk actions bar
  bulkActionsBar: {
    background: 'linear-gradient(to right, rgba(var(--primaryColorBtnRgb), 0.08), rgba(var(--primaryColorBtnRgb), 0.12))',
    borderColor: 'rgba(var(--primaryColorBtnRgb), 0.2)',
  },

  // Column resize handle
  resizeHandle: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.3)',
  },

  resizeHandleHover: {
    background: 'var(--primaryColor)',
  },

  // Timeline line
  timelineLine: {
    background: 'linear-gradient(to bottom, rgba(var(--primaryColorBtnRgb), 0.3), transparent)',
  },

  // Date badge in timeline
  timelineDateBadge: {
    background: 'var(--selectedBgColorSideMenu)',
    color: 'var(--selectedColorSideMenu)',
    boxShadow: '0 10px 15px -3px rgba(var(--primaryColorBtnRgb), 0.3)',
  },

  // Activity category selected
  categorySelected: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.12)',
    color: 'var(--primaryColor)',
    borderColor: 'rgba(var(--primaryColorBtnRgb), 0.3)',
  },

  // Filter button active
  filterActive: {
    background: 'var(--primaryColorBtn)',
    color: 'var(--primaryTextColorBtn)',
    boxShadow: '0 10px 15px -3px rgba(var(--primaryColorBtnRgb), 0.3)',
  },

  // Table header
  tableHeader: {
    background: 'var(--tableHeaderColor)',
    color: 'var(--tableHeaderTextColor)',
  },

  // Table row selected
  tableRowSelected: {
    background: 'linear-gradient(to right, rgba(var(--primaryColorBtnRgb), 0.08), rgba(var(--primaryColorBtnRgb), 0.12))',
  },

  // Table row checked
  tableRowChecked: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.05)',
  },

  // Checkbox
  checkbox: {
    borderColor: 'var(--stokeColor)',
    color: 'var(--primaryColor)',
  },

  // Unread indicator
  unreadIndicator: {
    background: 'var(--primaryColorBtn)',
  },

  // Action icon button
  actionIconButton: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.08)',
    color: 'var(--primaryColor)',
  },

  actionIconButtonHover: {
    background: 'rgba(var(--primaryColorBtnRgb), 0.15)',
  },
};

/**
 * Helper function to merge custom styles with branded styles
 */
export function mergeStyles(...styles: (React.CSSProperties | undefined)[]) {
  return styles.reduce((acc, style) => ({ ...acc, ...style }), {});
}

/**
 * Get color with opacity
 */
export function withOpacity(colorVar: string, opacity: number) {
  // For RGB variables
  if (colorVar.includes('Rgb')) {
    return `rgba(var(${colorVar}), ${opacity})`;
  }
  // For regular colors, we can't easily add opacity without knowing if it's hex/rgb
  return `var(${colorVar})`;
}

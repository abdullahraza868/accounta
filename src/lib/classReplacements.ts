/**
 * Class replacement mappings for branding migration
 * This file contains mappings from hardcoded Tailwind classes to branded equivalents
 */

export const classReplacements = {
  // Primary button gradient
  'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30': 'btn-primary',
  
  // Selected item gradient
  'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30': 'bg-selected',
  
  // Selected/Active sidebar
  'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/40': 'bg-selected',
  
  // Light selected backgrounds
  'bg-purple-50 text-purple-700': 'bg-selected-light',
  'bg-purple-100 text-purple-700': 'bg-selected-light',
  'bg-purple-50': 'bg-selected-lighter',
  'bg-purple-100': 'bg-selected-lighter',
  'bg-purple-50/50': 'bg-selected-lighter',
  'bg-purple-50/30': 'bg-selected-lighter',
  
  // Text colors
  'text-purple-600': 'text-brand-primary',
  'text-purple-700': 'text-brand-primary',
  'text-purple-800': 'text-brand-primary',
  'text-purple-900': 'text-brand-primary',
  
  // Borders
  'border-purple-200': 'border-brand-light',
  'border-purple-300': 'border-brand-light',
  'border-purple-600': 'border-brand-primary',
  
  // Icon colors
  'text-purple-600': 'icon-brand',
  'text-purple-700': 'icon-brand',
  
  // Gradient text
  'bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent': 'text-brand-gradient',
  
  // Bulk actions bar
  'from-purple-50 to-purple-100': 'from-purple-50 to-purple-100', // Keep as custom
  
  // Table row selected
  'from-purple-50 to-purple-100/50': 'from-purple-50 to-purple-100/50', // Custom
};

export const styleReplacements = {
  primaryButton: `
    background: var(--primaryColorBtn);
    color: var(--primaryTextColorBtn);
    box-shadow: 0 10px 15px -3px rgba(var(--primaryColorBtnRgb), 0.3);
  `,
  
  selectedBg: `
    background: var(--selectedBgColorSideMenu);
    color: var(--selectedColorSideMenu);
    box-shadow: 0 10px 15px -3px rgba(var(--primaryColorBtnRgb), 0.3);
  `,
  
  lightSelected: `
    background: rgba(var(--primaryColorBtnRgb), 0.1);
    color: var(--primaryColor);
  `,
  
  lighterSelected: `
    background: rgba(var(--primaryColorBtnRgb), 0.05);
  `,
  
  iconBrand: `
    color: var(--primaryColor);
  `,
  
  borderBrand: `
    border-color: rgba(var(--primaryColorBtnRgb), 0.2);
  `,
};

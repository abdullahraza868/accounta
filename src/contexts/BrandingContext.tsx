import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/ApiService';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

export type BrandingColors = {
  // Brand Colors
  primaryBrand: string;
  secondaryBrand: string;
  
  // Main Background
  mainBackground: string;
  
  // Sidebar
  sidebarBackground: string;
  sidebarText: string;
  sidebarActiveBackground: string;
  sidebarActiveText: string;
  sidebarHoverBackground: string;
  
  // Buttons
  primaryButton: string;
  primaryButtonText: string;
  primaryButtonHover: string;
  secondaryButton: string;
  secondaryButtonText: string;
  secondaryButtonHover: string;
  dangerButton: string;
  dangerButtonText: string;
  
  // Top Bar
  topBarBackground: string;
  topBarText: string;
  
  // Cards
  cardBackground: string;
  cardBorder: string;
  cardHoverBorder: string;
  
  // Text
  headingText: string;
  bodyText: string;
  mutedText: string;
  
  // Input Fields
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputFocusBorder: string;
  
  // Links
  linkColor: string;
  linkHoverColor: string;
  
  // Status Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  
  // Login Page
  loginBackground: string;
  loginCardBackground: string;
  loginIllustrationBackground: string;
};

export type BrandingImages = {
  logo: string;
  loginIllustration: string;
  faviconUrl: string;
};

export type BrandingSettings = {
  colors: BrandingColors;
  images: BrandingImages;
  companyName: string;
};

const defaultLightColors: BrandingColors = {
  primaryBrand: '#7c3aed',
  secondaryBrand: '#a78bfa',
  
  mainBackground: '#f9fafb',
  
  sidebarBackground: '#ffffff',
  sidebarText: '#374151',
  sidebarActiveBackground: 'linear-gradient(to bottom right, #7c3aed, #6d28d9)',
  sidebarActiveText: '#ffffff',
  sidebarHoverBackground: 'linear-gradient(to bottom right, #f3f4f6, #f9fafb)',
  
  primaryButton: '#7c3aed',
  primaryButtonText: '#ffffff',
  primaryButtonHover: '#6d28d9',
  secondaryButton: '#f3f4f6',
  secondaryButtonText: '#374151',
  secondaryButtonHover: '#e5e7eb',
  dangerButton: '#ef4444',
  dangerButtonText: '#ffffff',
  
  topBarBackground: '#ffffff',
  topBarText: '#111827',
  
  cardBackground: '#ffffff',
  cardBorder: '#e5e7eb',
  cardHoverBorder: '#d1d5db',
  
  headingText: '#111827',
  bodyText: '#374151',
  mutedText: '#6b7280',
  
  inputBackground: '#ffffff',
  inputBorder: '#d1d5db',
  inputText: '#111827',
  inputFocusBorder: '#7c3aed',
  
  linkColor: '#7c3aed',
  linkHoverColor: '#6d28d9',
  
  successColor: '#10b981',
  warningColor: '#f59e0b',
  errorColor: '#ef4444',
  infoColor: '#3b82f6',
  
  loginBackground: '#f9fafb',
  loginCardBackground: '#ffffff',
  loginIllustrationBackground: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
};

const defaultDarkColors: BrandingColors = {
  primaryBrand: '#a78bfa',
  secondaryBrand: '#7c3aed',
  
  mainBackground: '#0f1117',
  
  sidebarBackground: '#1a1d29',
  sidebarText: '#9ca3af',
  sidebarActiveBackground: 'linear-gradient(to bottom right, #7c3aed, #6d28d9)',
  sidebarActiveText: '#ffffff',
  sidebarHoverBackground: 'linear-gradient(to bottom right, #1f2937, #374151)',
  
  primaryButton: '#7c3aed',
  primaryButtonText: '#ffffff',
  primaryButtonHover: '#8b5cf6',
  secondaryButton: '#374151',
  secondaryButtonText: '#e5e7eb',
  secondaryButtonHover: '#4b5563',
  dangerButton: '#ef4444',
  dangerButtonText: '#ffffff',
  
  topBarBackground: '#1a1d29',
  topBarText: '#e5e7eb',
  
  cardBackground: '#1a1d29',
  cardBorder: '#374151',
  cardHoverBorder: '#4b5563',
  
  headingText: '#f3f4f6',
  bodyText: '#9ca3af',
  mutedText: '#6b7280',
  
  inputBackground: '#1f2937',
  inputBorder: '#374151',
  inputText: '#e5e7eb',
  inputFocusBorder: '#a78bfa',
  
  linkColor: '#a78bfa',
  linkHoverColor: '#8b5cf6',
  
  successColor: '#10b981',
  warningColor: '#f59e0b',
  errorColor: '#ef4444',
  infoColor: '#3b82f6',
  
  loginBackground: '#0f1117',
  loginCardBackground: '#1a1d29',
  loginIllustrationBackground: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
};

const defaultColors = defaultLightColors;

const defaultImages: BrandingImages = {
  logo: accountaLogo,
  loginIllustration: '',
  faviconUrl: '',
};

const defaultSettings: BrandingSettings = {
  colors: defaultColors,
  images: defaultImages,
  companyName: 'Acounta',
};

type BrandingContextType = {
  branding: BrandingSettings;
  updateBranding: (settings: Partial<BrandingSettings>) => void;
  updateColors: (colors: Partial<BrandingColors>) => void;
  updateImages: (images: Partial<BrandingImages>) => void;
  updateCompanyName: (name: string) => void;
  resetToDefaults: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  logo: string;
  companyName: string;
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(() => {
    // Load from localStorage if available
    const stored = localStorage.getItem('brandingSettings');
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // If parsing fails, return appropriate defaults based on dark mode
        return {
          ...defaultSettings,
          colors: darkMode ? defaultDarkColors : defaultLightColors
        };
      }
    }
    
    // Return appropriate defaults based on dark mode
    return {
      ...defaultSettings,
      colors: darkMode ? defaultDarkColors : defaultLightColors
    };
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('darkMode');
    return stored === 'true';
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Load branding from API on mount
  useEffect(() => {
    console.log('🎨 BrandingContext: Initializing...');
    
    const loadBrandingFromAPI = async () => {
      try {
        console.log('🎨 BrandingContext: Loading from API...');
        const apiBranding = await apiService.getPlatformBranding();
        if (apiBranding) {
          console.log('✅ Loaded branding (mock mode):', apiBranding);
          setBranding(prev => ({
            ...prev,
            images: {
              ...prev.images,
              logo: apiBranding.logoUrl || prev.images.logo
            },
            companyName: apiBranding.companyName || prev.companyName
          }));
        }
      } catch (error) {
        // Silently fail - API not available, using defaults
        console.log('ℹ️ Using default branding (API not available)');
      }
    };
    
    // Mark as initialized immediately
    console.log('✅ BrandingContext: Initialization complete');
    setIsInitialized(true);
    
    // Load branding in background
    loadBrandingFromAPI();
  }, []);

  // Apply dark class on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('darkMode', isDarkMode.toString());
    }
  }, [isDarkMode, isInitialized]);

  // Save to localStorage whenever branding changes (after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('brandingSettings', JSON.stringify(branding));
    }
    
    // Apply CSS variables to document root
    const root = document.documentElement;
    const colors = branding.colors;
    
    // Map branding colors to CSS variables used throughout the app
    root.style.setProperty('--backgroundColor', colors.mainBackground);
    root.style.setProperty('--middleBackgroundColor', colors.cardBackground);
    root.style.setProperty('--primaryColor', colors.primaryBrand);
    root.style.setProperty('--primaryTextColor', colors.headingText);
    root.style.setProperty('--secondaryColor', colors.secondaryBrand);
    root.style.setProperty('--secondaryTextColor', colors.bodyText);
    root.style.setProperty('--primaryUpperTextColor', colors.headingText);
    root.style.setProperty('--secondaryUpperTextColor', colors.mutedText);
    
    // Button colors
    root.style.setProperty('--primaryColorBtn', colors.primaryButton);
    root.style.setProperty('--primaryHoverColorBtn', colors.primaryButtonHover);
    root.style.setProperty('--primaryTextColorBtn', colors.primaryButtonText);
    root.style.setProperty('--primaryTextHoverColorBtn', colors.primaryButtonText);
    root.style.setProperty('--dangerColorBtn', colors.dangerButton);
    root.style.setProperty('--dangerHoverColorBtn', colors.dangerButton);
    root.style.setProperty('--dangerTextColorBtn', colors.dangerButtonText);
    root.style.setProperty('--dangerTextHoverColorBtn', colors.dangerButtonText);
    
    // Convert hex to RGB for button colors
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 124, g: 58, b: 237 };
    };
    
    const primaryRgb = hexToRgb(colors.primaryButton);
    const dangerRgb = hexToRgb(colors.dangerButton);
    root.style.setProperty('--primaryColorBtnRgb', `${primaryRgb.r},${primaryRgb.g},${primaryRgb.b}`);
    root.style.setProperty('--dangerColorBtnRgb', `${dangerRgb.r},${dangerRgb.g},${dangerRgb.b}`);
    
    // Table colors
    root.style.setProperty('--tableHeaderColor', colors.primaryBrand);
    root.style.setProperty('--tableHeaderTextColor', '#ffffff');
    root.style.setProperty('--tableSubHeaderColor', colors.cardBackground);
    root.style.setProperty('--tableSubHeaderTextColor', colors.headingText);
    root.style.setProperty('--tableBodyColor', '#ffffff');
    root.style.setProperty('--tableBodyTextColor', colors.bodyText);
    root.style.setProperty('--tableSecondaryBodyColor', '#f9fafb');
    root.style.setProperty('--tableSecondaryBodyTextColor', colors.bodyText);
    root.style.setProperty('--tableFooterColor', colors.cardBackground);
    root.style.setProperty('--tableFooterTextColor', colors.bodyText);
    
    // Switch colors
    root.style.setProperty('--switchBgColor', colors.secondaryButton);
    root.style.setProperty('--switchSelectedBgColor', colors.primaryButton);
    root.style.setProperty('--switchTextColor', colors.secondaryButtonText);
    root.style.setProperty('--switchSelectedTextColor', colors.primaryButtonText);
    
    // Icon colors
    root.style.setProperty('--iconDefaultColor', colors.mutedText);
    root.style.setProperty('--iconDisableColor', '#d1d5db');
    root.style.setProperty('--iconActiveColor', colors.primaryBrand);
    root.style.setProperty('--iconHoverColor', colors.linkHoverColor);
    
    // Sidebar & Top Bar colors
    root.style.setProperty('--primaryColorSideMenu', colors.sidebarText);
    root.style.setProperty('--selectedColorSideMenu', colors.sidebarActiveText);
    root.style.setProperty('--selectedBgColorSideMenu', colors.sidebarActiveBackground);
    root.style.setProperty('--bgColorSideMenu', colors.sidebarBackground);
    root.style.setProperty('--primaryColorTopBar', colors.topBarText);
    root.style.setProperty('--bgColorTopBar', colors.topBarBackground);
    root.style.setProperty('--iconsColorTopBar', colors.mutedText);
    root.style.setProperty('--profilePicBorderColor', colors.cardBorder);
    
    // Tooltip colors
    root.style.setProperty('--tooltipBgColor', '#1f2937');
    root.style.setProperty('--tooltipTextColor', '#ffffff');
    
    // Misc colors
    root.style.setProperty('--disableColor', '#e5e7eb');
    root.style.setProperty('--stokeColor', colors.cardBorder);
    
    // Login page colors
    root.style.setProperty('--pageBgColorLogin', colors.loginBackground);
    root.style.setProperty('--imageBgColorLogin', colors.loginIllustrationBackground);
    
    // Also set with brand prefix for direct usage in components
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--brand-${key}`, value);
    });
    
    // Log for debugging
    console.log('✅ Branding colors applied to CSS variables');
  }, [branding]);

  const updateBranding = (settings: Partial<BrandingSettings>) => {
    setBranding(prev => ({ ...prev, ...settings }));
  };

  const updateColors = (colors: Partial<BrandingColors>) => {
    setBranding(prev => ({
      ...prev,
      colors: { ...prev.colors, ...colors }
    }));
  };

  const updateImages = (images: Partial<BrandingImages>) => {
    setBranding(prev => ({
      ...prev,
      images: { ...prev.images, ...images }
    }));
  };

  const updateCompanyName = (name: string) => {
    setBranding(prev => ({
      ...prev,
      companyName: name
    }));
  };

  const resetToDefaults = () => {
    setBranding(defaultSettings);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      console.log('🌓 Dark mode toggled:', newValue ? 'DARK' : 'LIGHT');
      
      // Update branding colors to match the new theme
      const newColors = newValue ? defaultDarkColors : defaultLightColors;
      setBranding(prevBranding => ({
        ...prevBranding,
        colors: newColors
      }));
      
      return newValue;
    });
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        updateBranding,
        updateColors,
        updateImages,
        updateCompanyName,
        resetToDefaults,
        isDarkMode,
        toggleDarkMode,
        logo: branding.images.logo,
        companyName: branding.companyName,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
}

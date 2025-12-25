import { useEffect, useState } from 'react';

/**
 * Diagnostic component to verify CSS and variables are loading correctly
 * This component will only show in development mode and can be toggled
 */
export function CSSLoadingDiagnostic() {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnostics, setDiagnostics] = useState({
    cssVariablesLoaded: false,
    tailwindLoaded: false,
    fontLoaded: false,
    brandingApplied: false,
  });

  // Check if we're in development mode
  const isDevelopment = typeof import.meta !== 'undefined' && 
                        import.meta.env && 
                        import.meta.env.MODE === 'development';

  useEffect(() => {
    // Only run diagnostics in development
    if (!isDevelopment) return;

    const runDiagnostics = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      // Check CSS variables
      const primaryColor = computedStyle.getPropertyValue('--primaryColor');
      const backgroundColor = computedStyle.getPropertyValue('--backgroundColor');
      
      // Check Tailwind classes
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-white text-black';
      document.body.appendChild(testDiv);
      const testStyle = getComputedStyle(testDiv);
      const tailwindWorks = testStyle.backgroundColor !== '';
      document.body.removeChild(testDiv);

      // Check font
      const fontFamily = computedStyle.fontFamily;

      setDiagnostics({
        cssVariablesLoaded: !!primaryColor && !!backgroundColor,
        tailwindLoaded: tailwindWorks,
        fontLoaded: fontFamily.includes('Inter'),
        brandingApplied: root.style.getPropertyValue('--primaryColor') !== '',
      });

      console.log('🔍 CSS Diagnostics:', {
        'CSS Variables': !!primaryColor && !!backgroundColor,
        'Tailwind CSS': tailwindWorks,
        'Inter Font': fontFamily.includes('Inter'),
        'Branding Applied': root.style.getPropertyValue('--primaryColor') !== '',
      });
    };

    // Run diagnostics after a short delay to ensure everything is loaded
    setTimeout(runDiagnostics, 100);

    // Listen for keyboard shortcut: Ctrl+Shift+D to toggle diagnostic panel
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDevelopment]);

  // Only show in development mode and when toggled
  if (!isDevelopment || !isVisible) {
    return null;
  }

  const allPassing = Object.values(diagnostics).every(v => v);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        minWidth: '300px',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          CSS Diagnostics
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            color: '#6b7280',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(diagnostics).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{value ? '✅' : '❌'}</span>
            <span style={{ color: value ? '#10b981' : '#ef4444' }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>
        ))}
      </div>

      <div 
        style={{ 
          marginTop: '12px', 
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '11px',
          color: '#6b7280'
        }}
      >
        {allPassing ? (
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ All systems operational</span>
        ) : (
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠ Some systems not loaded</span>
        )}
      </div>

      <div 
        style={{ 
          marginTop: '8px',
          fontSize: '10px',
          color: '#9ca3af',
          fontStyle: 'italic'
        }}
      >
        Press Ctrl+Shift+D to toggle
      </div>
    </div>
  );
}

// Simple test component to verify React is working
export default function AppTest() {
  console.log('✅ TEST: AppTest component is rendering');
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#7c3aed', fontSize: '32px', marginBottom: '16px' }}>
          ✅ React is Working!
        </h1>
        <p style={{ color: '#374151', fontSize: '18px' }}>
          If you see this, React is rendering correctly.
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
          Check the browser console for more details.
        </p>
      </div>
    </div>
  );
}

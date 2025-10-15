import { useState } from 'react'

function App() {
  const [message] = useState('RettBot+ API er live!')

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>
        ⚖️ RettBot+
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>
        {message}
      </p>
      
      <div style={{ 
        background: '#1a1a1a', 
        padding: '2rem', 
        borderRadius: '12px',
        maxWidth: '600px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>🚀 API Endpoints Klar:</h2>
        <ul style={{ lineHeight: '2', textAlign: 'left' }}>
          <li>✅ /api/evidence/analyze - Bevisanalyse</li>
          <li>✅ /api/legal/research - Juridisk research</li>
          <li>✅ /api/defense/strategy - Forsvarsstrategi</li>
          <li>✅ /api/legal/document - Dokumentgenerering</li>
          <li>✅ /api/corruption/assess - Korrupsjonsvurdering</li>
          <li>✅ /api/evidence/upload - Last opp bevis</li>
          <li>✅ /api/legal/penalties - Straffeutmåling</li>
          <li>✅ /api/rights/violations - Rettighetsmisbruk</li>
          <li>✅ /api/rights/appeal - Klagemal</li>
          <li>✅ /api/trial/simulate - Rettssimulator</li>
        </ul>
        
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#2d2d2d', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            🔗 Test API på: <code style={{ background: '#000', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>/api/health</code>
          </p>
        </div>
      </div>
      
      <p style={{ marginTop: '3rem', opacity: 0.6 }}>
        Fullstendig UI kommer i FASE 2-4
      </p>
    </div>
  )
}

export default App

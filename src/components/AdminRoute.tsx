import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../context/LanguageContext';

const ADMIN_CONSTANT_PASSWORD = '5983';

export const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { language } = useLanguage();
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_CONSTANT_PASSWORD) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsUnlocked(true);
      setError('');
    } else {
      setError(
        language === 'ta'
          ? 'தவறான கடவுச்சொல்! அணுகல் மறுக்கப்பட்டது.'
          : 'Incorrect password! Access denied.'
      );
    }
  };

  if (!isUnlocked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '1.5rem',
        color: '#f8fafc',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)'
          }}>
            <Shield size={32} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem' }}>
            {language === 'ta' ? 'நிர்வாக குழு அணுகல்' : 'Admin Panel Access'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.75rem', lineHeight: '1.4' }}>
            {language === 'ta'
              ? 'நிர்வாக பலகையைத் திறக்க 4-இலக்க கடவுச்சொல்லை உள்ளிடவும்'
              : 'Enter the 4-digit admin password to access the administration panel'}
          </p>

          <form onSubmit={handleUnlock}>
            <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
                  {language === 'ta' ? 'நிர்வாக கடவுச்சொல்' : 'Admin Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPassword ? (language === 'ta' ? 'மறை' : 'Hide') : (language === 'ta' ? 'காட்டு' : 'Show')}</span>
                </button>
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value.replace(/\D/g, '').substring(0, 4));
                  setError('');
                }}
                maxLength={4}
                placeholder="••••"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: error ? '1.5px solid #ef4444' : '1.5px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  letterSpacing: '0.4em',
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '6px', textAlign: 'center' }}>
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '10px',
                marginBottom: '1rem'
              }}
            >
              <KeyRound size={18} style={{ marginRight: '8px' }} />
              {language === 'ta' ? 'அணுகல் திறக்க' : 'Unlock Admin Panel'}
            </Button>

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#94a3b8',
                fontSize: '0.875rem',
                textDecoration: 'none',
                marginTop: '0.5rem'
              }}
            >
              <ArrowLeft size={16} />
              <span>{language === 'ta' ? 'முகப்புக்கு திரும்புக' : 'Return to Home'}</span>
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

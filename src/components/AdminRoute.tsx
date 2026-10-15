import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Shield, KeyRound, ArrowLeft, Eye, EyeOff, ShieldAlert, LogIn, Lock } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isAdminUser, getDisplayUserId, ADMIN_PHONE_NUMBER } from '../utils/adminAuth';

const ADMIN_CONSTANT_PASSWORD = '5983';

export const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isTamil = language === 'ta';
  const isAdmin = isAdminUser(user);

  // 1. Loading State
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#38bdf8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>{isTamil ? 'சரிபார்க்கிறது...' : 'Verifying credentials...'}</p>
        </div>
      </div>
    );
  }

  // 2. Case: Not Logged In
  if (!isAuthenticated || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '1.5rem',
        color: '#f8fafc'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
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
            <Lock size={32} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem' }}>
            {isTamil ? 'நிர்வாக உள்நுழைவு தேவை' : 'Admin Login Required'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            {isTamil
              ? `இந்த நிர்வாக குழுவை அணுக அனுமதிக்கப்பட்ட நிர்வாக ஐடி (${ADMIN_PHONE_NUMBER}) மூலம் உள்நுழையவும்.`
              : `Admin panel access is strictly restricted to authorized Administrator ID: ${ADMIN_PHONE_NUMBER}. Please log in.`}
          </p>

          <Button
            type="button"
            onClick={() => navigate('/login', { state: { from: { pathname: '/admin' } } })}
            style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600, borderRadius: '10px', marginBottom: '1rem' }}
          >
            <LogIn size={18} style={{ marginRight: '8px' }} />
            {isTamil ? 'நிர்வாகியாக உள்நுழைக' : 'Login as Admin'}
          </Button>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#94a3b8',
              fontSize: '0.875rem',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} />
            <span>{isTamil ? 'முகப்புக்கு திரும்புக' : 'Return to Home'}</span>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Case: Logged In, but NOT Admin 8248843385
  if (!isAdmin) {
    const currentId = getDisplayUserId(user);
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '1.5rem',
        color: '#f8fafc'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.4)'
          }}>
            <ShieldAlert size={32} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem' }}>
            {isTamil ? 'அணுகல் மறுக்கப்பட்டது (Access Denied)' : 'Access Restricted (403)'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            {isTamil
              ? `நிர்வாக குழு ஐடி: ${ADMIN_PHONE_NUMBER} க்கு மட்டுமே அனுமதிக்கப்பட்டுள்ளது. உங்கள் தற்போதைய கணக்கிற்கு (${currentId}) அனுமதி இல்லை.`
              : `Admin Panel is exclusively restricted to Administrator ID: ${ADMIN_PHONE_NUMBER}. Your current logged-in account (${currentId}) is not authorized.`}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login', { state: { from: { pathname: '/admin' } } });
              }}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 600, borderRadius: '10px' }}
            >
              <LogIn size={18} style={{ marginRight: '8px' }} />
              {isTamil ? 'நிர்வாக கணக்குக்கு மாற்றவும்' : 'Switch to Admin Account'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', borderRadius: '10px', color: '#e2e8f0', borderColor: '#475569' }}
            >
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              {isTamil ? 'முகப்புக்கு திரும்புக' : 'Return to Home'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Case: Logged In Admin 8248843385, check PIN unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPin = localStorage.getItem('user_pin') || localStorage.getItem(`pin_${ADMIN_PHONE_NUMBER}`);
    if (password.trim() === ADMIN_CONSTANT_PASSWORD || (savedPin && password.trim() === savedPin)) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsUnlocked(true);
      setError('');
    } else {
      setError(
        isTamil
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

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.25rem' }}>
            {isTamil ? 'நிர்வாக குழு அணுகல்' : 'Admin Panel Security'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '0.75rem', fontWeight: 600 }}>
            👑 {isTamil ? 'நிர்வாகி ஐடி' : 'Authorized Admin'}: {ADMIN_PHONE_NUMBER}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.75rem', lineHeight: '1.4' }}>
            {isTamil
              ? 'நிர்வாக பலகையைத் திறக்க 4-இலக்க கடவுச்சொல்லை (5983) உள்ளிடவும்'
              : 'Enter the 4-digit admin password (5983) to unlock the administration panel'}
          </p>

          <form onSubmit={handleUnlock}>
            <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
                  {isTamil ? 'நிர்வாக கடவுச்சொல்' : 'Admin Password'}
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
                  <span>{showPassword ? (isTamil ? 'மறை' : 'Hide') : (isTamil ? 'காட்டு' : 'Show')}</span>
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
              {isTamil ? 'அணுகல் திறக்க' : 'Unlock Admin Panel'}
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
              <span>{isTamil ? 'முகப்புக்கு திரும்புக' : 'Return to Home'}</span>
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

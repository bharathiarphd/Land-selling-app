import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageCircle, Mail, ShieldCheck, Lock, Unlock, 
  Clock, AlertTriangle, CheckCircle2, HeartHandshake, Shield 
} from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { contactRequestUtils, type PropertyContactRequest } from '../utils/contactRequestUtils';
import type { Property } from '../data/mockProperties';
import styles from './SellerCard.module.css';

interface SellerCardProps {
  seller: {
    id?: string;
    name: string;
    type: string;
    phone?: string;
    isVerified?: boolean;
  };
  property?: Property;
  onEnquireClick: () => void;
  onRequestContactClick?: () => void;
}

export function SellerCard({ 
  seller, 
  property, 
  onEnquireClick,
  onRequestContactClick 
}: SellerCardProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [contactRequest, setContactRequest] = useState<PropertyContactRequest | undefined>(undefined);

  const rawPhone = seller.phone || '9842112233';
  const maskedPhone = contactRequestUtils.maskPhoneNumber(rawPhone);

  useEffect(() => {
    if (user?.id && property?.id) {
      const req = contactRequestUtils.getRequestForProperty(user.id, property.id);
      setContactRequest(req);
    } else {
      setContactRequest(undefined);
    }
  }, [user?.id, property?.id]);

  const initials = (seller.name || 'Owner')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isApproved = contactRequest?.status === 'Approved';
  const isPending = contactRequest?.status === 'Pending';
  const isRejected = contactRequest?.status === 'Rejected';

  return (
    <div className={styles.sellerCard}>
      <div className={styles.sellerHeader}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.sellerInfo}>
          <div className={styles.sellerName}>
            {seller.name}
            {seller.isVerified !== false && (
              <span className={styles.badge}><ShieldCheck size={12} /> {language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
            )}
          </div>
          <div className={styles.sellerType}>{seller.type || 'Property Owner'}</div>
        </div>
      </div>

      {/* Contact Privacy Box */}
      <div 
        style={{
          backgroundColor: isApproved ? '#f0fdf4' : '#f8fafc',
          border: `1px solid ${isApproved ? '#bbf7d0' : '#e2e8f0'}`,
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {language === 'ta' ? 'உரிமையாளர் தொடர்பு எண்' : 'Owner Contact Details'}
          </span>
          {isApproved ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700 }}>
              <Unlock size={14} /> {language === 'ta' ? 'திறக்கப்பட்டது (அனுமதிக்கப்பட்டது)' : 'Unlocked by Admin'}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontSize: '0.78rem', fontWeight: 600 }}>
              <Lock size={14} /> {language === 'ta' ? 'பாதுகாக்கப்பட்டது' : 'Protected'}
            </span>
          )}
        </div>

        {/* Phone number display */}
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: isApproved ? '#15803d' : '#334155', fontFamily: 'monospace', letterSpacing: '1px', marginBottom: '8px' }}>
          {isApproved ? `+91 ${rawPhone}` : maskedPhone}
        </div>

        {/* Protection Explanatory Banner */}
        {isApproved ? (
          <div style={{ fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>{language === 'ta' ? 'நிர்வாகி ஒப்புதல் அளித்துள்ளார். நீங்கள் நேரடியாக அழைக்கலாம் அல்லது வாட்ஸ்அப் செய்யலாம்.' : 'Admin approved your request. You can now call or WhatsApp the owner directly.'}</span>
          </div>
        ) : isPending ? (
          <div style={{ fontSize: '0.8rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#d97706" />
            <span>{language === 'ta' ? 'உங்கள் கோரிக்கை நிர்வாகியிடம் ஒப்புதலுக்காக நிலுவையில் உள்ளது.' : 'Your request is pending Admin permission. Details will unlock once approved.'}</span>
          </div>
        ) : isRejected ? (
          <div style={{ fontSize: '0.8rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} color="#dc2626" />
            <span>{language === 'ta' ? 'நிர்வாகியால் கோரிக்கை நிராகரிக்கப்பட்டது.' : 'Contact request declined by Admin.'}</span>
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.4 }}>
            <Shield size={15} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
            <span>
              {language === 'ta' 
                ? 'தரகர் தொல்லையைத் தடுக்க உரிமையாளர் எண் மறைக்கப்பட்டுள்ளது. நீங்கள் நிலத்தை விரும்பினால் நிர்வாகியிடம் தொடர்பு கோரலாம்.'
                : 'Owner contact is masked for security. Click below to request permission from Admin to receive contact details.'}
            </span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {/* Main "I Like & Want to Buy" / Request Button */}
        {!isApproved ? (
          <Button 
            className={styles.actionBtn} 
            onClick={onRequestContactClick || onEnquireClick}
            style={{
              backgroundColor: isPending ? '#f59e0b' : '#0284c7',
              borderColor: isPending ? '#d97706' : '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isPending ? (
              <>
                <Clock size={18} />
                <span>{language === 'ta' ? '⏳ ஒப்புதலுக்காக காத்திருக்கிறது' : '⏳ Request Pending Admin Approval'}</span>
              </>
            ) : (
              <>
                <HeartHandshake size={18} />
                <span>{language === 'ta' ? '❤️ நிலத்தை வாங்க விரும்புகிறேன் / தொடர்பு கோருக' : '❤️ I Want to Buy / Request Owner Contact'}</span>
              </>
            )}
          </Button>
        ) : (
          <div 
            style={{ 
              backgroundColor: '#dcfce7', 
              color: '#15803d', 
              padding: '8px 12px', 
              borderRadius: '8px', 
              textAlign: 'center', 
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '4px'
            }}
          >
            ✅ {language === 'ta' ? 'நேரடி தொடர்பு திறக்கப்பட்டது' : 'Direct Owner Access Granted'}
          </div>
        )}

        {/* Action Row: Call and WhatsApp buttons */}
        <div className={styles.actionRow}>
          {isApproved ? (
            <>
              <a 
                href={`tel:${rawPhone}`} 
                style={{ flex: 1, textDecoration: 'none' }}
                id="call-owner-btn"
              >
                <Button 
                  variant="outline" 
                  className={styles.actionBtn} 
                  style={{ width: '100%', borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
                >
                  <Phone size={18} style={{ marginRight: '6px' }} /> 
                  {language === 'ta' ? 'அழைக்க' : 'Call Owner'}
                </Button>
              </a>

              <a 
                href={`https://wa.me/91${rawPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I am interested in buying your property "${property?.title || 'Land'}" listed on Land Selling App.`)}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ flex: 1, textDecoration: 'none' }}
                id="whatsapp-owner-btn"
              >
                <Button 
                  variant="outline" 
                  className={styles.actionBtn} 
                  style={{ width: '100%', color: '#25D366', borderColor: '#25D366', fontWeight: 600 }}
                >
                  <MessageCircle size={18} style={{ marginRight: '6px' }} /> WhatsApp
                </Button>
              </a>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className={styles.actionBtn} 
                onClick={onRequestContactClick || onEnquireClick}
                style={{ opacity: 0.85 }}
                title={language === 'ta' ? 'அழைக்க நிர்வாகி ஒப்புதல் தேவை' : 'Admin permission required to call'}
              >
                <Lock size={15} style={{ marginRight: '6px', color: '#ea580c' }} /> 
                {language === 'ta' ? 'அழைக்க (பூட்டப்பட்டது)' : 'Call (Locked)'}
              </Button>

              <Button 
                variant="outline" 
                className={styles.actionBtn} 
                onClick={onRequestContactClick || onEnquireClick}
                style={{ opacity: 0.85 }}
                title={language === 'ta' ? 'வாட்ஸ்அப் செய்ய நிர்வாகி ஒப்புதல் தேவை' : 'Admin permission required for WhatsApp'}
              >
                <Lock size={15} style={{ marginRight: '6px', color: '#ea580c' }} /> 
                WhatsApp
              </Button>
            </>
          )}
        </div>

        {/* General Send Enquiry Option */}
        <Button 
          variant="outline" 
          onClick={onEnquireClick} 
          style={{ fontSize: '0.85rem', color: '#64748b', borderColor: '#e2e8f0', marginTop: '2px' }}
        >
          <Mail size={16} style={{ marginRight: '6px' }} /> 
          {language === 'ta' ? 'பொது விசாரணை அனுப்புக' : 'Send General Message'}
        </Button>
      </div>
    </div>
  );
}

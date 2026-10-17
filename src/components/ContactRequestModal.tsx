import React, { useState } from 'react';
import { Shield, CheckCircle2, Lock, Heart, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { contactRequestUtils } from '../utils/contactRequestUtils';
import type { Property } from '../data/mockProperties';
import { getDisplayUserId } from '../utils/adminAuth';

interface ContactRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onSuccess?: () => void;
}

export const ContactRequestModal: React.FC<ContactRequestModalProps> = ({
  isOpen,
  onClose,
  property,
  onSuccess
}) => {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '');
  const [message, setMessage] = useState('I liked this property and want to buy it. Please provide the owner contact details.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayUserId = getDisplayUserId(user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!name.trim()) {
      setError(language === 'ta' ? 'உங்கள் பெயரை உள்ளிடவும்' : 'Please enter your name');
      return;
    }
    if (cleanPhone.length !== 10) {
      setError(language === 'ta' ? 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    try {
      await contactRequestUtils.createRequest({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        propertyLocation: `${property.location}, ${property.district}`,
        propertyImage: property.images[0] || '',
        buyerId: user?.id || `buyer_${Date.now()}`,
        buyerName: name.trim(),
        buyerPhone: cleanPhone,
        buyerEmail: user?.email || '',
        buyerUserId: displayUserId || 'USR-NEW',
        message: message.trim(),
        sellerId: property.seller?.id || 'owner_unknown',
        sellerName: property.seller?.name || 'Property Owner',
        sellerPhone: property.seller?.phone || '9842112233',
        sellerType: property.seller?.type || 'Owner'
      });

      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={
        isSubmitted
          ? (language === 'ta' ? 'கோரிக்கை அனுப்பப்பட்டது!' : 'Request Submitted!')
          : (language === 'ta' ? 'உரிமையாளர் தொடர்பு கோரிக்கை' : 'Request Owner Contact')
      }
    >
      {isSubmitted ? (
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <div 
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            {language === 'ta' ? 'நிர்வாகியிடம் கோரிக்கை சமர்ப்பிக்கப்பட்டது' : 'Request Sent to Admin'}
          </h3>

          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
            {language === 'ta'
              ? 'உரிமையாளரின் தொடர்பு விவரங்கள் சரிபார்ப்பிற்காக நிர்வாகிக்கு அனுப்பப்பட்டுள்ளன. நிர்வாகி ஒப்புதல் அளித்தவுடன் இந்த பக்கத்திலும் அறிவிப்பிலும் தொடர்பு விவரங்கள் திறக்கப்படும்.'
              : 'Owner contact details are protected. Admin will verify your request and approve contact access. You will be notified immediately upon approval.'}
          </p>

          <div 
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'left',
              marginBottom: '20px',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
              {property.title}
            </div>
            <div style={{ color: '#0284c7', fontWeight: 700 }}>
              ₹{property.price.toLocaleString('en-IN')}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
              Status: <span style={{ color: '#d97706', fontWeight: 600 }}>⏳ Pending Admin Approval</span>
            </div>
          </div>

          <Button style={{ width: '100%' }} onClick={handleModalClose}>
            {language === 'ta' ? 'புரிந்தது / மூடு' : 'Done / Close'}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Property snippet */}
          <div 
            style={{
              display: 'flex',
              gap: '12px',
              backgroundColor: '#f8fafc',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            {property.images[0] && (
              <img 
                src={property.images[0]} 
                alt={property.title} 
                style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} 
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div 
                style={{ 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {property.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {property.location}, {property.district}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                ₹{property.price.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Privacy Protection Banner */}
          <div 
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              fontSize: '0.82rem',
              color: '#1e40af',
              lineHeight: 1.4
            }}
          >
            <Shield size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{language === 'ta' ? 'தனியுரிமை பாதுகாப்பு:' : 'Owner Privacy Protection:'}</strong>{' '}
              {language === 'ta' 
                ? 'தரகர் தொல்லை மற்றும் ஏமாற்றுதல்களைத் தடுக்க உரிமையாளர் எண் நேரடியாக வெளியிடப்படாது. நிர்வாகி ஒப்புதல் அளித்த பிறகே தொடர்பு விவரங்கள் வழங்கப்படும்.'
                : 'Owner contact details are kept private to prevent spam and verify genuine buyers. Admin gives permission and grants the contact details.'}
            </div>
          </div>

          {error && (
            <div 
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#dc2626',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <Input
            label={language === 'ta' ? 'உங்கள் பெயர்' : 'Your Full Name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            required
          />

          <Input
            label={language === 'ta' ? 'மொபைல் எண் (சரிபார்க்கப்பட்டது)' : 'Your Mobile Number'}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            type="tel"
            maxLength={10}
            required
          />

          <div>
            <label 
              style={{ 
                display: 'block', 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: 'var(--font-weight-medium)', 
                marginBottom: '6px',
                color: 'var(--color-text-secondary)'
              }}
            >
              {language === 'ta' ? 'விருப்பச் செய்தி / காரணம்' : 'Message to Admin / Interest Note'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                resize: 'none'
              }}
              placeholder="e.g. I liked this land and am interested in making an offer..."
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <Button 
              type="button" 
              variant="outline" 
              style={{ flex: 1 }} 
              onClick={handleModalClose}
            >
              {language === 'ta' ? 'ரத்து' : 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              style={{ flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              disabled={isSubmitting}
            >
              <Lock size={15} />
              <span>
                {isSubmitting
                  ? (language === 'ta' ? 'அனுப்புகிறது...' : 'Submitting...')
                  : (language === 'ta' ? 'நிர்வாகியிடம் தொடர்பு கோருக' : 'Request Contact from Admin')}
              </span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

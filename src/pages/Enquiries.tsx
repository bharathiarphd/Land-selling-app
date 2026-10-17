import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, Clock, CheckCircle2, XCircle, Phone, 
  MessageCircle, ExternalLink, ShieldCheck, Mail 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { communicationUtils } from '../utils/communicationUtils';
import { contactRequestUtils, type PropertyContactRequest } from '../utils/contactRequestUtils';
import type { Enquiry } from '../types/communication';
import { Button } from '../components/Button';

export default function Enquiries() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'contactRequests' | 'receivedEnquiries'>('contactRequests');
  const [contactRequests, setContactRequests] = useState<PropertyContactRequest[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Load contact requests submitted by this buyer
      const myRequests = contactRequestUtils.getBuyerRequests(user.id);
      setContactRequests(myRequests);

      // Load general enquiries
      const enqs = await communicationUtils.getReceivedEnquiries(user.id);
      setEnquiries(enqs);

      setLoading(false);
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
        {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)', maxWidth: '960px' }}>
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <h1 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PhoneCall size={28} color="#0284c7" />
          <span>{language === 'ta' ? 'எனது விசாரணைகள் & தொடர்பு கோரிக்கைகள்' : 'My Inquiries & Contact Requests'}</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          {language === 'ta'
            ? 'நீங்கள் விரும்பிய நிலங்களின் உரிமையாளர் தொடர்பு கோரிக்கைகள் மற்றும் நிலையை இங்கு கண்காணிக்கலாம்.'
            : 'Track your purchase requests to property owners and view Admin approval status.'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--spacing-6)' }}>
        <button
          onClick={() => setActiveTab('contactRequests')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderBottom: activeTab === 'contactRequests' ? '3px solid #0284c7' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'contactRequests' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 'contactRequests' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <PhoneCall size={16} />
          <span>{language === 'ta' ? 'உரிமையாளர் தொடர்பு கோரிக்கைகள்' : 'Owner Contact Requests'}</span>
          <span 
            style={{
              backgroundColor: activeTab === 'contactRequests' ? '#e0f2fe' : '#f1f5f9',
              color: activeTab === 'contactRequests' ? '#0369a1' : '#64748b',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {contactRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('receivedEnquiries')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderBottom: activeTab === 'receivedEnquiries' ? '3px solid #0284c7' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'receivedEnquiries' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 'receivedEnquiries' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Mail size={16} />
          <span>{language === 'ta' ? 'பெறப்பட்ட செய்திகள்' : 'Received Messages'}</span>
          <span 
            style={{
              backgroundColor: activeTab === 'receivedEnquiries' ? '#e0f2fe' : '#f1f5f9',
              color: activeTab === 'receivedEnquiries' ? '#0369a1' : '#64748b',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {enquiries.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Owner Contact Requests */}
      {activeTab === 'contactRequests' && (
        <div>
          {contactRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-10)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <PhoneCall size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>
                {language === 'ta' ? 'எந்த தொடர்பு கோரிக்கையும் சமர்ப்பிக்கப்படவில்லை' : 'No Contact Requests Yet'}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', maxWidth: '400px', margin: '6px auto 16px' }}>
                {language === 'ta'
                  ? 'நீங்கள் விரும்பும் நிலத்தின் விவரப் பக்கத்திற்குச் சென்று "வாங்க விரும்புகிறேன் / தொடர்பு கோருக" என்பதைக் கிளிக் செய்யவும்.'
                  : 'When you like a property, click "I Want to Buy / Request Owner Contact" on its details page to request permission from Admin.'}
              </p>
              <Link to="/search">
                <Button>{language === 'ta' ? 'நிலங்களை உலாவுக' : 'Browse Properties'}</Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
              {contactRequests.map(req => {
                const isApproved = req.status === 'Approved';
                const isPending = req.status === 'Pending';
                const isRejected = req.status === 'Rejected';

                return (
                  <div 
                    key={req.id} 
                    style={{ 
                      padding: 'var(--spacing-4)', 
                      backgroundColor: 'var(--color-surface)', 
                      borderRadius: 'var(--radius-lg)', 
                      border: `1px solid ${isApproved ? '#bbf7d0' : 'var(--color-border)'}`,
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 'var(--spacing-3)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <Link 
                          to={`/property/${req.propertyId}`}
                          style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <span>{req.propertyTitle}</span>
                          <ExternalLink size={14} color="#64748b" />
                        </Link>
                        <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                          ₹{req.propertyPrice?.toLocaleString('en-IN')} • {req.propertyLocation}
                        </div>
                      </div>

                      {/* Status pill */}
                      <div>
                        {isApproved && (
                          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> {language === 'ta' ? 'ஒப்புதல் அளிக்கப்பட்டது (தொடர்பு திறக்கப்பட்டது)' : 'Admin Approved & Unlocked'}
                          </span>
                        )}
                        {isPending && (
                          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} /> {language === 'ta' ? 'நிர்வாகி ஒப்புதலுக்காக காத்திருக்கிறது' : 'Pending Admin Approval'}
                          </span>
                        )}
                        {isRejected && (
                          <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={14} /> {language === 'ta' ? 'நிராகரிக்கப்பட்டது' : 'Declined'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Owner Contact Reveal Box */}
                    <div 
                      style={{
                        backgroundColor: isApproved ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${isApproved ? '#86efac' : '#e2e8f0'}`,
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                          {language === 'ta' ? 'சொத்து உரிமையாளர்' : 'Property Owner'}: <span style={{ color: '#1e293b' }}>{req.sellerName}</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: isApproved ? '#15803d' : '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                          {isApproved ? `+91 ${req.sellerPhone}` : contactRequestUtils.maskPhoneNumber(req.sellerPhone)}
                        </div>
                        {!isApproved && (
                          <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '2px' }}>
                            🔒 {language === 'ta' ? 'நிர்வாகி அனுமதித்தவுடன் தொடர்பு எண் காட்டப்படும்' : 'Contact number will be revealed once Admin approves permission'}
                          </div>
                        )}
                      </div>

                      {/* Call / WhatsApp actions if approved */}
                      {isApproved && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a href={`tel:${req.sellerPhone}`} style={{ textDecoration: 'none' }}>
                            <Button style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={15} /> Call Owner
                            </Button>
                          </a>
                          <a 
                            href={`https://wa.me/91${req.sellerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I am interested in buying your property "${req.propertyTitle}" on Land Selling App.`)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}
                          >
                            <Button variant="outline" style={{ padding: '8px 14px', fontSize: '0.85rem', color: '#25D366', borderColor: '#25D366', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <MessageCircle size={15} /> WhatsApp
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Requested on: {new Date(req.createdAt).toLocaleString()}</span>
                      {req.reviewedAt && <span>Reviewed on: {new Date(req.reviewedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Received Enquiries */}
      {activeTab === 'receivedEnquiries' && (
        <div>
          {enquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>You haven't received any enquiries yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
              {enquiries.map(enq => (
                <div key={enq.id} style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="h4">{enq.propertyTitle}</h3>
                    <span style={{ fontSize: 'var(--font-size-xs)', backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px' }}>{enq.status}</span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    <strong>From:</strong> {enq.buyerName} ({enq.buyerPhone})
                  </div>
                  <div style={{ marginTop: 'var(--spacing-2)', padding: 'var(--spacing-3)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                    {enq.message}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

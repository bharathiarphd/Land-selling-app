import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, MapPin, Maximize, Map, Zap, Droplets, CheckCircle, Navigation, ShieldCheck, Calendar, FileText } from 'lucide-react';
import { ImageGallery } from '../components/ImageGallery';
import { SellerCard } from '../components/SellerCard';
import { PropertyCard } from '../components/PropertyCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { EmptyState } from '../components/EmptyState';
import { Toast } from '../components/Toast';
import { GoogleMap } from '../components/GoogleMap';
import { getPropertyById, getSimilarProperties, addRecentlyViewed } from '../utils/propertyUtils';
import { communicationUtils } from '../utils/communicationUtils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './PropertyDetail.module.css';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(id ? getPropertyById(id) : undefined);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, variant: 'success'|'info'|'error'} | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const { t, language } = useLanguage();
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', message: language === 'ta' ? 'இந்த சொத்தில் எனக்கு ஆர்வம் உள்ளது. கூடுதல் விவரங்களை வழங்கவும்.' : "I'm interested in this property. Please provide more details." });
  const { user } = useAuth();

  // Load property and update SEO/Recently viewed
  useEffect(() => {
    if (id) {
      const p = getPropertyById(id);
      setProperty(p);
      if (p) {
        document.title = `${p.title} | Land Selling App`;
        addRecentlyViewed(p.id);
      } else {
        document.title = 'Property Not Found | Land Selling App';
      }
      // Scroll to top on new property load
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (!property) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-10)' }}>
        <EmptyState 
          title={language === 'ta' ? 'சொத்து காணப்படவில்லை' : "Property Not Found"} 
          description={language === 'ta' ? 'நீங்கள் தேடும் சொத்து நீக்கப்பட்டிருக்கலாம் அல்லது தற்போது கிடைக்கவில்லை.' : "The property you are looking for may have been removed or is no longer available."}
          actionText={language === 'ta' ? 'தேடலுக்கு திரும்பு' : "Back to Search"}
          onAction={() => navigate('/search')}
        />
      </div>
    );
  }

  const similarProperties = getSimilarProperties(property);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Check out this property in ${property.location}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowToast({ message: 'Property link copied to clipboard', variant: 'info' });
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    setShowToast({ 
      message: !isFavorite ? 'Property saved to favorites' : 'Property removed from saved properties', 
      variant: !isFavorite ? 'success' : 'info' 
    });
  };

  const handleEnquirySubmit = async () => {
    if (!enquiryForm.name || !enquiryForm.phone) {
      setShowToast({ message: 'Please provide name and phone number', variant: 'error' });
      return;
    }
    
    setIsSubmittingEnquiry(true);
    try {
      await communicationUtils.createEnquiry({
        propertyId: property!.id,
        propertyTitle: property!.title,
        buyerId: user?.id || `guest_${Date.now()}`,
        buyerName: enquiryForm.name,
        buyerPhone: enquiryForm.phone,
        buyerEmail: enquiryForm.email,
        sellerId: property!.seller.id,
        message: enquiryForm.message,
      });
      setIsEnquiryOpen(false);
      setShowToast({ message: language === 'ta' ? 'விசாரணை வெற்றிகரமாக அனுப்பப்பட்டது' : 'Enquiry sent successfully', variant: 'success' });
      setEnquiryForm({ name: '', phone: '', email: '', message: language === 'ta' ? 'இந்த சொத்தில் எனக்கு ஆர்வம் உள்ளது. கூடுதல் விவரங்களை வழங்கவும்.' : "I'm interested in this property. Please provide more details." });
    } catch (error) {
      setShowToast({ message: language === 'ta' ? 'விசாரணை அனுப்ப முடியவில்லை' : 'Failed to send enquiry', variant: 'error' });
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handleSiteVisit = () => {
    setShowToast({ message: language === 'ta' ? 'தள வருகை கோரிக்கை விற்பனையாளருக்கு அனுப்பப்பட்டது!' : 'Site visit request sent to seller!', variant: 'success' });
  };

  // Determine Price per sq.ft if we have valid sq.ft area
  let pricePerSqFt: number | null = null;
  if (property.areaUnit === 'Sq.Ft' && property.area > 0) {
    pricePerSqFt = Math.round(property.price / property.area);
  } else if (property.areaUnit === 'Cent' && property.area > 0) {
    pricePerSqFt = Math.round(property.price / (property.area * 435.6));
  }

  return (
    <div className={`container ${styles.pageContainer}`}>
      
      {/* Mobile/Header Navigation */}
      <nav className={styles.headerNav}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>{t('propertyDetails.title')}</span>
        </button>
        <div className={styles.headerActions}>
          <button className={styles.actionIconBtn} onClick={handleShare} aria-label="Share property">
            <Share2 size={20} />
          </button>
          <button className={styles.actionIconBtn} onClick={handleFavoriteToggle} aria-label="Favorite property">
            <Heart size={20} fill={isFavorite ? 'var(--color-error)' : 'none'} color={isFavorite ? 'var(--color-error)' : 'currentColor'} />
          </button>
        </div>
      </nav>

      <div className={styles.desktopLayout}>
        
        {/* Left Column (Main Content) */}
        <div className={styles.mainContent}>
          
          <ImageGallery images={property.images} alt={property.title} />
          
          <div className={styles.titleSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1 className={styles.propertyTitle}>{property.title}</h1>
              {property.verificationStatus && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: property.verificationStatus === 'Verified by Platform' ? '#dcfce7' : '#f3f4f6', color: property.verificationStatus === 'Verified by Platform' ? '#166534' : '#4b5563', padding: '6px 12px', borderRadius: '20px', fontSize: 'var(--font-size-xs)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <ShieldCheck size={16} /> {property.verificationStatus}
                </div>
              )}
            </div>
            <div className={styles.propertyLocation}>
              <MapPin size={16} />
              {property.location}, {property.district}, Tamil Nadu
            </div>
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{language === 'ta' ? 'இந்த சொத்து பற்றி' : 'About This Property'}</h2>
            <p className={styles.description}>{property.description}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{language === 'ta' ? 'சொத்து வசதிகள்' : 'Property Features'}</h2>
            <div className={styles.featuresGrid}>
              {property.roadWidth > 0 && (
                <div className={styles.featureBadge}><Navigation size={16} /> {property.roadWidth} {language === 'ta' ? 'அடி சாலை அணுகல்' : 'ft Road Access'}</div>
              )}
              {property.electricity && (
                <div className={styles.featureBadge}><Zap size={16} /> {language === 'ta' ? 'மின்சாரம் உள்ளது' : 'Electricity Available'}</div>
              )}
              {property.water && (
                <div className={styles.featureBadge}><Droplets size={16} /> {language === 'ta' ? 'தண்ணீர் உள்ளது' : 'Water Available'}</div>
              )}
              {property.fencing && (
                <div className={styles.featureBadge}><Map size={16} /> {language === 'ta' ? 'வேலி அமைக்கப்பட்டுள்ளது' : 'Fenced Boundary'}</div>
              )}
              {property.borewell && (
                <div className={styles.featureBadge}><Droplets size={16} /> {language === 'ta' ? 'ஆழ்துளை கிணறு உள்ளது' : 'Borewell Available'}</div>
              )}
              {property.approval !== 'Unapproved' && (
                <div className={styles.featureBadge}><CheckCircle size={16} /> {property.approval} {language === 'ta' ? 'அனுமதி' : 'Approved'}</div>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('propertyDetails.title')}</h2>
            <div className={styles.detailsList}>
              <div className={styles.detailRow}><span className={styles.detailLabel}>{t('propertyDetails.propertyId')}</span><span className={styles.detailValue}>{property.id.toUpperCase()}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>{t('common.type')}</span><span className={styles.detailValue}>{property.propertyType}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>{t('common.area')}</span><span className={styles.detailValue}>{property.area} {property.areaUnit}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>{t('propertyDetails.facing')}</span><span className={styles.detailValue}>{property.facing}</span></div>
              {property.surveyNumber && <div className={styles.detailRow}><span className={styles.detailLabel}>{language === 'ta' ? 'சர்வே எண்' : 'Survey No'}</span><span className={styles.detailValue}>{property.surveyNumber}</span></div>}
              {property.cornerProperty && <div className={styles.detailRow}><span className={styles.detailLabel}>{language === 'ta' ? 'மூலை மனை' : 'Corner Plot'}</span><span className={styles.detailValue}>{language === 'ta' ? 'ஆம்' : 'Yes'}</span></div>}
              <div className={styles.detailRow}><span className={styles.detailLabel}>{t('common.status')}</span><span className={styles.detailValue}>{property.status}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>{language === 'ta' ? 'பட்டியலிடப்பட்ட தேதி' : 'Listed'}</span><span className={styles.detailValue}>{new Date(property.dateAdded).toLocaleDateString()}</span></div>
            </div>
          </section>

          {property.documents && Object.keys(property.documents).length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{language === 'ta' ? 'சமர்ப்பிக்கப்பட்ட ஆவணங்கள்' : 'Documents Submitted'}</h2>
              <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
                {property.documents.patta && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0f9ff', padding: '8px 16px', borderRadius: '20px', fontSize: 'var(--font-size-sm)', border: '1px solid #bae6fd' }}><FileText size={16} color="#0284c7" /> {language === 'ta' ? 'பட்டா' : 'Patta'}</div>}
                {property.documents.chitta && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0f9ff', padding: '8px 16px', borderRadius: '20px', fontSize: 'var(--font-size-sm)', border: '1px solid #bae6fd' }}><FileText size={16} color="#0284c7" /> {language === 'ta' ? 'சிட்டா' : 'Chitta'}</div>}
                {property.documents.ec && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0f9ff', padding: '8px 16px', borderRadius: '20px', fontSize: 'var(--font-size-sm)', border: '1px solid #bae6fd' }}><FileText size={16} color="#0284c7" /> {language === 'ta' ? 'வில்லங்கச் சான்றிதழ் (EC)' : 'Encumbrance Cert (EC)'}</div>}
                {property.documents.saleDeed && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0f9ff', padding: '8px 16px', borderRadius: '20px', fontSize: 'var(--font-size-sm)', border: '1px solid #bae6fd' }}><FileText size={16} color="#0284c7" /> {language === 'ta' ? 'விற்பனை பத்திரம்' : 'Sale Deed'}</div>}
                {property.documents.layoutApproval && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0f9ff', padding: '8px 16px', borderRadius: '20px', fontSize: 'var(--font-size-sm)', border: '1px solid #bae6fd' }}><FileText size={16} color="#0284c7" /> {language === 'ta' ? 'லேஅவுட் அனுமதி' : 'Layout Approval'}</div>}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('propertyDetails.location')}</h2>
            <div className={styles.detailsList} style={{ marginBottom: 'var(--spacing-4)' }}>
              <div className={styles.detailRow}><span className={styles.detailLabel}>{t('search.state')}</span><span className={styles.detailValue}>{language === 'ta' ? 'தமிழ்நாடு' : 'Tamil Nadu'}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>{t('search.district')}</span><span className={styles.detailValue}>{property.district}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>{t('search.taluk')}</span><span className={styles.detailValue}>{property.taluk}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>{t('search.village')}</span><span className={styles.detailValue}>{property.village}</span></div>
            </div>
            <div className={styles.mapPlaceholder} style={{ padding: 0, overflow: 'hidden' }}>
              <GoogleMap 
                center={property.latitude && property.longitude ? { lat: property.latitude, lng: property.longitude } : { lat: 12.9716, lng: 80.0415 }}
                zoom={14}
                markers={property.latitude && property.longitude ? [{ id: '1', lat: property.latitude, lng: property.longitude, title: property.title }] : []}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar for Desktop) */}
        <div className={styles.sidebar}>
          <div className={styles.priceSection}>
            <div className={styles.price}>{formatPrice(property.price)}</div>
            {pricePerSqFt && (
              <div className={styles.pricePerUnit}>{formatPrice(pricePerSqFt)} / sq.ft</div>
            )}
            
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <Maximize className={styles.summaryIcon} size={20} />
                <div>
                  <div className={styles.summaryLabel}>{t('common.area')}</div>
                  <div className={styles.summaryValue}>{property.area} {property.areaUnit}</div>
                </div>
              </div>
              <div className={styles.summaryItem}>
                <Map className={styles.summaryIcon} size={20} />
                <div>
                  <div className={styles.summaryLabel}>{t('common.type')}</div>
                  <div className={styles.summaryValue}>{property.propertyType}</div>
                </div>
              </div>
              <div className={styles.summaryItem}>
                <Navigation className={styles.summaryIcon} size={20} />
                <div>
                  <div className={styles.summaryLabel}>{t('propertyDetails.facing')}</div>
                  <div className={styles.summaryValue}>{property.facing}</div>
                </div>
              </div>
              <div className={styles.summaryItem}>
                <CheckCircle className={styles.summaryIcon} size={20} />
                <div>
                  <div className={styles.summaryLabel}>{t('propertyDetails.approval')}</div>
                  <div className={styles.summaryValue}>{property.approval}</div>
                </div>
              </div>
            </div>
          </div>

          <SellerCard seller={property.seller} onEnquireClick={() => setIsEnquiryOpen(true)} />

          <Button style={{ width: '100%', marginTop: 'var(--spacing-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }} variant="outline" onClick={handleSiteVisit}>
            <Calendar size={18} /> {language === 'ta' ? 'தள வருகையை கோருக' : 'Request Site Visit'}
          </Button>
        </div>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className={styles.section} style={{ marginTop: 'var(--spacing-8)' }}>
          <h2 className={styles.sectionTitle}>{language === 'ta' ? 'இதே போன்ற சொத்துகள்' : 'Similar Properties'}</h2>
          <div className={styles.similarGrid}>
            {similarProperties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: 'var(--spacing-8)', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        <strong>{language === 'ta' ? 'பொறுப்புத் துறப்பு:' : 'Disclaimer:'}</strong> {language === 'ta' ? 'சொத்து தகவல்கள் விற்பனையாளரால் வழங்கப்படுகின்றன. பரிவர்த்தனையை முடிப்பதற்கு முன் வாங்குபவர்கள் உரிமையாளர், தலைப்பு, வில்லங்கம், அனுமதிகள் மற்றும் பிற சட்ட ஆவணங்களை தகுதிவாய்ந்த வல்லுநர்கள்/சம்பந்தப்பட்ட அதிகாரிகளிடம் சுயாதீனமாக சரிபார்க்க வேண்டும்.' : 'Property information is provided by the seller. Buyers should independently verify ownership, title, encumbrance, approvals and other legal documents with qualified professionals/appropriate authorities before completing a transaction.'}
      </div>

      {/* Mobile Sticky Contact Bar */}
      <div className={styles.stickyContactBar}>
        <Button variant="outline" style={{ flex: 1 }} onClick={handleSiteVisit}><Calendar size={16} /> {language === 'ta' ? 'வருகை' : 'Visit'}</Button>
        <Button variant="outline" style={{ flex: 1 }} onClick={() => setIsEnquiryOpen(true)}>{language === 'ta' ? 'விசாரிக்க' : 'Enquire'}</Button>
        <Button style={{ flex: 1 }} onClick={() => navigate('/messages')}>{language === 'ta' ? 'பேசுக' : 'Chat'}</Button>
      </div>

      {/* Enquiry Modal */}
      <Modal 
        isOpen={isEnquiryOpen} 
        onClose={() => setIsEnquiryOpen(false)} 
        title={language === 'ta' ? 'விசாரணை அனுப்புக' : 'Send Enquiry'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEnquiryOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleEnquirySubmit} disabled={isSubmittingEnquiry}>
              {isSubmittingEnquiry ? (language === 'ta' ? 'அனுப்பப்படுகிறது...' : 'Sending...') : (language === 'ta' ? 'விசாரணை அனுப்புக' : 'Send Enquiry')}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <Input 
            label={language === 'ta' ? 'பெயர்' : 'Name'} 
            placeholder={language === 'ta' ? 'உங்கள் பெயரை உள்ளிடவும்' : 'Enter your name'} 
            value={enquiryForm.name}
            onChange={e => setEnquiryForm({...enquiryForm, name: e.target.value})}
          />
          <Input 
            label={t('auth.mobileNumber')} 
            type="tel" 
            placeholder={language === 'ta' ? 'கைபேசி எண்ணை உள்ளிடவும்' : 'Enter mobile number'} 
            value={enquiryForm.phone}
            onChange={e => setEnquiryForm({...enquiryForm, phone: e.target.value})}
          />
          <div className="input-wrapper">
            <label className="input-label">{language === 'ta' ? 'செய்தி' : 'Message'}</label>
            <textarea 
              className="input-field" 
              rows={4}
              value={enquiryForm.message}
              onChange={e => setEnquiryForm({...enquiryForm, message: e.target.value})}
              style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', resize: 'vertical' }}
            />
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {showToast && (
        <Toast 
          message={showToast.message} 
          variant={showToast.variant} 
          onClose={() => setShowToast(null)} 
        />
      )}
    </div>
  );
}

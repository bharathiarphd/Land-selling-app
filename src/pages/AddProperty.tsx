import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, UploadCloud, X, CheckCircle, Image as ImageIcon, User, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { GoogleMap } from '../components/GoogleMap';
import { createProperty, getPropertyById, updateProperty } from '../utils/propertyUtils';
import type { Property } from '../data/mockProperties';
import styles from './AddProperty.module.css';
import { EmptyState } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

const DRAFT_KEY = 'landSellingApp_propertyDraft';

interface PropertyFormData {
  title: string;
  propertyType: string;
  price: number;
  area: number;
  areaUnit: string;
  location: {
    state: string;
    district: string;
    taluk: string;
    village: string;
    address: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  details: {
    facing: string;
    roadWidth: string;
    roadAccess: string;
    electricity: string;
    water: string;
    corner: string;
    approval: string;
    ownership: string;
  };
  description: string;
  images: string[];
}

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { t, language } = useLanguage();

  const [step, setStep] = useState(1);
  const [hasDraftPrompt, setHasDraftPrompt] = useState(true);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    propertyType: 'Plot', // using one from Phase 1 defaults
    price: 0,
    area: 0,
    areaUnit: 'Sq.Ft',
    location: {
      state: 'Tamil Nadu',
      district: '',
      taluk: '',
      village: '',
      address: '',
      pincode: ''
    },
    details: {
      facing: '',
      roadWidth: '',
      roadAccess: '',
      electricity: '',
      water: '',
      corner: '',
      approval: '',
      ownership: ''
    },
    description: '',
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessId, setPublishSuccessId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editId) {
      setHasDraftPrompt(false);
      const existing = getPropertyById(editId);
      if (existing) {
        setFormData({
          title: existing.title,
          propertyType: existing.propertyType,
          price: existing.price,
          area: existing.area,
          areaUnit: existing.areaUnit,
          location: {
            state: 'Tamil Nadu',
            district: existing.district,
            taluk: existing.taluk,
            village: existing.village,
            address: existing.location,
            pincode: ''
          },
          details: {
            facing: existing.facing === 'Any' ? '' : existing.facing,
            roadWidth: existing.roadWidth ? String(existing.roadWidth) : '',
            roadAccess: existing.roadWidth > 0 ? 'Yes' : 'No',
            electricity: existing.electricity ? 'Available' : 'Not Available',
            water: existing.water ? 'Available' : 'Not Available',
            corner: '',
            approval: existing.approval === 'Unapproved' ? '' : existing.approval,
            ownership: ''
          },
          description: existing.description,
          images: existing.images || []
        });
      }
      return;
    }

    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft && hasDraftPrompt) {
      if (window.confirm(language === 'ta' ? 'உங்கள் சேமிக்கப்பட்ட வரைவை தொடர விரும்புகிறீர்களா?' : 'Continue your saved draft?')) {
        setFormData(JSON.parse(draft));
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
    setHasDraftPrompt(false);
  }, [hasDraftPrompt, editId]);

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    alert(language === 'ta' ? 'வரைவு சேமிக்கப்பட்டது' : 'Draft saved');
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 6));
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.title?.trim()) newErrors.title = language === 'ta' ? 'தலைப்பு தேவை' : 'Title is required';
      if (!formData.propertyType) newErrors.propertyType = language === 'ta' ? 'சொத்து வகை தேவை' : 'Property type is required';
      if (!formData.price || formData.price <= 0) newErrors.price = language === 'ta' ? 'சரியான விலை தேவை' : 'Valid price is required';
      if (!formData.area || formData.area <= 0) newErrors.area = language === 'ta' ? 'சரியான பரப்பளவு தேவை' : 'Valid area is required';
      if (!formData.areaUnit) newErrors.areaUnit = language === 'ta' ? 'அலகு தேவை' : 'Unit is required';
    } else if (currentStep === 2) {
      if (!formData.location.state) newErrors.state = language === 'ta' ? 'மாநிலம் தேவை' : 'State is required';
      if (!formData.location.district) newErrors.district = language === 'ta' ? 'மாவட்டம் தேவை' : 'District is required';
      if (!formData.location.taluk) newErrors.taluk = language === 'ta' ? 'தாலுகா தேவை' : 'Taluk is required';
      if (!formData.location.village) newErrors.village = language === 'ta' ? 'கிராமம் / நகரம் தேவை' : 'Village/Town is required';
      if (formData.location.pincode && !/^\d{6}$/.test(formData.location.pincode)) {
        newErrors.pincode = language === 'ta' ? '6-இலக்க சரியான அஞ்சல் குறியீடாக இருக்க வேண்டும்' : 'Must be a 6-digit valid pincode';
      }
    } else if (currentStep === 4) {
      if (!formData.description?.trim()) newErrors.description = language === 'ta' ? 'விளக்கம் தேவை' : 'Description is required';
      else if (formData.description.length > 2000) newErrors.description = language === 'ta' ? 'விளக்கம் 2000 எழுத்துகளுக்குள் இருக்க வேண்டும்' : 'Description must be under 2000 chars';
    } else if (currentStep === 5) {
      if (!formData.images || formData.images.length === 0) {
        newErrors.images = language === 'ta' ? 'குறைந்தது ஒரு புகைப்படம் தேவை' : 'At least one photo is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateStep(5)) return;

    setIsPublishing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const payload: Partial<Property> = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType as any,
        price: formData.price,
        area: formData.area,
        areaUnit: formData.areaUnit as any,
        location: formData.location.address || formData.location.village,
        district: formData.location.district,
        taluk: formData.location.taluk,
        village: formData.location.village,
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        images: formData.images,
        facing: (formData.details.facing as any) || 'Any',
        roadWidth: Number(formData.details.roadWidth) || 0,
        electricity: formData.details.electricity === 'Available',
        water: formData.details.water === 'Available',
        approval: (formData.details.approval as any) || 'Unapproved',
        seller: {
          id: user?.id || `usr_${Date.now()}`,
          name: user?.name || 'Seller',
          type: user?.role === 'Agent' ? 'Agent' : 'Owner',
          phone: user?.phone || ''
        },
        dateAdded: new Date().toISOString()
      };

      if (editId) {
        updateProperty(editId, payload);
        setPublishSuccessId(editId);
      } else {
        const newProperty = createProperty(payload);
        localStorage.removeItem(DRAFT_KEY);
        setPublishSuccessId(newProperty.id);
      }

    } catch (err) {
      console.error(err);
      alert(language === 'ta' ? 'வெளியிடுவதில் தோல்வி. மீண்டும் முயற்சிக்கவும்.' : 'Failed to publish. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      const allImages = [...(formData.images || []), ...newImages].slice(0, 10);
      setFormData({ ...formData, images: allImages });
      if (errors.images) setErrors({ ...errors, images: '' });
    }
  };

  const removeImage = (index: number) => {
    const allImages = [...(formData.images || [])];
    allImages.splice(index, 1);
    setFormData({ ...formData, images: allImages });
  };

  const setMainImage = (index: number) => {
    if (index === 0) return;
    const allImages = [...(formData.images || [])];
    const main = allImages.splice(index, 1)[0];
    allImages.unshift(main);
    setFormData({ ...formData, images: allImages });
  };

  if (user?.role === 'Buyer') {
    return (
      <div className={`container ${styles.container}`}>
        <EmptyState 
          title={language === 'ta' ? 'விற்பனையாளர் கணக்கு தேவை' : "Seller Account Required"} 
          description={language === 'ta' ? 'சொத்தை பட்டியலிட உங்களுக்கு விற்பனையாளர் அல்லது முகவர் கணக்கு தேவை.' : "You need a Seller or Agent account to list a property."}
          icon={<User size={48} color="var(--color-text-muted)" />}
        />
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-4)' }}>
          <Button variant="outline" onClick={() => navigate('/profile')}>{language === 'ta' ? 'விற்பனையாளர் கணக்கிற்கு மாறுக/உருவாக்குக' : 'Switch/Create Seller Account'}</Button>
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <Button variant="outline" onClick={() => navigate('/')}>{language === 'ta' ? 'சொத்துகளை உலாவு' : 'Browse Properties'}</Button>
          </div>
        </div>
      </div>
    );
  }

  if (publishSuccessId) {
    return (
      <div className={`container ${styles.container}`} style={{ textAlign: 'center', paddingTop: 'var(--spacing-16)' }}>
        <CheckCircle size={64} color="var(--color-success)" style={{ margin: '0 auto var(--spacing-6)' }} />
        <h1 className={styles.title}>{editId ? (language === 'ta' ? 'சொத்து வெற்றிகரமாக புதுப்பிக்கப்பட்டது!' : 'Property Updated successfully!') : (language === 'ta' ? 'உங்கள் சொத்து வெற்றிகரமாக பட்டியலிடப்பட்டது!' : 'Your property has been listed successfully!')}</h1>
        <p className={styles.subtitle} style={{ margin: 'var(--spacing-4) 0' }}>{language === 'ta' ? 'சொத்து ID:' : 'Property ID:'} {publishSuccessId}</p>
        
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', marginTop: 'var(--spacing-8)', flexWrap: 'wrap' }}>
          <Button onClick={() => navigate(`/property/${publishSuccessId}`)}>{language === 'ta' ? 'சொத்தை பார்க்க' : 'View Property'}</Button>
          {!editId && (
            <Button variant="outline" onClick={() => {
              setFormData({ 
                title: '', propertyType: 'Plot', price: 0, area: 0, areaUnit: 'Sq.Ft', 
                location: { state: 'Tamil Nadu', district: '', taluk: '', village: '', address: '', pincode: '' },
                details: { facing: '', roadWidth: '', roadAccess: '', electricity: '', water: '', corner: '', approval: '', ownership: '' },
                description: '', images: [] 
              });
              setStep(1);
              setPublishSuccessId(null);
            }}>{language === 'ta' ? 'மற்றொரு சொத்தை சேர்க்க' : 'Add Another Property'}</Button>
          )}
          <Button variant="outline" onClick={() => navigate('/my-properties')}>{language === 'ta' ? 'எனது சொத்துகளுக்கு செல்ல' : 'Go to My Properties'}</Button>
        </div>
      </div>
    );
  }

  const steps = language === 'ta' ? [
    'அடிப்படை', 'இடம்', 'விவரங்கள்', 'விளக்கம்', 'புகைப்படங்கள்', 'முன்னோட்டம்'
  ] : [
    'Basic', 'Location', 'Details', 'Description', 'Photos', 'Preview'
  ];

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <ChevronLeft size={20} /> {t('common.back')}
        </button>
        <h1 className={styles.title}>{editId ? (language === 'ta' ? 'சொத்தை திருத்துக' : 'Edit Property') : (language === 'ta' ? 'உங்கள் சொத்தை விற்க' : 'Sell Your Property')}</h1>
        <p className={styles.subtitle}>{language === 'ta' ? 'உங்கள் நிலத்தை பட்டியலிட்டு வாங்குபவர்களை அணுகவும்.' : 'List your land and reach potential buyers.'}</p>
      </div>

      <div className={styles.stepIndicator}>
        {steps.map((label, i) => (
          <div 
            key={label} 
            className={`${styles.stepItem} ${step === i + 1 ? styles.active : ''} ${step > i + 1 ? styles.completed : ''}`}
            onClick={() => { if (step > i + 1) setStep(i + 1); }}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      <div className={styles.formCard}>
        {step === 1 && (
          <div>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            <div className={styles.grid}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input 
                  label="Property Title" 
                  placeholder="e.g. Residential Land for Sale in Tindivanam"
                  value={formData.title}
                  onChange={e => { setFormData({...formData, title: e.target.value}); setErrors({...errors, title: ''}); }}
                  error={errors.title}
                />
              </div>
              <Select 
                label="Property Type"
                value={formData.propertyType}
                onChange={e => { setFormData({...formData, propertyType: e.target.value}); setErrors({...errors, propertyType: ''}); }}
                options={[
                  { value: 'Plot', label: 'Plot' },
                  { value: 'Agricultural Land', label: 'Agricultural Land' },
                  { value: 'Commercial Land', label: 'Commercial Land' },
                  { value: 'Farm Land', label: 'Farm Land' },
                ]}
                error={errors.propertyType}
              />
              <Input 
                label="Price (₹)" 
                type="number"
                placeholder="0"
                value={formData.price || ''}
                onChange={e => { setFormData({...formData, price: Number(e.target.value)}); setErrors({...errors, price: ''}); }}
                error={errors.price}
              />
              <Input 
                label="Area" 
                type="number"
                placeholder="0"
                value={formData.area || ''}
                onChange={e => { setFormData({...formData, area: Number(e.target.value)}); setErrors({...errors, area: ''}); }}
                error={errors.area}
              />
              <Select 
                label="Area Unit"
                value={formData.areaUnit}
                onChange={e => { setFormData({...formData, areaUnit: e.target.value}); setErrors({...errors, areaUnit: ''}); }}
                options={[
                  { value: 'Sq.Ft', label: 'Sq.Ft' },
                  { value: 'Cent', label: 'Cent' },
                  { value: 'Acre', label: 'Acre' },
                  { value: 'Sq.M', label: 'Sq.M' },
                ]}
                error={errors.areaUnit}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className={styles.sectionTitle}>Location Information</h2>
            <div className={styles.grid}>
              <Input 
                label="State" 
                value={formData.location.state}
                onChange={e => { setFormData({...formData, location: {...formData.location, state: e.target.value}}); setErrors({...errors, state: ''}); }}
                error={errors.state}
              />
              <Input 
                label="District" 
                placeholder="e.g. Villupuram"
                value={formData.location.district}
                onChange={e => { setFormData({...formData, location: {...formData.location, district: e.target.value}}); setErrors({...errors, district: ''}); }}
                error={errors.district}
              />
              <Input 
                label="Taluk" 
                placeholder="e.g. Tindivanam"
                value={formData.location.taluk}
                onChange={e => { setFormData({...formData, location: {...formData.location, taluk: e.target.value}}); setErrors({...errors, taluk: ''}); }}
                error={errors.taluk}
              />
              <Input 
                label="Village / Town" 
                placeholder="Enter village or town"
                value={formData.location.village}
                onChange={e => { setFormData({...formData, location: {...formData.location, village: e.target.value}}); setErrors({...errors, village: ''}); }}
                error={errors.village}
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <Input 
                  label="Address" 
                  placeholder="Street or Area address"
                  value={formData.location.address}
                  onChange={e => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                />
              </div>
              <Input 
                label="Pincode" 
                placeholder="6 digit pincode"
                maxLength={6}
                value={formData.location.pincode}
                onChange={e => { setFormData({...formData, location: {...formData.location, pincode: e.target.value.replace(/\D/g, '')}}); setErrors({...errors, pincode: ''}); }}
                error={errors.pincode}
              />
            </div>

            <div style={{ marginTop: 'var(--spacing-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <label className={styles.label} style={{ fontWeight: 'var(--font-weight-medium)' }}>Pin on Map (Optional)</label>
                <button type="button" onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                          }
                        });
                      },
                      () => alert("Unable to retrieve your location")
                    );
                  }
                }} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  <Navigation size={14} /> Use My Current Location
                </button>
              </div>
              <GoogleMap 
                center={formData.location.latitude && formData.location.longitude ? { lat: formData.location.latitude, lng: formData.location.longitude } : { lat: 12.9716, lng: 80.0415 }}
                zoom={10}
                markers={formData.location.latitude && formData.location.longitude ? [{ id: 'marker-1', lat: formData.location.latitude, lng: formData.location.longitude }] : []}
                onMapClick={(lat, lng) => setFormData({...formData, location: {...formData.location, latitude: lat, longitude: lng}})}
                style={{ width: '100%', height: '300px' }}
              />
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>
                Click on the map to place a pin at the property location.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className={styles.sectionTitle}>Property Details</h2>
            <div className={styles.grid}>
              <Select 
                label="Facing"
                value={formData.details.facing}
                onChange={e => setFormData({...formData, details: {...formData.details, facing: e.target.value}})}
                options={[
                  { value: '', label: 'Select Facing' },
                  { value: 'East', label: 'East' },
                  { value: 'West', label: 'West' },
                  { value: 'North', label: 'North' },
                  { value: 'South', label: 'South' },
                  { value: 'North-East', label: 'North-East' },
                  { value: 'North-West', label: 'North-West' },
                  { value: 'South-East', label: 'South-East' },
                  { value: 'South-West', label: 'South-West' },
                ]}
              />
              <Input 
                label="Road Width (ft/m)" 
                placeholder="e.g. 20 ft"
                value={formData.details.roadWidth}
                onChange={e => setFormData({...formData, details: {...formData.details, roadWidth: e.target.value}})}
              />
              <Select 
                label="Road Access"
                value={formData.details.roadAccess}
                onChange={e => setFormData({...formData, details: {...formData.details, roadAccess: e.target.value}})}
                options={[{ value: '', label: 'Select' }, { value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
              />
              <Select 
                label="Corner Property"
                value={formData.details.corner}
                onChange={e => setFormData({...formData, details: {...formData.details, corner: e.target.value}})}
                options={[{ value: '', label: 'Select' }, { value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
              />
              <Select 
                label="Electricity"
                value={formData.details.electricity}
                onChange={e => setFormData({...formData, details: {...formData.details, electricity: e.target.value}})}
                options={[{ value: '', label: 'Select' }, { value: 'Available', label: 'Available' }, { value: 'Not Available', label: 'Not Available' }]}
              />
              <Select 
                label="Water"
                value={formData.details.water}
                onChange={e => setFormData({...formData, details: {...formData.details, water: e.target.value}})}
                options={[{ value: '', label: 'Select' }, { value: 'Available', label: 'Available' }, { value: 'Not Available', label: 'Not Available' }]}
              />
              <Select 
                label="Approval"
                value={formData.details.approval}
                onChange={e => setFormData({...formData, details: {...formData.details, approval: e.target.value}})}
                options={[
                  { value: '', label: 'Not Specified' },
                  { value: 'DTCP', label: 'DTCP Approved' },
                  { value: 'CMDA', label: 'CMDA Approved' },
                  { value: 'Panchayat', label: 'Panchayat Approved' },
                  { value: 'Unapproved', label: 'Not Approved' }
                ]}
              />
              <Select 
                label="Ownership Status"
                value={formData.details.ownership}
                onChange={e => setFormData({...formData, details: {...formData.details, ownership: e.target.value}})}
                options={[
                  { value: '', label: 'Not Specified' },
                  { value: 'Clear Title', label: 'Clear Title' },
                  { value: 'Joint Ownership', label: 'Joint Ownership' },
                  { value: 'Other', label: 'Other' }
                ]}
              />
            </div>
            <p style={{ marginTop: 'var(--spacing-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Note: Please verify ownership, approvals and documents independently before completing a transaction.
            </p>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className={styles.sectionTitle}>Property Description</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <label style={{ fontWeight: 'var(--font-weight-medium)' }}>Property Description</label>
              <textarea 
                rows={10}
                placeholder="Describe the property, nearby facilities, road access, surroundings and other important information."
                value={formData.description}
                onChange={e => {
                  if (e.target.value.length <= 2000) {
                    setFormData({...formData, description: e.target.value});
                    setErrors({...errors, description: ''});
                  }
                }}
                style={{ 
                  width: '100%', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', 
                  border: `1px solid ${errors.description ? 'var(--color-error)' : 'var(--color-border)'}`, 
                  fontFamily: 'inherit', resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{errors.description}</span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  {formData.description.length} / 2000
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className={styles.sectionTitle}>Property Photos</h2>
            
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={48} className={styles.uploadIcon} />
              <h3 style={{ marginBottom: 'var(--spacing-2)' }}>Click to Add Photos</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Select up to 10 images (JPEG, PNG). The first image will be your main photo.
              </p>
            </div>

            {errors.images && <p style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-4)', textAlign: 'center' }}>{errors.images}</p>}

            {formData.images && formData.images.length > 0 && (
              <div className={styles.photoGrid}>
                {formData.images.map((src, i) => (
                  <div key={src} className={styles.photoItem}>
                    <img src={src} alt={`Preview ${i}`} />
                    <div className={styles.photoActions}>
                      {i === 0 ? (
                        <span className={styles.mainBadge}>Main Photo</span>
                      ) : (
                        <button className={styles.mainBtn} title="Set as Main" onClick={(e) => { e.stopPropagation(); setMainImage(i); }}>
                          <ImageIcon size={14} />
                        </button>
                      )}
                      <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 className={styles.sectionTitle}>Review & Publish</h2>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-6)', flexDirection: 'column' }}>
              {/* Preview mimicking a simplified PropertyDetails view */}
              <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--color-border)' }}>
                    {formData.images && formData.images[0] ? (
                      <img src={formData.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Main" />
                    ) : (
                      <ImageIcon size={32} color="var(--color-text-secondary)" style={{ margin: '34px' }} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-xl)' }}>{formData.title}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>{formData.location.village}, {formData.location.district}</p>
                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                      ₹{formData.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>
                  <div><strong>Type:</strong> {formData.propertyType}</div>
                  <div><strong>Area:</strong> {formData.area} {formData.areaUnit}</div>
                  <div><strong>Facing:</strong> {formData.details.facing || '-'}</div>
                  <div><strong>Approval:</strong> {formData.details.approval || '-'}</div>
                </div>

                <div>
                  <strong>Description:</strong>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)', whiteSpace: 'pre-line', fontSize: 'var(--font-size-sm)' }}>
                    {formData.description}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                  Please confirm all details are correct. You can edit them later from your profile.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {step > 1 ? (
          <Button variant="outline" onClick={handleBack}>Back</Button>
        ) : (
          <div></div> // Spacer
        )}

        <div className={styles.actionRight}>
          <Button variant="outline" onClick={saveDraft}>Save Draft</Button>
          
          {step < 6 ? (
            <Button onClick={handleNext}>Continue</Button>
          ) : (
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? 'Saving...' : editId ? 'Save Changes' : 'Publish Property'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

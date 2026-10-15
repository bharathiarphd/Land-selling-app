import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  MessageCircle, 
  PhoneCall, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  FileCheck2, 
  HelpCircle,
  ExternalLink 
} from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import styles from './Help.module.css';

interface FAQItem {
  id: string;
  category: 'buying' | 'selling' | 'documents' | 'safety' | 'account';
  questionEn: string;
  questionTa: string;
  answerEn: string;
  answerTa: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'doc-1',
    category: 'documents',
    questionEn: 'How can I verify the Patta and Chitta of a land in Tamil Nadu?',
    questionTa: 'தமிழ்நாட்டில் ஒரு நிலத்தின் பட்டா மற்றும் சிட்டாவை எவ்வாறு சரிபார்க்கலாம்?',
    answerEn: 'You can verify Patta and Chitta online through the official Tamil Nadu e-Services portal (eservices.tn.gov.in). Enter the District, Taluk, Village, and Survey Number / Sub-division Number to verify the current land owner name and extent.',
    answerTa: 'தமிழ்நாடு அரசின் அதிகாரப்பூர்வ e-Services போர்ட்டலில் (eservices.tn.gov.in) மாவட்டம், வட்டம், கிராமம் மற்றும் புல எண்/உட்பிரிவு எண்ணை உள்ளிட்டு பட்டா மற்றும் சிட்டா விவரங்களை ஆன்லைனில் இலவசமாக சரிபார்க்கலாம்.'
  },
  {
    id: 'doc-2',
    category: 'documents',
    questionEn: 'What is an Encumbrance Certificate (EC / Villangam) and why is it mandatory?',
    questionTa: 'வில்லங்கச் சான்றிதழ் (EC) என்றால் என்ன, அது ஏன் மிக முக்கியமானது?',
    answerEn: 'An Encumbrance Certificate (EC) proves that a land is free from mortgages, legal claims, liens, or disputed sales. It is strongly recommended to check the EC for at least the past 30 years before purchasing any land parcel.',
    answerTa: 'வில்லங்கச் சான்றிதழ் (EC) என்பது நிலத்தின் மீது எந்தவித அடமானம், நீதிமன்ற வழக்குகள் அல்லது விற்கப்படாத சொத்துரிமை நிலுவைகள் இல்லை என்பதை உறுதிப்படுத்துகிறது. நிலம் வாங்குவதற்கு முன் குறைந்தது கடந்த 30 ஆண்டுகளுக்கான வில்லங்கத்தை சரிபார்ப்பது கட்டாயமாகும்.'
  },
  {
    id: 'buy-1',
    category: 'buying',
    questionEn: 'How do I schedule a physical site visit with the seller?',
    questionTa: 'விற்பனையாளருடன் நேரடி நில ஆய்வு வருகையை (Site Visit) எவ்வாறு திட்டமிடுவது?',
    answerEn: 'Click on any property card to view the property details page. You will see a "Schedule Site Visit" button. Pick your preferred date, time, and attendees, and submit. The seller will receive an instant notification and confirm the appointment.',
    answerTa: 'எந்தவொரு சொத்து விவரப் பக்கத்திலும் உள்ள "Site Visit திட்டமிடுக" பொத்தானைக் கிளிக் செய்யவும். நீங்கள் விரும்பும் தேதி மற்றும் நேரத்தைத் தேர்வுசெய்து சமர்ப்பிக்கவும். விற்பனையாளருக்கு உடனடியாக தகவல் சென்று வருகை உறுதிசெய்யப்படும்.'
  },
  {
    id: 'sell-1',
    category: 'selling',
    questionEn: 'How long does it take for my property listing to get verified and published?',
    questionTa: 'நான் பதிவேற்றிய நிலம் சரிபார்க்கப்பட்டு வெளியிடப்பட எவ்வளவு நேரம் ஆகும்?',
    answerEn: 'Listings submitted with valid Patta, EC, and survey numbers are verified by our team within 12 to 24 hours. Once verified, a green "Verified" badge is assigned to boost buyer confidence.',
    answerTa: 'சரியான பட்டா, வில்லங்கச் சான்று மற்றும் புல எண்ணுடன் சமர்ப்பிக்கப்பட்ட பதிவுகள் எங்கள் ஆய்வுக் குழுவால் 12 முதல் 24 மணி நேரத்திற்குள் சரிபார்க்கப்படும். சரிபார்க்கப்பட்டவுடன் பச்சை நிற "Verified" முத்திரை வழங்கப்படும்.'
  },
  {
    id: 'safety-1',
    category: 'safety',
    questionEn: 'What should I do if a seller demands token advance payment before seeing documents?',
    questionTa: 'ஆவணங்களைக் காண்பிக்கும் முன் விற்பனையாளர் முன்பணம் (Token Advance) கேட்டால் என்ன செய்வது?',
    answerEn: 'NEVER transfer money or token advances without inspecting original legal title deeds, checking the Encumbrance Certificate, and physically inspecting the boundary stones. Always consult a certified legal advocate.',
    answerTa: 'அசல் ஆவணங்கள், வில்லங்கச் சான்று மற்றும் நிலத்தின் எல்லைக் கற்களை நேரில் ஆய்வு செய்யாமல் ஒருபோதும் எந்த முன்பணமும் கொடுக்க வேண்டாம். வழக்கறிஞரிடம் சட்ட ஆலோசனை பெற்ற பிறகே முன்பணம் தர வேண்டும்.'
  },
  {
    id: 'acc-1',
    category: 'account',
    questionEn: 'How can I change my 4-digit login PIN or update my phone number?',
    questionTa: 'எனது 4-இலக்க உள்நுழைவு PIN-ஐ மாற்றுவது அல்லது கைபேசி எண்ணைப் புதுப்பிப்பது எப்படி?',
    answerEn: 'Go to Settings > Security & 4-Digit PIN. Enter your new 4-digit PIN, confirm it, and click Update. Your PIN will immediately be synced across web and mobile sessions.',
    answerTa: 'அமைப்புகள் (Settings) > பாதுகாப்பு & 4-இலக்க PIN பகுதிக்குச் செல்லவும். உங்கள் புதிய 4-இலக்க PIN-ஐ உள்ளிட்டு "PIN மாற்றவும்" பொத்தானை அழுத்தவும்.'
  }
];

export default function Help() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('doc-1');

  const categories = [
    { id: 'all', labelEn: 'All Topics', labelTa: 'அனைத்தும்' },
    { id: 'documents', labelEn: 'Patta & Documents', labelTa: 'பட்டா & ஆவணங்கள்' },
    { id: 'buying', labelEn: 'Buying & Site Visits', labelTa: 'வாங்குதல் & பார்வை' },
    { id: 'selling', labelEn: 'Selling & Listing', labelTa: 'விற்பனை & பதிவுகள்' },
    { id: 'safety', labelEn: 'Safety & Scams', labelTa: 'பாதுகாப்பு & மோசடி தடுப்பு' },
    { id: 'account', labelEn: 'Account & PIN', labelTa: 'கணக்கு & PIN' },
  ];

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      faq.questionEn.toLowerCase().includes(query) ||
      faq.questionTa.toLowerCase().includes(query) ||
      faq.answerEn.toLowerCase().includes(query) ||
      faq.answerTa.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={styles.container}>
      {/* Hero with Search */}
      <div className={styles.hero}>
        <div style={{ display: 'inline-flex', padding: '10px', background: 'var(--color-surface)', borderRadius: '50%', marginBottom: 'var(--spacing-3)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <HelpCircle size={32} color="var(--color-primary)" />
        </div>
        <h1 className={styles.title}>
          {language === 'ta' ? 'உதவி மையம் & அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Help & Customer Support Center'}
        </h1>
        <p className={styles.subtitle}>
          {language === 'ta' 
            ? 'நிலம் வாங்குதல், விற்பனை, ஆவண சரிபார்ப்பு மற்றும் சட்டப் பாதுகாப்பு பற்றிய உங்கள் சந்தேகங்களுக்கான பதில்கள்' 
            : 'Find answers about land buying, listing, Patta/EC verification, legal guidelines, and safety practices.'}
        </p>

        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={language === 'ta' ? 'கேள்வி அல்லது தலைப்பைத் தேடுங்கள் (எ.கா. பட்டா, EC)...' : 'Search questions, Patta, EC, safety tips...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Direct Contact Channels */}
      <div className={styles.channelGrid}>
        <a 
          href="https://wa.me/919876543210?text=Hello%2C%20I%20need%20help%20with%20Land%20Selling%20App" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.channelCard}
        >
          <div className={styles.channelIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <MessageCircle size={26} />
          </div>
          <div className={styles.channelTitle}>WhatsApp Support</div>
          <div className={styles.channelSubtitle}>
            {language === 'ta' ? 'உடனடி நேரலை அரட்டை' : 'Instant live chat with support team'}
          </div>
        </a>

        <a href="tel:+919876543210" className={styles.channelCard}>
          <div className={styles.channelIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <PhoneCall size={26} />
          </div>
          <div className={styles.channelTitle}>+91 98765 43210</div>
          <div className={styles.channelSubtitle}>
            {language === 'ta' ? 'காலை 9 மணி முதல் இரவு 8 மணி வரை' : 'Toll-free (Mon - Sat, 9 AM - 8 PM)'}
          </div>
        </a>

        <a href="mailto:support@landsellingapp.com" className={styles.channelCard}>
          <div className={styles.channelIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <Mail size={26} />
          </div>
          <div className={styles.channelTitle}>support@landsellingapp.com</div>
          <div className={styles.channelSubtitle}>
            {language === 'ta' ? '24 மணி நேரத்திற்குள் பதில்' : 'Email support, response within 24h'}
          </div>
        </a>
      </div>

      {/* Category Filter Pills */}
      <div className={styles.categoryPills}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.pill} ${selectedCategory === cat.id ? styles.pillActive : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {language === 'ta' ? cat.labelTa : cat.labelEn}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className={styles.faqList}>
        {filteredFaqs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-10)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {language === 'ta' ? 'பொருந்தக்கூடிய கேள்விகள் எதுவும் கிடைக்கவில்லை.' : 'No matching questions found. Try a different search term.'}
            </p>
          </div>
        ) : (
          filteredFaqs.map(faq => (
            <div key={faq.id} className={styles.faqItem}>
              <div className={styles.faqQuestion} onClick={() => toggleExpand(faq.id)}>
                <span>{language === 'ta' ? faq.questionTa : faq.questionEn}</span>
                {expandedId === faq.id ? <ChevronUp size={20} color="var(--color-primary)" /> : <ChevronDown size={20} />}
              </div>
              {expandedId === faq.id && (
                <div className={styles.faqAnswer}>
                  {language === 'ta' ? faq.answerTa : faq.answerEn}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Fraud Emergency Assistance Banner */}
      <div className={styles.emergencyBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <ShieldAlert size={28} color="var(--color-error)" />
          <div>
            <strong style={{ color: 'var(--color-error-text)', display: 'block' }}>
              {language === 'ta' ? 'சந்தேகத்திற்கிடமான விளம்பரத்தை புகாரளிக்க வேண்டுமா?' : 'Notice a suspicious listing or document fraud?'}
            </strong>
            <span style={{ fontSize: 'var(--font-size-sm)', color: '#991b1b' }}>
              {language === 'ta' ? 'எங்கள் பாதுகாப்பு குழு உடனடியாக நடவடிக்கை எடுக்கும்.' : 'Our legal fraud detection cell will investigate within 2 hours.'}
            </span>
          </div>
        </div>
        <Link to="/safety">
          <Button variant="outline" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
            <FileCheck2 size={16} style={{ marginRight: '6px' }} />
            {language === 'ta' ? 'பாதுகாப்பு வழிகாட்டியைப் பார்க்க' : 'Safety Guide & Legal Tips'}
          </Button>
        </Link>
      </div>
    </div>
  );
}

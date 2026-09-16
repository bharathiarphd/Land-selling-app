import { EmptyState } from '../components/EmptyState';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Favorites() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-4)' }}>
      <h1 className="h2" style={{ marginBottom: 'var(--spacing-4)' }}>{t('header.saved')}</h1>
      <EmptyState 
        title={language === 'ta' ? 'சேமிக்கப்பட்ட சொத்துகள் இல்லை' : "No saved properties"} 
        description={language === 'ta' ? 'நீங்கள் சேமிக்கும் சொத்துகள் இங்கு தோன்றும்.' : "Properties you favorite will appear here."}
        icon={<Heart size={48} color="var(--color-text-muted)" />}
        actionText={language === 'ta' ? 'சொத்துகளை உலாவு' : "Browse Properties"}
        onAction={() => navigate('/')}
      />
    </div>
  );
}

import { Phone, MessageCircle, Mail, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import styles from './SellerCard.module.css';

interface SellerCardProps {
  seller: {
    name: string;
    type: string;
  };
  onEnquireClick: () => void;
}

export function SellerCard({ seller, onEnquireClick }: SellerCardProps) {
  const initials = seller.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={styles.sellerCard}>
      <div className={styles.sellerHeader}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.sellerInfo}>
          <div className={styles.sellerName}>
            {seller.name}
            <span className={styles.badge}><ShieldCheck size={12} /> Verified</span>
          </div>
          <div className={styles.sellerType}>{seller.type}</div>
        </div>
      </div>
      
      <div className={styles.actions}>
        <Button className={styles.actionBtn} onClick={onEnquireClick}>
          <Mail size={18} style={{ marginRight: '8px' }} /> Send Enquiry
        </Button>
        <div className={styles.actionRow}>
          <Button variant="outline" className={styles.actionBtn}>
            <Phone size={18} style={{ marginRight: '8px' }} /> Call
          </Button>
          <Button variant="outline" className={styles.actionBtn} style={{ color: '#25D366', borderColor: '#25D366' }}>
            <MessageCircle size={18} style={{ marginRight: '8px' }} /> WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import styles from './PWAInstallPrompt.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if dismissed recently (within 3 days)
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);

    if (isIosDevice && isSafari) {
      setIsIOS(true);
      // Give the user a moment to browse before showing the banner
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Handle Chromium / Android / Desktop beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Give the user a moment to browse before showing the banner
      setTimeout(() => setShowBanner(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSModal(false);
    localStorage.setItem('pwa_prompt_dismissed', String(Date.now()));
  };

  if (!showBanner) return null;

  return (
    <>
      <div className={styles.banner} role="region" aria-label="Install App">
        <div className={styles.left}>
          <img 
            src="/icon-192.png" 
            alt="Land Selling App Logo" 
            className={styles.appIcon} 
          />
          <div className={styles.info}>
            <span className={styles.title}>Install Land App</span>
            <span className={styles.desc}>Faster access & works offline</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleInstallClick} 
            className={styles.installBtn}
            aria-label="Install application"
            id="pwa-install-btn"
          >
            <Download size={15} />
            <span>Install</span>
          </button>
          <button 
            onClick={handleDismiss} 
            className={styles.closeBtn}
            aria-label="Close install prompt"
            id="pwa-dismiss-btn"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div className={styles.modalOverlay} onClick={() => setShowIOSModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Install on iPhone / iPad</h3>
              <button 
                onClick={() => setShowIOSModal(false)} 
                className={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.stepItem}>
              <span className={styles.stepNumber}>1</span>
              <span>Tap the <strong>Share</strong> button <Share size={16} style={{ verticalAlign: 'middle', margin: '0 4px', display: 'inline' }} /> at the bottom of Safari.</span>
            </div>

            <div className={styles.stepItem}>
              <span className={styles.stepNumber}>2</span>
              <span>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare size={16} style={{ verticalAlign: 'middle', margin: '0 4px', display: 'inline' }} />.</span>
            </div>

            <div className={styles.stepItem}>
              <span className={styles.stepNumber}>3</span>
              <span>Tap <strong>Add</strong> in the top-right corner to finish installing.</span>
            </div>

            <button 
              className={styles.okBtn} 
              onClick={handleDismiss}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

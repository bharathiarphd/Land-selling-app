import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { communicationUtils } from '../utils/communicationUtils';
import type { Conversation, Message } from '../types/communication';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { t, language } = useLanguage();

  const loadConversations = async () => {
    if (!user) return;
    const convos = await communicationUtils.getConversations(user.id);
    setConversations(convos);
  };

  const loadMessages = async (convoId: string) => {
    setIsLoading(true);
    const msgs = await communicationUtils.getMessages(convoId);
    setMessages(msgs);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConvo) {
      loadMessages(activeConvo.id);
    }
  }, [activeConvo]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo || !user) return;

    setIsSending(true);
    try {
      const msg = await communicationUtils.sendMessage(activeConvo.id, user.id, newMessage);
      setMessages([...messages, msg]);
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-6) var(--spacing-4)', display: 'flex', height: 'calc(100vh - 140px)', gap: 'var(--spacing-4)' }}>
      {/* Conversations List Pane */}
      <div style={{ width: '300px', borderRight: '1px solid var(--color-border)', display: activeConvo ? 'none' : 'block' }}>
        <h2 className="h3" style={{ marginBottom: 'var(--spacing-4)' }}>{t('header.messages')}</h2>
        {conversations.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>{language === 'ta' ? 'இன்னும் உரையாடல்கள் ஏதுமில்லை.' : 'No conversations yet.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {conversations.map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveConvo(c)}
                style={{ textAlign: 'left', padding: 'var(--spacing-3)', backgroundColor: activeConvo?.id === c.id ? 'var(--color-primary-light)' : 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              >
                <div style={{ fontWeight: 'var(--font-weight-bold)' }}>{c.propertyTitle}</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }} className="truncate">
                  {c.lastMessage?.text || (language === 'ta' ? 'செய்திகள் இல்லை' : 'No messages')}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        {activeConvo ? (
          <>
            <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              {/* Back button for mobile */}
              <button onClick={() => setActiveConvo(null)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'block' }}>
                &larr; {t('common.back')}
              </button>
              <div style={{ fontWeight: 'var(--font-weight-bold)' }}>{activeConvo.propertyTitle}</div>
            </div>
            
            <div style={{ flex: 1, padding: 'var(--spacing-4)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>{language === 'ta' ? 'ஏற்றப்படுகிறது...' : 'Loading...'}</div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: 'auto' }}>{language === 'ta' ? 'வணக்கம் சொல்லுங்கள்!' : 'Say hello!'}</div>
              ) : (
                messages.map(m => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', backgroundColor: isMe ? 'var(--color-primary)' : '#f3f4f6', color: isMe ? '#fff' : 'var(--color-text)', padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 'var(--radius-lg)' }}>
                      {m.text}
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} style={{ padding: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--spacing-2)' }}>
              <div style={{ flex: 1 }}>
                <Input 
                  placeholder={language === 'ta' ? 'செய்தியை உள்ளிடுக...' : 'Type a message...'} 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
              </div>
              <Button type="submit" disabled={isSending || !newMessage.trim()}>
                <Send size={18} />
              </Button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            {language === 'ta' ? 'உரையாடலைத் தொடங்க ஒரு செய்தியைத் தேர்ந்தெடுக்கவும்' : 'Select a conversation to start chatting'}
          </div>
        )}
      </div>
      
      {/* Basic media query mock via inline CSS for mobile layout hiding logic */}
      <style>{`
        @media (min-width: 768px) {
          div[style*="width: 300px"] { display: block !important; }
        }
      `}</style>
    </div>
  );
}

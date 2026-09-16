import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { communicationUtils } from '../utils/communicationUtils';
import type { Notification } from '../types/communication';
import { Bell } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user?.id) {
      communicationUtils.getNotifications(user.id).then(setNotifications);
    }
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await communicationUtils.markNotificationRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)', maxWidth: '600px' }}>
      <h1 className="h2" style={{ marginBottom: 'var(--spacing-6)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <Bell /> Notifications
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-muted)' }}>
            No notifications yet.
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              style={{ 
                padding: 'var(--spacing-4)', 
                backgroundColor: n.read ? 'var(--color-surface)' : 'var(--color-primary-light)', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--color-border)',
                cursor: 'pointer'
              }}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-1)' }}>{n.title}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{n.body}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                {new Date(n.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

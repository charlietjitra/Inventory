import { useEffect, useState } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/config/firebaseConfig';
import styled from 'styled-components';

// Toast notification styles
const ToastContainer = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 80px;
  right: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  max-width: 400px;
  z-index: 9999;
  transform: translateX(${props => props.$visible ? '0' : '100%'});
  transition: transform 0.3s ease;

  @media (max-width: 480px) {
    left: 20px;
    right: 20px;
    max-width: none;
  }
`;

const ToastTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToastBody = styled.div`
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  
  &:hover {
    color: #374151;
  }
`;

interface NotificationToast {
  id: string;
  title: string;
  body: string;
  visible: boolean;
}

let toastCounter = 0;

// Global toast manager
class ToastManager {
  private toasts: Map<string, NotificationToast> = new Map();
  private listeners: Set<(toasts: NotificationToast[]) => void> = new Set();

  showToast(title: string, body: string) {
    const id = `toast-${++toastCounter}`;
    const toast: NotificationToast = { id, title, body, visible: true };
    
    this.toasts.set(id, toast);
    this.notifyListeners();

    // Auto hide after 5 seconds
    setTimeout(() => {
      this.hideToast(id);
    }, 5000);
  }

  hideToast(id: string) {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.visible = false;
      this.notifyListeners();
      
      // Remove after animation
      setTimeout(() => {
        this.toasts.delete(id);
        this.notifyListeners();
      }, 300);
    }
  }

  subscribe(listener: (toasts: NotificationToast[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const toastArray = Array.from(this.toasts.values());
    this.listeners.forEach(listener => listener(toastArray));
  }
}

const toastManager = new ToastManager();

// Toast display component
export function NotificationToasts() {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  return (
    <>
      {toasts.map(toast => (
        <ToastContainer key={toast.id} $visible={toast.visible}>
          <CloseButton onClick={() => toastManager.hideToast(toast.id)}>
            ×
          </CloseButton>
          <ToastTitle>{toast.title}</ToastTitle>
          <ToastBody>{toast.body}</ToastBody>
        </ToastContainer>
      ))}
    </>
  );
}

// Foreground message handler component
export default function ForegroundMessageHandler() {
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || 'You have a new notification';
      
      // Show toast notification
      toastManager.showToast(title, body);
      
      // You can also show browser notification if needed
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon-192x192.png',
          tag: 'foreground-notification'
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return null; // This component doesn't render anything visible
}
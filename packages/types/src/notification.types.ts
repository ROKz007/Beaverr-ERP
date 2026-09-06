export interface Notification {
  id: string;
  societyId: string;
  userId: string;
  category: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  email: boolean;
  inApp: boolean;
}

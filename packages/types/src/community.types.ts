export interface Event {
  id: string;
  societyId: string;
  title: string;
  description: string;
  category: string;
  startAt: string;
  endAt: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  rsvpCount?: number;
  myHeadcount?: number | null;
}

export interface Announcement {
  id: string;
  societyId: string;
  title: string;
  body: string;
  isCritical: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
  readCount?: number;
}

export interface Document {
  id: string;
  societyId: string;
  title: string;
  url: string;
  category: string;
  uploadedByUserId: string;
  createdAt: string;
}

export type ForumCategory = "FOR_SALE" | "LOST_FOUND" | "CARPOOL" | "RECOMMENDATIONS" | "GENERAL";

export interface ForumReply {
  id: string;
  threadId: string;
  body: string;
  authorUserId: string;
  isRemoved: boolean;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  societyId: string;
  category: ForumCategory;
  title: string;
  body: string;
  authorUserId: string;
  isFlagged: boolean;
  isRemoved: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: ForumReply[];
  replyCount?: number;
}

export interface FeatureFlags {
  FEATURE_VISITOR_MANAGEMENT: boolean;
  FEATURE_MARKETPLACE: boolean;
  FEATURE_AI_PREDICTIONS: boolean;
  FEATURE_PAYMENTS: boolean;
  FEATURE_FORUM: boolean;
  FEATURE_EMERGENCY_SOS: boolean;
  FEATURE_EVENTS: boolean;
  FEATURE_DOCUMENTS: boolean;
}

export interface Society {
  id: string;
  name: string;
  code: string;
  address: string;
  isRestrictedEntry: boolean;
  subscriptionPlan: string;
  features: FeatureFlags;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  societyId: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  workingHours: string | null;
}

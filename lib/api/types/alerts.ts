// -- Alert Types --------------------------------------------------------------

export type AlertStatus = "PENDING" | "SENT" | "FAILED";

// -- Category -----------------------------------------------------------------

export type AlertCategory = {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
};

// -- Subscription -------------------------------------------------------------

export type AlertSubscription = {
  id: string;
  email: string;
  categories: AlertCategory[];
  is_confirmed: boolean;
  confirmed_at: string | null;
  operator_filter: string;
  is_active: boolean;
  created_at: string;
};

// -- Alert Log ----------------------------------------------------------------

export type AlertLog = {
  id: string;
  subscription: string;
  subscription_email: string;
  category: string;
  category_name: string;
  category_code: string;
  subject: string;
  body_preview: string;
  related_object_type: string;
  related_object_id: string | null;
  status: AlertStatus;
  sent_at: string | null;
  error_message: string;
  created_at: string;
};

export type AlertLogParams = {
  category?: string;
  status?: AlertStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

// -- Stats --------------------------------------------------------------------

export type AlertStats = {
  days: number;
  subscriptions: {
    total: number;
    confirmed: number;
    active: number;
    recent_signups: number;
  };
  by_category: {
    code: string;
    name: string;
    active_subscribers: number;
  }[];
  delivery: {
    total_sent: number;
    total_failed: number;
    total_pending: number;
    by_category: {
      category__code: string;
      category__name: string;
      total: number;
      sent: number;
      failed: number;
    }[];
  };
};

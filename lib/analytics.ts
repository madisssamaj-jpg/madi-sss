export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Log page views
export function pageview(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag && GA_MEASUREMENT_ID) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

// Log specific events (form submissions, button clicks, downloads)
export interface GTagEvent {
  action: string;
  category: string;
  label: string;
  value?: number;
}

export function event({ action, category, label, value }: GTagEvent) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Convenient custom tracking functions
export function trackMembershipSubmit(membershipType: string) {
  event({
    action: 'submit_membership_application',
    category: 'Membership',
    label: membershipType,
  });
}

export function trackFeedbackSubmit(category: string) {
  event({
    action: 'submit_feedback',
    category: 'Feedback',
    label: category,
  });
}

export function trackCtaClick(buttonName: string, destination: string) {
  event({
    action: 'click_cta',
    category: 'Engagement',
    label: `${buttonName} -> ${destination}`,
  });
}

export function trackDocumentDownload(documentName: string) {
  event({
    action: 'download_document',
    category: 'Document',
    label: documentName,
  });
}

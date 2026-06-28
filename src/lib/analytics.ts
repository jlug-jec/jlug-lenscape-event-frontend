type GtagCommand = 'js' | 'config' | 'event';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, target: string | Date, params?: Record<string, unknown>) => void;
    __lenscapeAnalyticsInitialized?: boolean;
  }
}

const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.VITE_GTAG_ID;

function canTrack() {
  return typeof window !== 'undefined' && Boolean(GA_MEASUREMENT_ID);
}

export function initAnalytics() {
  if (!canTrack() || window.__lenscapeAnalyticsInitialized) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(command, target, params) {
    window.dataLayer?.push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  window.__lenscapeAnalyticsInitialized = true;
}

export function trackPageView(path: string) {
  if (!canTrack()) return;

  initAnalytics();
  window.gtag?.('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
  });
}

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

function pageTitleForPath(path: string) {
  const pathname = path.split(/[?#]/)[0] || '/';
  const titles: Record<string, string> = {
    '/': 'Lenscape | Home',
    '/gallery': 'Lenscape | Gallery',
    '/submit': 'Lenscape | Submit Artwork',
    '/profile': 'Lenscape | Profile',
    '/profile/setup': 'Lenscape | Profile Setup',
    '/auth/login': 'Lenscape | Login',
    '/auth/signup': 'Lenscape | Sign Up',
    '/admin': 'Lenscape | Admin',
    '/admin/login': 'Lenscape | Admin Login',
    '/admin/signup': 'Lenscape | Admin Sign Up',
  };

  return titles[pathname] || 'Lenscape | Digital Art Exhibition';
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
    page_title: pageTitleForPath(path),
    page_location: window.location.href,
    page_path: path,
  });
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!canTrack()) return;

  initAnalytics();
  window.gtag?.('event', name, params);
}

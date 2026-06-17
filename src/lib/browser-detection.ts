/**
 * Detects if the app is running in Instagram's in-app browser
 */
export const isInstagramBrowser = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

  // Instagram's in-app browser user agents
  const instagramBrowserPatterns = [
    /Instagram/i,
    /\bIG\b/i, // Just "IG"
    /instagram-android/i,
    /instagram-iphone/i,
  ]

  return instagramBrowserPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Detects if the app is in an in-app browser (Instagram, Facebook, etc.)
 */
export const isInAppBrowser = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

  const inAppBrowserPatterns = [
    /Instagram/i,
    /Facebook/i,
    /FBAN|FBAV/i, // Facebook for Android/iPhone
    /WhatsApp/i,
    /Telegram/i,
    /TikTok/i,
    /LinkedIn/i,
    /twitter-iphone|twitter-android/i,
  ]

  return inAppBrowserPatterns.some(pattern => pattern.test(userAgent))
}

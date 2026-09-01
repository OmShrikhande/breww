/**
 * Referral & Public Vercel App Domain Resolution
 */
export const getPublicAppOrigin = () => {
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // When running in local preview or dev, always show the clean live Vercel production frontend link
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return 'https://breeww.vercel.app';
    }
    return window.location.origin;
  }
  return 'https://breeww.vercel.app';
};

/**
 * Returns formatted referral link for a player
 */
export const getReferralUrl = (inviteCode) => {
  const origin = getPublicAppOrigin();
  const code = (inviteCode || 'BW9928').trim();
  return `${origin}/register?code=${encodeURIComponent(code)}`;
};

/**
 * Returns a live scannable QR Code image URL for any text or link
 */
export const getQrCodeImageUrl = (data, size = 300) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(data)}`;
};

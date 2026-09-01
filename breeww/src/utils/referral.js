/**
 * Referral & Public Vercel App Domain Resolution
 */
export const getPublicAppOrigin = () => {
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
};

/**
 * Returns formatted referral link for a player matching the current host/Vercel domain
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

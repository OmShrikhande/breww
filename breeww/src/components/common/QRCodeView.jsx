import React, { useState } from 'react';
import { Download, QrCode, Sparkles, CheckCheck, Loader2 } from 'lucide-react';
import { getQrCodeImageUrl } from '../../utils/referral';

const QRCodeView = ({
  value,
  size = 220,
  logoText = 'BW',
  showDownload = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const qrUrl = getQrCodeImageUrl(value, size * 2);
  const fallbackQrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size * 2}x${size * 2}&chl=${encodeURIComponent(value)}&chld=M|2`;

  const handleDownload = async () => {
    try {
      const res = await fetch(error ? fallbackQrUrl : qrUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `breeww-qr-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {
      window.open(qrUrl, '_blank');
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QR Code Container Box */}
      <div 
        className="relative bg-white p-3 rounded-2xl shadow-xl border-2 border-amber-400 flex items-center justify-center overflow-hidden"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 size={24} className="text-amber-500 animate-spin" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Generating QR...
            </span>
          </div>
        )}

        {/* Real QR Code Image */}
        <img
          src={error ? fallbackQrUrl : qrUrl}
          alt={`QR Code for ${value}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            if (!error) {
              setError(true);
            } else {
              setLoading(false);
            }
          }}
          className="w-full h-full object-contain rounded-lg"
        />

        {/* Center Brand Badge */}
        {!loading && (
          <div className="absolute inset-0 m-auto w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md flex items-center justify-center font-black text-red-950 text-[10px] tracking-tight pointer-events-none">
            {logoText}
          </div>
        )}
      </div>

      {/* Download Button */}
      {showDownload && (
        <button
          type="button"
          onClick={handleDownload}
          className="mt-3 px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          {downloaded ? (
            <>
              <CheckCheck size={14} className="text-emerald-400" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Save QR Image</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default QRCodeView;

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { goBackOr, pageHref } from '../../lib/navigation';

const AuthShell = ({
  title,
  subtitle,
  icon,
  sectionTitle,
  altPrompt,
  altLinkLabel,
  altLinkTo,
  children,
}) => {
  const IconComponent = icon;

  return (
    <div className="min-h-screen bg-[#11172f] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#242b63] text-white shadow-2xl border-x border-white/5">
        <div className="px-6 pt-5 pb-8 bg-[linear-gradient(180deg,#353a7f_0%,#2b3170_100%)]">
          <button
            type="button"
            onClick={() => goBackOr('/')}
            className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="mb-6 text-center">
            <a
              href="/"
              className="inline-flex text-[2.2rem] font-black italic tracking-[-0.08em] text-white"
            >
              <span className="text-[#35d7ff]">B</span>reeww
            </a>
          </div>

          <div>
            <h1 className="text-[1.9rem] font-extrabold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-blue-100/90">{subtitle}</p>
          </div>
        </div>

        <div className="px-7 py-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#419cff]/20 text-[#58acff] shadow-[0_14px_30px_rgba(31,105,255,0.18)]">
              <IconComponent size={22} strokeWidth={2.3} />
            </div>
            <h2 className="text-2xl font-bold text-[#63b3ff]">{sectionTitle}</h2>
          </div>

          <div className="space-y-5">{children}</div>

          <div className="mt-10">
            <a
              href={pageHref(altLinkTo)}
              className="flex h-14 w-full items-center justify-center rounded-full border border-[#5caeff] bg-transparent px-5 text-center text-sm font-medium tracking-[0.32em] text-blue-50 transition hover:bg-[#5caeff]/10"
            >
              <span className="mr-2 text-white/70 tracking-[0.18em] normal-case">{altPrompt}</span>
              <span className="text-lg font-bold tracking-[0.18em] text-[#5caeff]">{altLinkLabel}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;

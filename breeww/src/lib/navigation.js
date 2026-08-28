export const normalizePath = (pathname = '/') => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
};

export const pageHref = (path = '/') => {
  const normalized = normalizePath(path);
  return normalized === '/' ? '/' : `${normalized}/`;
};

export const isCurrentPath = (path, pathname = window.location.pathname) => {
  return normalizePath(pathname) === normalizePath(path);
};

export const navigateTo = (path) => {
  window.location.assign(pageHref(path));
};

export const goBackOr = (fallback = '/') => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo(fallback);
};

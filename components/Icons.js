const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const SunIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const MoonIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
export const PlusIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const TrashIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
);
export const SendIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
);
export const StopIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><rect x="6" y="6" width="12" height="12" rx="3" /></svg>
);
export const MenuIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);
export const LogoutIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
);
export const GoogleIcon = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.32 2.98-7.34z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22z" />
    <path fill="#FBBC05" d="M6.41 13.91a6 6 0 0 1 0-3.82V7.51H3.06a10 10 0 0 0 0 8.98l3.35-2.58z" />
    <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.99 14.7 2 12 2A10 10 0 0 0 3.06 7.51l3.35 2.58C7.2 7.73 9.4 5.97 12 5.97z" />
  </svg>
);
export const AppleIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M16.37 12.6c-.03-2.7 2.2-4 2.3-4.06-1.26-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.98-4.08.98-.85 0-2.15-.96-3.53-.93-1.82.03-3.5 1.06-4.43 2.69-1.9 3.28-.49 8.13 1.36 10.8.9 1.3 1.98 2.77 3.4 2.72 1.36-.05 1.88-.88 3.53-.88 1.65 0 2.11.88 3.55.85 1.46-.03 2.4-1.33 3.29-2.64 1.04-1.51 1.46-2.98 1.49-3.05-.03-.01-2.85-1.09-2.88-4.33zM13.7 4.6c.75-.9 1.25-2.16 1.11-3.4-1.08.04-2.38.72-3.15 1.62-.69.8-1.3 2.08-1.14 3.3 1.2.1 2.43-.61 3.18-1.52z" />
  </svg>
);

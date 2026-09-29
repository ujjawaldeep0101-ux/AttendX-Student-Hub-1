import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const moveTo = (to: string) => {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={moveTo}
      routerReplace={(to) => {
        window.history.replaceState({}, '', to);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
      appearance={{
        variables: {
          colorPrimary: '#1575d1',
          colorForeground: '#17243b',
          colorMutedForeground: '#63718a',
          colorBackground: '#ffffff',
          colorInput: '#f4f7fb',
          colorInputForeground: '#17243b',
          colorNeutral: '#d9e1ec',
          fontFamily: 'Plus Jakarta Sans, ui-sans-serif, sans-serif',
          borderRadius: '0.85rem',
        },
        elements: {
          rootBox: 'w-full flex justify-center',
          cardBox: 'bg-white rounded-[26px] w-[440px] max-w-full overflow-hidden shadow-2xl',
          card: '!shadow-none !border-0 !bg-transparent !rounded-none',
          footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
          headerTitle: 'text-slate-900 font-extrabold',
          headerSubtitle: 'text-slate-500',
          socialButtonsBlockButtonText: 'text-slate-700 font-bold',
          formFieldLabel: 'text-slate-700 font-bold',
          footerActionLink: 'text-[#1575d1] font-bold',
          footerActionText: 'text-slate-500',
          dividerText: 'text-slate-500',
          logoBox: 'mb-3',
          logoImage: 'h-10 w-10',
          socialButtonsBlockButton: 'border-slate-200 bg-slate-50 hover:bg-blue-50',
          formButtonPrimary: 'bg-[#1575d1] hover:bg-[#0e5fae] font-extrabold',
          formFieldInput: 'border-slate-200 bg-slate-50 text-slate-900',
          footerAction: 'bg-transparent',
          dividerLine: 'bg-slate-200',
          alert: 'border-rose-200 bg-rose-50',
          alertText: 'text-rose-700',
          formFieldSuccessText: 'text-emerald-700',
          identityPreviewEditButton: 'text-[#1575d1]',
          otpCodeFieldInput: 'border-slate-200 bg-slate-50',
          formFieldRow: 'mb-4',
          main: 'p-6 sm:p-8',
        },
        options: {
          logoPlacement: 'inside',
          logoLinkUrl: basePath || '/',
          logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
          socialButtonsPlacement: 'top',
          socialButtonsVariant: 'blockButton',
        },
      }}
      localization={{
        signIn: {
          start: {
            title: 'Welcome back',
            subtitle: 'Sign in to manage AttendX developers',
          },
        },
        signUp: {
          start: {
            title: 'Create your AttendX account',
            subtitle: 'Sign up to access developer management',
          },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </ErrorBoundary>,
);

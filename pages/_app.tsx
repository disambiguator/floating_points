import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

// https://johnkueh.com/articles/adding-a-use-analytics-hook

function MyApp({ Component, pageProps }: AppProps) {
  const { init, trackPageViewed } = useAnalytics();
  const router = useRouter();
  React.useEffect(() => {
    init('UA-168065998-1');
    trackPageViewed();
    router.events.on('routeChangeComplete', () => {
      trackPageViewed();
    });
  }, [router, init, trackPageViewed]);

  return <Component {...pageProps} />;
}

export default MyApp;

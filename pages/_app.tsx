import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import 'react-dat-gui/dist/index.css';
import Router from 'next/router';
import { useAnalytics } from '../hooks/useAnalytics';

// https://johnkueh.com/articles/adding-a-use-analytics-hook

function MyApp({ Component, pageProps }: AppProps) {
  const { init, trackPageViewed } = useAnalytics();
  useEffect(() => {
    init('UA-168065998-1');
    trackPageViewed();
    Router.events.on('routeChangeComplete', () => {
      trackPageViewed();
    });
  }, [init, trackPageViewed]);

  return <Component {...pageProps} />;
}

export default MyApp;

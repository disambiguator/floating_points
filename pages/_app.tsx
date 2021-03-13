import { AppProps } from 'next/app';
import Router from 'next/router';
import React, { useEffect } from 'react';
import 'react-dat-gui/dist/index.css';
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

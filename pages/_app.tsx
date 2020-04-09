import React from 'react';
import { AppProps } from 'next/app';
import 'react-dat-gui/dist/index.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;

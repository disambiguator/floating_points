import React from 'react';
import dynamic from 'next/dynamic';

export default function Matt() {
  const Dusen = dynamic(() => import('../components/httf'), {
    ssr: false,
  });
  return <Dusen />;
}

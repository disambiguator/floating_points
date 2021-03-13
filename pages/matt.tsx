import dynamic from 'next/dynamic';
import React from 'react';

export default function Matt() {
  const Dusen = dynamic(() => import('../components/httf'), {
    ssr: false,
  });
  return <Dusen />;
}

import React from 'react';
import dynamic from 'next/dynamic';

export default function Bars() {
  const Dusen = dynamic(() => import('../components/bars'), { ssr: false });
  return <Dusen />;
}

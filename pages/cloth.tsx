import React from 'react';
import dynamic from 'next/dynamic';

export default function ClothPage() {
  const Dusen = dynamic(() => import('../components/cloth'), { ssr: false });
  return <Dusen />;
}

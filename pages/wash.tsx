import dynamic from 'next/dynamic';
import React from 'react';

export default function Wash() {
  const Spiro = dynamic(() => import('../components/wash'), { ssr: false });

  return <Spiro />;
}

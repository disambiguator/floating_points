import dynamic from 'next/dynamic';
import React from 'react';

export default function SortPage() {
  const Spiro = dynamic(() => import('../components/sort'), { ssr: false });

  return <Spiro />;
}

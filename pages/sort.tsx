import React from 'react';
import dynamic from 'next/dynamic';

export default function SortPage() {
  const Spiro = dynamic(() => import('../components/sort'), { ssr: false });

  return <Spiro />;
}

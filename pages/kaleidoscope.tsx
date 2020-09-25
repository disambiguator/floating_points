import React from 'react';
import dynamic from 'next/dynamic';

export default function Kaleidoscope() {
  const Chaos = dynamic(() => import('../components/geometric_chaos'), {
    ssr: false,
  });
  return <Chaos />;
}

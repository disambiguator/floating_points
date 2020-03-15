import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Spiro: any = dynamic(() => import('../components/bendy') as any, {
    ssr: false,
  });

  return <Spiro />;
};

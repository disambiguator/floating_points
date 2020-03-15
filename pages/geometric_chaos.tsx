import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Spiro: any = dynamic(
    () => import('../components/geometric_chaos') as any,
    {
      ssr: false,
    },
  );

  return <Spiro />;
};

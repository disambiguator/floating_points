import dynamic from 'next/dynamic';
import React from 'react';

export default function Wash() {
  const Snowflake = dynamic(() => import('components/snowflakes'), {
    ssr: false,
  });

  return <Snowflake />;
}

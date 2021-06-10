import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React from 'react';

export default function Wash() {
  const { query } = useRouter();
  const shaderName = query.name;

  const Spiro = dynamic(() => import('../components/shaders'), { ssr: false });

  return <Spiro name={shaderName} />;
}

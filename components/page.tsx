import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Dimensions } from '../lib/types';

const Container = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background: black;
  color: white;
`;

interface Props {
  children: (dimensions: Dimensions) => ReactNode;
}

export default ({ children }: Props) => {
  const dimensions = { width: window.innerWidth, height: window.innerHeight };

  return (
    <React.StrictMode>
      <>
        <style global jsx>{`
          body {
            margin: 0;
          }
          canvas {
            display: block;
          }
        `}</style>
        <Container id="container">{children(dimensions)}</Container>
      </>
    </React.StrictMode>
  );
};

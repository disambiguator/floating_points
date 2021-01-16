import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  color: white;
`;

export default function Page({
  background = 'black',
  ...rest
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  background?: string;
}) {
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
        <Container {...rest} style={{ background }} id="container" />
      </>
    </React.StrictMode>
  );
}

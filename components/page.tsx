import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background: black;
  color: white;
`;

export default function Page(props: {
  children?: React.ReactNode;
  onClick?: () => void;
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
        <Container {...props} id="container" />
      </>
    </React.StrictMode>
  );
}

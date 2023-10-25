import React from 'react';
import styles from './page.module.scss';

export default function Page({
  background = 'black',
  ...rest
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  background?: string;
}) {
  return (
    <>
      <style global jsx>{`
        html {
          background: black;
        }
        body {
          margin: 0;
        }
        canvas {
          display: block;
        }
      `}</style>
      <div
        className={styles.container}
        {...rest}
        style={{ background }}
        id="container"
      />
    </>
  );
}

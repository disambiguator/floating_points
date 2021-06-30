import Link from 'next/link';
import React from 'react';
import Page from 'components/page';
import { shaders } from 'components/scenes';
import Shader from 'components/shader';
import styles from './shaders.module.scss';

const Scatter = () => (
  <Page>
    <div className={styles.root}>
      <div className={styles.gallery}>
        {Object.keys(shaders).map((name) => (
          <div className={styles.galleryItem} key={name}>
            <Link passHref href={`/shaders/${name}`}>
              <div
                style={{
                  height: 'inherit',
                  width: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <Shader name={name} />
              </div>
            </Link>
            <Link href={`/shaders/${name}`}>
              <a className={styles.title}>{name}</a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

export default Scatter;

import Link from 'next/link';
import React from 'react';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import { shaders } from 'components/scenes';
import Shader from 'components/shader';
import styles from './shaders.module.scss';

const Scatter = () => (
  <Page>
    <div className={styles.root}>
      <div className={styles.gallery}>
        {Object.entries(shaders).map(([name, shader]) => (
          <div className={styles.galleryItem} key={name}>
            <Link passHref href={`/shaders/${name}`} legacyBehavior>
              <div
                style={{
                  height: 'inherit',
                  width: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <FiberScene>
                  <Shader shader={shader} />
                </FiberScene>
              </div>
            </Link>
            <Link href={`/shaders/${name}`} className={styles.title}>
              {name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

export default Scatter;

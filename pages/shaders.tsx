import Link from 'next/link';
import React from 'react';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import { shaders } from 'components/scenes';
import Shader from 'components/shader';
import { DefaultShader } from './shaders/[name]';
import styles from './shaders.module.scss';

const Scatter = () => (
  <Page>
    <div className={styles['root']}>
      <div className={styles['gallery']}>
        {Object.keys(shaders).map((name) => (
          <div className={styles['galleryItem']} key={name}>
            <Link passHref href={`/shaders/${name}`} legacyBehavior>
              <div
                style={{
                  height: 'inherit',
                  width: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <FiberScene>
                  <Shader>
                    <DefaultShader name={name as keyof typeof shaders} />
                  </Shader>
                </FiberScene>
              </div>
            </Link>
            <Link href={`/shaders/${name}`} className={styles['title']}>
              {name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

export default Scatter;

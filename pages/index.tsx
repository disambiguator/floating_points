import Link from 'next/link';
import React from 'react';
import Page from '../components/page';
import styles from './index.module.scss';
const pages = [
  {
    name: 'enter gallery',
    path: '/art',
    description: '',
  },
];

const Scatter = () => {
  return (
    <Page background="#4e674e">
      <div className={styles.contents}>
        <h1>Paras Sanghavi</h1>
        <div className={styles.subheading}>
          web developer and generative artist in San Francisco, CA.
        </div>
        <div style={{ paddingBottom: 30 }}>
          {pages.map((p) => (
            <div key={p.name}>
              <div className={styles.title}>
                <Link href={p.path}>
                  <a>{p.name}</a>
                </Link>
              </div>
              {p.description}
            </div>
          ))}
        </div>
        <div>
          {'contact me: '}
          <a href="mailto:paras@disambiguo.us">email</a>
          {' | '}
          <a href="https://matrix.to/#/@paras:disambiguo.us">matrix</a>
          {' | '}
          <a href="https://linkedin.com/in/psanghavi">linkedin</a>
          {' | '}
          <a href="https://github.com/disambiguator">github</a>
        </div>
      </div>
    </Page>
  );
};

export default Scatter;

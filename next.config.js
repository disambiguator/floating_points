// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugins = require('next-compose-plugins');

// custom transpile module
const debug = false;
let start = null;
let i = 0;

const match = (path) => {
  if (!path.includes('three/examples/jsm')) return false;
  if (debug) {
    // should be around 3/4 seconds the first time and then 200ms after using Webpack 5 built-in loader cache
    let end = start ? new Date() - start : 0;
    console.log(
      `\x1b[37m`,
      `🚄 ${end}ms - The transpilation ${path} in process`,
    );
    if (i === 1) {
      start = new Date();
    }
    i++;
  }
  return true;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules')(
  ['three', 'react-three-gui', '@react-three/drei', 'react-dat-gui'], // '@react-three/postprocessing'
  { debug, __unstable_matcher: match }, // symlink-caused loops which cause memory to get bloated exponentially.
);

const nextConfig = {
  webpack(config) {
    config.module.rules.push(
      { test: /react-spring/, sideEffects: true }, // prevent vercel to crash when deploy
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader'],
      },
    );
    config.watchOptions = {
      ignored: ['**/.git/**', '**/.next/**', '**node_modules/**'],
    };
    return config;
  },
  target: 'serverless',
  typescript: {
    ignoreDevErrors: true,
  },
};

module.exports = plugins(
  [
    withTM(nextConfig),
    [
      {
        workboxOpts: {
          swDest: process.env.NEXT_EXPORT
            ? 'service-worker.js'
            : 'static/service-worker.js',
          runtimeCaching: [
            {
              urlPattern: /^https?.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'offlineCache',
                expiration: {
                  maxEntries: 200,
                },
              },
            },
          ],
        },
        async rewrites() {
          return [
            {
              source: '/service-worker.js',
              destination: '/_next/static/service-worker.js',
            },
          ];
        },
      },
    ],
  ],
  nextConfig,
);

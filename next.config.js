// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugins = require('next-compose-plugins');

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
  typescript: {
    ignoreDevErrors: true,
  },
  // Remove this once I figure out hydra-ts nonsense
  experimental: { esmExternals: 'loose' },
};

module.exports = plugins(
  [
    nextConfig,
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

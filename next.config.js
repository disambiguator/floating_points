// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPlugins = require('next-compose-plugins');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules')([
  'three',
  // 'postprocessing',
  'react-three-gui',
  '@react-three/drei',
  'react-dat-gui',
]);

module.exports = withPlugins([[withTM, {}]], {
  target: 'serverless',
  typescript: {
    ignoreDevErrors: true,
  },
});

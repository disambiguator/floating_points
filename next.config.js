module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });
    return config;
  },
  // Remove this once I figure out hydra-ts nonsense
  experimental: { esmExternals: 'loose' },
};

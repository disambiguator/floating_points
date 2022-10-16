module.exports = {
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  overrides: [{ files: ['*.frag'], options: { parser: 'glsl-parser' } }],
};

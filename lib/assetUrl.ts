const assetUrl = (suffix: string) =>
  process.env.NODE_ENV === 'development'
    ? suffix
    : `https://floating-points.s3.us-east-2.amazonaws.com/${suffix}`;

export default assetUrl;

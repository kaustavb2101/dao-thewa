/** @type {import('next').NextConfig} */
const nextConfig = {
  // allow large base64 photo payloads through API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;

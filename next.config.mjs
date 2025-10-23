/** @type {import('next').Config} */
const config = {
  reactStrictMode: false, // 👈 Disable Strict Mode
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://gofernets.run.place/nppes',
  },
  // Optimize build output
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Handle CORS for API routes if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  async rewrites() {
    return [
      {
        source: '/api/public/:path*',
        destination: 'http://localhost:5000/api/public/:path*',
      },
      {
        source: '/api/device/:path*',
        destination: 'https://m9vends-iot-backend-service.onrender.com/api/device/:path*',
      },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
  },
}

export default nextConfig

// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
  sassOptions: {
    additionalData: `
              @use "@/styles/variables.module.scss" as *;
              @use "@/styles/mixins.module.scss" as *;
            `,
  },
  images: {
    remotePatterns: [
      {
        //protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/api/v1/images/**',
      },
    ],
  },
};

module.exports = nextConfig;
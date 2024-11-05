// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
  // turbo: {
  //   useSwcCss: true,
  // },
  sassOptions: {
    additionalData: `
              @import "src/styles/variables.module.scss";
              @import "src/styles/mixins.module.scss";
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
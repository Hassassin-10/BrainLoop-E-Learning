
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // For user avatars from Vercel
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Ensure the public directory is served correctly for firebase-messaging-sw.js
  // Next.js automatically serves the public directory, so explicit config might not be needed
  // unless specific headers or rewrites are required for the service worker.
};

export default nextConfig;

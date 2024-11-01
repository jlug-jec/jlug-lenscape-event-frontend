/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'images.unsplash.com',
      'unsplash.com',
      'drive.google.com',
    ], // Add the domains here
  },
  async redirects() {
    return [
      {
        source: '/posts',
        destination: '/gallery',
        permanent: true, // Use true for a permanent 308 redirect, false for a temporary 307 redirect
      },
      {
        source: '/profile',
        destination: '/gallery',
        permanent: true, // Use true for a permanent 308 redirect, false for a temporary 307 redirect
      },
      {
        source: '/onboarding',
        destination: '/gallery',
        permanent: true, // Use true for a permanent 308 redirect, false for a temporary 307 redirect
      },
    ];
  },
};

export default nextConfig;

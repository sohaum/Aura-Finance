/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    images: {
      domains: [
        'images.unsplash.com',
        'lh3.googleusercontent.com', // For Google profile images
      ],
    },
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    },
  }
  
  module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-0b55c161e6c844dfa5d47fadeb46e175.r2.dev",
      },
    ],
  },
}

export default nextConfig

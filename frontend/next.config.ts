import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/judge", destination: "/dashboard", permanent: false },
      { source: "/mentorship", destination: "/mentor-chat", permanent: false },
      { source: "/chat", destination: "/team-chat", permanent: false },
      { source: "/mentor-portal", destination: "/portal/mentor", permanent: false },
      { source: "/admin-portal", destination: "/portal/admin", permanent: false },
    ];
  },
};

export default nextConfig;

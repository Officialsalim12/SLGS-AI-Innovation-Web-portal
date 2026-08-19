import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "slgs-ai-innovation-web-portal.onrender.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/judge-portal", destination: "/portal/judge", permanent: false },
      { source: "/mentorship", destination: "/mentor-chat", permanent: false },
      { source: "/chat", destination: "/team-chat", permanent: false },
      { source: "/mentor-portal", destination: "/portal/mentor", permanent: false },
      { source: "/admin-portal", destination: "/portal/admin", permanent: false },
    ];
  },
};

export default nextConfig;

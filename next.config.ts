import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // allowedDevOrigins: ["10.0.8.254"], - school
  // allowedDevOrigins: ["192.168.1.8"], // - apartment
  allowedDevOrigins: ["10.217.19.24"], // - phone net 
};

export default nextConfig;

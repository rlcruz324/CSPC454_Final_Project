import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      // {
      //   protocol: "https",
      //   hostname: "*.amazonaws.com",
      //   port: "",
      //   pathname: "/**",
      // },
      {
        protocol: "https",
        hostname: "lucky-star-s3-images.s3.us-west-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],  
  },
};

export default nextConfig;

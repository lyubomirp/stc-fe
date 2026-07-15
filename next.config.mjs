/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Next defaults to WebP only; AVIF is materially smaller for the
    // background artwork and falls back automatically.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

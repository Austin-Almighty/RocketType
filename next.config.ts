import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  webpack(config) {
    // Find the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      typeof rule === 'object' &&
      rule !== null &&
      'test' in rule &&
      rule.test instanceof RegExp &&
      rule.test.test('.svg')
    );

    if (fileLoaderRule && typeof fileLoaderRule === 'object') {
      // Exclude SVGs from the existing file loader
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Add a new rule to handle SVGs with SVGR
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  // Tree-shake icon imports (was 39MB of lucide-react, now only icons used).
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
  },

  // Heavy server-only packages — kept external so they aren't bundled into
  // every Serverless Function. Previously every API route bundled 119MB of
  // googleapis + 40MB of Remotion, blowing past the 250MB function limit.
  serverExternalPackages: [
    '@remotion/renderer',
    '@remotion/bundler',
    '@remotion/cli',
    '@remotion/lambda',
    '@remotion/preload',
    'remotion',
    'googleapis',
    'google-auth-library',
    'puppeteer',
    'puppeteer-core',
    '@sparticuz/chromium',
    'sharp',
  ],

  // Exclude heavy deps from being file-traced into routes that don't import
  // them. Routes that DO need them (render-related) still get them.
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@remotion/cli/**',
      'node_modules/@remotion/bundler/**',
      'node_modules/googleapis/**',
      'node_modules/google-auth-library/**',
      'node_modules/@babel/**',
      'node_modules/@rspack/**',
      'node_modules/typescript/**',
      'node_modules/@modelcontextprotocol/**',
      'node_modules/playwright*/**',
      'node_modules/@playwright/**',
    ],
  },
};

export default nextConfig;

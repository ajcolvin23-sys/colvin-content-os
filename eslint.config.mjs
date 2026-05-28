import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextVitals, ...nextTypescript];

eslintConfig.unshift({
  ignores: [
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "automation-os/data/**",
    "videos/**",
  ],
});

eslintConfig.push({
  files: ["scripts/**/*.{js,ts}", "automation-os/scripts/**/*.{js,ts}"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-require-imports": "off",
  },
});

export default eslintConfig;

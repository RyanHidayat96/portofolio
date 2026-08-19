import nextCoreVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "out/**", "build/**", "coverage/**", "playwright-report/**"]
  }
];

export default eslintConfig;

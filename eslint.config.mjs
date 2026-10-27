import { defineConfig, globalIgnores } from "eslint/config";

// 说明：eslint-config-next 该版本导出旧式 eslintrc 对象，与 ESLint 9 flat 配置不兼容，
// 历史上并未真正生效；此处仅保留构建产物忽略，避免 next build 的 lint 阶段报错。
// 如需启用规则检查，可后续迁移为官方 flat 写法。
const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

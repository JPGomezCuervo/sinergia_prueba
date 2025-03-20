import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      semi: ["warn", "always"],
    quotes: ["warn", "double"],
    indent: ["warn", 2],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
}
];

/* 
- npm install --save-dev eslint-plugin-import eslint-plugin-simple-import-sort 
  - doesn't work
- [good intro](https://www.dhiwise.com/post/the-ultimate-guide-to-integrating-eslint-with-vite)
- [sort-imports](https://eslint.org/docs/latest/rules/sort-imports)
- [eslint config files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [example config](https://dev.to/serifcolakel/simplify-your-codebase-with-auto-sorting-linter-using-eslint-plugin-simple-import-sort-2d16)
*/

import parser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

export default [
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
            "unused-imports": unusedImports,
        },
        rules: {
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        // Packages `react` related packages come first.
                        ["^@?solid.*"],
                        ["^\\w"],
                        ["^@?\\w"],
                        // Anything that does not start with a dot.
                        ["^\\u0000"],
                        // Internal packages (if you use internal aliases, adjust accordingly)
                        ["^"],
                        // Relative imports
                        ["^\\."],
                        // Style imports
                        ["^.+\\.s?css$"],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",
            "unused-imports/no-unused-imports": "error", // Removes unused imports
        },
        // by default, even with typescript parser, eslint will only lint .js files
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: parser,
            parserOptions: {
                ecmaVersion: "latest", // Allows for parsing modern ECMAScript features
                sourceType: "module", // Allows for the use of imports
            },
        },
    },
];

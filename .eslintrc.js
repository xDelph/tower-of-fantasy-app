/*
👋 Hi! This file was autogenerated by tslint-to-eslint-config.
https://github.com/typescript-eslint/tslint-to-eslint-config

It represents the closest reasonable ESLint configuration to this
project's original TSLint configuration.

We recommend eventually switching this configuration to extend from
the recommended rulesets in typescript-eslint.
https://github.com/typescript-eslint/tslint-to-eslint-config/blob/master/docs/FAQs.md

Happy linting! 💖
*/
module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/all",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  ignorePatterns: [
    "node_modules",
    "dist",
    ".eslintrc.js",
    "node_modules",
    "dist",
    ".eslintrc.js",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "@typescript-eslint/tslint",
    "prefer-arrow",
    "import",
    "no-null",
    "unicorn",
    "jsdoc",
    "promise",
    "prettier",
    "babel",
  ],
  root: true,
  rules: {
    "sort-imports": [
      "warn",
      {
        allowSeparatedGroups: true,
        ignoreDeclarationSort: true,
      },
    ],

    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "type",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
        ],
        pathGroups: [
          {
            pattern: "../../../**",
            group: "parent",
            position: "before",
          },
          {
            pattern: "../../**",
            group: "parent",
            position: "before",
          },
          {
            pattern: "../**",
            group: "parent",
            position: "before",
          },
        ],
        "pathGroupsExcludedImportTypes": ["type"],
        "newlines-between": "always",
        "alphabetize": {
          "order": 'asc', /* sort in ascending order. Options: ['ignore', 'asc', 'desc'] */
          "caseInsensitive": true /* ignore case. Options: [true, false] */
        }
      },
    ],

    "quotes": ["error", "single"],
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1,
        "ignoredNodes": [
          `FunctionExpression > .params[decorators.length > 0]`,
          `FunctionExpression > .params > :matches(Decorator, :not(:first-child))`,
          `ClassBody.body > PropertyDefinition[decorators.length > 0] > .key`,
        ]
      }
    ],
    "max-len": ["warn", { "code": 120 }],
    "space-before-blocks": ["warn"],
    // "multiline-comment-style": ["error", "bare-block"],
    "no-prototype-builtins": "off",
    "no-case-declarations": "warn",
    "padding-line-between-statements": [
      "warn",
      { "blankLine": "always", "prev": "*", "next": "return" },
    ],
    "object-curly-spacing": ["warn", "always"],
    "comma-spacing": ["error", { "before": false, "after": true }],
    "array-bracket-spacing": ["warn", "never"],
    "computed-property-spacing": ["warn", "never"],
    "no-multiple-empty-lines": ["warn", { max: 1 }],
    "padded-blocks": [
      "warn",
      "never"
    ],
    "no-multi-spaces": "warn",
    "eol-last": ["warn", "always"],
    "no-trailing-spaces": "error",
    "space-in-parens": "warn",
    'comma-dangle': 'off',

    // disabled rules after discussion
    "no-magic-numbers": "off",
    "@typescript-eslint/no-magic-numbers": "off",

    // babel rules
    "semi": "off",
    "babel/semi": 1,

    // basic typescript rules
    '@typescript-eslint/comma-dangle': [
      'error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
        enums: 'always-multiline',
        generics: 'always-multiline',
        tuples: 'always-multiline',
      }
    ],
    "@typescript-eslint/typedef": [
      "error",
      {
        "arrowParameter": true,
        "variableDeclaration": true,
        "propertyDeclaration": true,
        "memberVariableDeclaration": true,
        "variableDeclarationIgnoreFunction": true
      }
    ],
    
    "@typescript-eslint/prefer-enum-initializers": "off",
    "@typescript-eslint/prefer-literal-enum-member": "error",
    "@typescript-eslint/prefer-readonly-parameter-types": "off",
    "@typescript-eslint/array-type": ["warn", { default: "array-simple" }],
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-unnecessary-type-arguments": "off",
    "@typescript-eslint/prefer-regexp-exec": "off",
    "@typescript-eslint/no-confusing-void-expression": ["warn", { ignoreArrowShorthand: true }],
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/init-declarations": "off",
    "@typescript-eslint/require-array-sort-compare": ["error", { ignoreStringArrays: true }],
    "no-return-await": "off",
    "@typescript-eslint/return-await": ["error", "in-try-catch"],

    // member ordering
    "@typescript-eslint/member-ordering": "off",

    // any -> to be put in error later
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",

    // NestJS
    "@typescript-eslint/no-extraneous-class": ["error", { "allowEmpty": true }],
    "@typescript-eslint/no-useless-constructor": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/parameter-properties": "off",

    // inputs or args without graphql decorator
    "@typescript-eslint/lines-between-class-members": "off",

    // because of key like `lines.department`
    "@typescript-eslint/naming-convention": [
      "warn",
      { selector: ["enumMember"], format: ["UPPER_CASE"] },
    ],
  },
};

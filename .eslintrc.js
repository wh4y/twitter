module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "plugins": ["import", "@typescript-eslint/eslint-plugin", "typescript-sort-keys", "sort-destructure-keys"],
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:typescript-sort-keys/recommended"
  ],
  "root": true,
  "env": {
    "node": true,
    "jest": true
  },
  "ignorePatterns": ["*.js"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-member-accessibility": [
      "warn",
      {
        "overrides": {
          "constructors": "no-public",
          "methods": "explicit",
          "properties": "off",
          "parameterProperties": "explicit"
        }
      }
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "arrow-parens": ["error", "always"],
    "sort-destructure-keys/sort-destructure-keys": 2,
    "sort-keys": "warn",
    "typescript-sort-keys/interface": "warn",
    "typescript-sort-keys/string-enum": "warn",
    "import/order": [
      "warn",
      {
        "alphabetize": {
          "caseInsensitive": true,
          "order": "asc"
        },
        "groups": [["builtin", "external"], "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "pathGroups": [{ "group": "internal", "pattern": "@/**" }],
        "pathGroupsExcludedImportTypes": []
      }
    ],
    "import/prefer-default-export": "off",
    "max-classes-per-file": ["error", 3],
    "max-len": [
      "error",
      {
        "code": 135,
        "ignoreTemplateLiterals": true,
        "ignorePattern": "^import\\s.+\\sfrom\\s.+;$",
        "ignoreUrls": true
      }
    ],
    "no-console": "warn",
    "no-duplicate-imports": "warn",
    "no-empty-pattern": "warn",
    "no-return-await": "error",
    "no-trailing-spaces": "error",
    "object-shorthand": "error",
    "lines-between-class-members": [
      "error",
      "always",
      { "exceptAfterSingleLine": true }
    ],
    "padding-line-between-statements": [
      "error",
      { "blankLine": "always", "next": "*", "prev": ["const", "let"] },
      { "blankLine": "always", "next": "class", "prev": "*" },
      { "blankLine": "always", "next": "export", "prev": "*" },
      { "blankLine": "any", "next": "export", "prev": "export" },
      { "blankLine": "always", "next": "for", "prev": "*" },
      { "blankLine": "always", "next": "function", "prev": "*" },
      { "blankLine": "always", "next": "if", "prev": "*" },
      { "blankLine": "always", "next": "*", "prev": "if" },
      { "blankLine": "always", "next": "return", "prev": "*" },
      { "blankLine": "always", "next": "switch", "prev": "*" },
      { "blankLine": "always", "next": "try", "prev": "*" },
      { "blankLine": "always", "next": "while", "prev": "*" },
      { "blankLine": "any", "next": ["const", "let"], "prev": ["const", "let"] }
    ]
  },
  "settings": {
    "import/resolver": {
      "typescript": {}
    }
  }
};

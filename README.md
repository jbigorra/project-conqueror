# Project Conqueror

## Packages

This project is a monorepo that uses pnpm as the package manager and uses the `turbo` as build tool.

- The packages are located in the `packages` folder.
- The apps are located in the `apps` folder.

### Apps list

- [`webapp`](apps/webapp/README.md): Contains the fullstack web application modulith for Project Conqueror.

### Packages list

- [`behave`](packages/behave/README.md): Contains library that can analyse repositories to generate different kind of analyses.
- [`lib`](packages/lib/README.md): Contains very generic pieces of code that are used across the project.
- [`typescript-config`](packages/typescript-config/README.md): Contains the base TypeScript configuration for all the packages/apps.

# Package/App Configuration (`package.json`)

- The `package.json` `name` field is used to identify the package/app, it should be unique across the project and contain the prefix `@prj-conq/<package-or-app-name>`.
- The `package.json` "type" field is not required to be set to "module".
- The `imports` section in the `package.json` is used to import the packages from the correct paths. DO NOT use the tsconfig.json `paths` option for aliasing paths.
- The `exports` section in the `package.json` is used to explicitly define the exports of the package. These exports are the paths used by other packages or apps to import the package with the package name. Example: `@project-name/package-name/alias1` will import the `alias1` contents from the package.

Example `package.json`:

```json
{
  "imports": {
    "#alias1": "./dist/alias1.js",
    "#alias2": "./dist/alias2.js",
    "#alias3": "./dist/alias3.js"
  }, 
  "exports": {
    "./alias1": {
      "types": "./dist/alias1/index.d.ts",
      "default": "./dist/alias1/index.js"
    },
    "./alias2": {
      "types": "./dist/alias2/index.d.ts",
      "default": "./dist/alias2/index.js"
    },
    "./alias3": {
      "types": "./dist/alias3/index.d.ts",
      "default": "./dist/alias3/index.js"
    }
  }
}
```

When scaffolding a new package, use the `example.package.json` file as a template, modify the new package.json file according to the needs. For example: as you can see in the [`@prj-conq/typescript-config`](packages/typescript-config/README.md) package, a thinned down version of the `package.json` file is used.

### TypeScript Configuration

Every package has a `tsconfig.json` file that is used to configure the TypeScript compiler, it inherits from a base `tsconfig.json` file from the `@prj-conq/typescript-config` package.

The config file should bekept to a minimum for simplicity and compatibility between the packages/apps.

# Unit Testing Packages

Each package is being tested with Vitest.

## Requirements

### Test File Naming

The test files are expected to be named like `*.test.ts` and be placed in the `tests` folder.

### Vitest Configuration

Every package has a `vitest.config.mjs` file that is used to configure the tests.

Inside the `vitest.config.mjs` file, the `resolve.alias` is used to alias the packages to the correct paths.

Example `vitest.config.mjs`:
```js
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#alias1": path.resolve(__dirname, "./src"),
      "#alias2": path.resolve(__dirname, "./src/folder1"),
      "#alias3": path.resolve(__dirname, "./src/folder2"),
    },
  },
  test: {
    name: "package-name",
    typecheck: {
      tsconfig: "./tsconfig.json",
      checker: "tsc",
      enabled: true,
    },
  },
});
```

### Mocking

To ensure the tests look simpler and less convoluted the mocks are expected to be created using the `vitest-mock-extended` package as much as possible. For more information, see the [vitest-mock-extended](https://www.npmjs.com/package/vitest-mock-extended) npm package.


## Executing tests


### From inside the package or app

To execute the tests once, run the following command:
```bash
pnpm run test
```

To execute the tests with watcher for a TDD workflow, run the following command:
```bash
pnpm run tdd
```

### From the root of the project

To execute ALL the packages/apps tests once, run the following command:
```bash
turbo test
```

To execute ALL the packages/apps tests with watcher for a TDD workflow, run the following command:
```bash
turbo tdd
```

# Building the project

The packages/apps are being built with the `turbo` build tool. The build process is defined in the `turbo.json` file.

The output of each package/app is placed in the `dist` folder for the ones that require building.

To build the project, run the following command:
```bash
turbo build
```

To build the project with watcher for a TDD/Dev workflow, run the following command:
```bash
turbo dev
```

To teardown the project, run the following command:
```bash
turbo dev:teardown
```

## Turbo configuration

<TODO: add content>

# Changelog

## [0.1.1](https://github.com/jbigorra/project-conqueror/compare/behave-v0.1.0...behave-v0.1.1) (2026-04-08)


### Features

* add Behave class facade wrapping all analysis functions ([4449e37](https://github.com/jbigorra/project-conqueror/commit/4449e37501b366d5589bdb4d025ddbd090ff0d40))
* add Behave class facade wrapping all analysis functions ([b6d4798](https://github.com/jbigorra/project-conqueror/commit/b6d47983cdb92259c0bea22e912648b43cbbaa7a))
* add fixed version control option to analysis command ([bd0e73a](https://github.com/jbigorra/project-conqueror/commit/bd0e73ac885fb2b5736c02a8c4e39021714e70d6))
* add linesOfCode to ComplexityHotspot by summing nloc per file ([98b5362](https://github.com/jbigorra/project-conqueror/commit/98b53623dbc363998e4ad82f70087312783e6171))
* add linesOfCode to ComplexityHotspot by summing nloc per file ([e44fa59](https://github.com/jbigorra/project-conqueror/commit/e44fa59ccd76d1b9865a61813bb4687dbe2a437d))
* Allow the analysis_runner to return a Result as an Array of records. ([85d0927](https://github.com/jbigorra/project-conqueror/commit/85d092769ae25e829e9c66c863cb3c30e84813cd))
* **ATM-6:** Export Behave type ([9c9932c](https://github.com/jbigorra/project-conqueror/commit/9c9932c60620b518f28c51c53fefb98904462d83))
* **behave:** add analysis, lizard, and code-maat schemas with tests ([a1e893c](https://github.com/jbigorra/project-conqueror/commit/a1e893ccc1d30cdd16b8879278ccfd1763987440))
* **behave:** add CodeMaatService and LizardService as Effect capabilities ([2295d8d](https://github.com/jbigorra/project-conqueror/commit/2295d8d38400803b97eb29d2e2c911b787998bfc))
* **behave:** add complexity-hotspots aggregated analysis ([bc3c43e](https://github.com/jbigorra/project-conqueror/commit/bc3c43e98b960e7043c0b40d67831ec8f2c813e9))
* **behave:** add core types and tagged error classes (Tasks 3 & 4) ([afb1225](https://github.com/jbigorra/project-conqueror/commit/afb1225e1b14abfd6d922f92fc9d0560c6de6e9a))
* **behave:** add pipeline ETL utilities for extract, load, and transform ([0ff18b8](https://github.com/jbigorra/project-conqueror/commit/0ff18b88186b5783843aaf12bdc32a58e626c8c7))
* **behave:** export analysis schema types and enable DTS generation ([d9a7f30](https://github.com/jbigorra/project-conqueror/commit/d9a7f3010f6f1c07ef77d75595d050bb6f0de3b7))
* **behave:** expose new Behave facade as primary export, keep legacy under LegacyBehave ([ffd43ba](https://github.com/jbigorra/project-conqueror/commit/ffd43baba1fed665e6f60e5a68e4ca8516b86938))
* **behave:** expose new Behave facade as primary export, keep legacy under LegacyBehave ([ce8d0dc](https://github.com/jbigorra/project-conqueror/commit/ce8d0dc90e31b7599bb51a17a5b98e065632432b))
* **behave:** expose new public API alongside legacy exports in index.ts ([8403730](https://github.com/jbigorra/project-conqueror/commit/840373088bc581eecef8c67c129372b0aa926ac5))
* **behave:** implement all 18 simple analyses with tests (Tasks 12-13) ([947d6c1](https://github.com/jbigorra/project-conqueror/commit/947d6c1a62170e791d1cd76765e257b50c9fd4ae))
* **charts:** enclosure diagram for complexity hotspots ([1b9518b](https://github.com/jbigorra/project-conqueror/commit/1b9518b5cebf475a0ced5bc36c49af4cd7c1f412))
* Enhance CSVParser with error handling and comprehensive tests ([b2f3cbd](https://github.com/jbigorra/project-conqueror/commit/b2f3cbd0ae3650025a4ecd8663d676aa874a8b2e))
* expand TOptions type with additional analysis parameters ([55eb6f9](https://github.com/jbigorra/project-conqueror/commit/55eb6f9bdb4677e123011cd29726fa8e806336cf))
* implement CodeMaat class and associated tests ([2c7e21c](https://github.com/jbigorra/project-conqueror/commit/2c7e21c50571c463cadff839e3b3ee1a23db60d6))
* migrate to bunup for building packages ([1338376](https://github.com/jbigorra/project-conqueror/commit/1338376cdcec6ef7f11423b21ade1544fbfe90ba))


### Bug Fixes

* add ts-ignore to CSVParser.unparse ([fb1d816](https://github.com/jbigorra/project-conqueror/commit/fb1d81676596702136d9d8df6e84eb490b746270))
* **behave:** address PR review findings ([9af16b2](https://github.com/jbigorra/project-conqueror/commit/9af16b24a95cec7a947dfe997f1bb516b37ba1aa))
* **behave:** address second round of PR review comments ([8e96687](https://github.com/jbigorra/project-conqueror/commit/8e96687d160f3124b375e0cef14f9e833feeec65))
* **behave:** bundle workspace deps to avoid phantom dependency in consumers ([f423a65](https://github.com/jbigorra/project-conqueror/commit/f423a65f62e1ee83bb9ef1b2481ca3fda202ced0))
* **behave:** fix noExternal package name and enable DTS generation ([eeb0304](https://github.com/jbigorra/project-conqueror/commit/eeb03046033eefbf468998f969400b2626111cbf))
* **behave:** remove dist/ prefix from copy plugin destination ([486e085](https://github.com/jbigorra/project-conqueror/commit/486e085e8f28722f39cba12352429333968b94fd))
* **behave:** use inferTypes DTS mode for Effect compatibility ([9d61f69](https://github.com/jbigorra/project-conqueror/commit/9d61f69a64d5f61350069306a641d1abbb35e56a))
* **charts:** resolve lint issues from pre-commit hook ([1896729](https://github.com/jbigorra/project-conqueror/commit/1896729239671ee90a442ca8aec642b3f057bac2))
* correct the coverage report path ([aa309a7](https://github.com/jbigorra/project-conqueror/commit/aa309a7776a842c0a77e09a0aa88697b6487c349))
* Final rename: Infrastructure -&gt; infrastructure ([d617f0c](https://github.com/jbigorra/project-conqueror/commit/d617f0cca21b6f1ec4067e42f6a2d4278513d876))
* Final rename: Infrastructure -&gt; infrastructure ([f4162f2](https://github.com/jbigorra/project-conqueror/commit/f4162f2bb4b1d2e8426cfd1689127ddb7c9c2036))
* merge conflict ([6670c66](https://github.com/jbigorra/project-conqueror/commit/6670c66a8f43cd2a963c147c15dc957cd07ef01e))
* sonarcloud cov path ([503578b](https://github.com/jbigorra/project-conqueror/commit/503578bdc8d85b0fda764886fe1c58d056dbdec4))
* teamp rename test/Infrastructure to infra_temp ([60fa100](https://github.com/jbigorra/project-conqueror/commit/60fa100434e4f0c690352341635a23cb1346c9bb))
* Temp rename Infrastructure to infra_temp ([1b54e4e](https://github.com/jbigorra/project-conqueror/commit/1b54e4ed30f582971a7b98a2401cbc901da7bc74))
* update error handling in CSVParser tests ([f2bf39e](https://github.com/jbigorra/project-conqueror/commit/f2bf39e74ceb5551aa0e67de1ca9253f64e19397))
* update sonar project configuration for coverage reporting and vitest coverage settings to use lcov ([37555fa](https://github.com/jbigorra/project-conqueror/commit/37555fa909f2240599fb4d2abcb777945a8bcf1a))

# Changelog

## [0.1.5](https://github.com/jbigorra/project-conqueror/compare/charts-v0.1.4...charts-v0.1.5) (2026-04-09)


### Bug Fixes

* use build instead of typecheck in validate for stricter checks ([47ea83f](https://github.com/jbigorra/project-conqueror/commit/47ea83f36f11a909886981da357a92473a435a2c))

## [0.1.4](https://github.com/jbigorra/project-conqueror/compare/charts-v0.1.3...charts-v0.1.4) (2026-04-09)


### Bug Fixes

* relax D3 Selection type in _truncateLabel to fix build ([2205688](https://github.com/jbigorra/project-conqueror/commit/2205688929ab73e3ce67fccbcd843bd4cf27a70b))

## [0.1.3](https://github.com/jbigorra/project-conqueror/compare/charts-v0.1.2...charts-v0.1.3) (2026-04-09)


### Bug Fixes

* update story and domain imports for .visual.ts rename ([4ac9c49](https://github.com/jbigorra/project-conqueror/commit/4ac9c4942e661b6a9762e61acd00f7c04227040a))

## [0.1.2](https://github.com/jbigorra/project-conqueror/compare/charts-v0.1.1...charts-v0.1.2) (2026-04-09)


### Features

* add adaptive labels and theme support to enclosure diagram ([ba431df](https://github.com/jbigorra/project-conqueror/commit/ba431dfa1ad3897d8461f453cd5735d547cba638))


### Bug Fixes

* arc labels with overlap avoidance for enclosure diagram ([4ec9553](https://github.com/jbigorra/project-conqueror/commit/4ec95536c272408107e82fe81b8ef0f21c2689ef))

## [0.1.1](https://github.com/jbigorra/project-conqueror/compare/charts-v0.1.0...charts-v0.1.1) (2026-04-08)


### Features

* add Storybook stories and fixture for enclosure hotspots chart variant ([ed1b85c](https://github.com/jbigorra/project-conqueror/commit/ed1b85cb299449c057675211a823bb082284a166))
* **charts:** add age-chart and summary-cards domain wrappers ([10899e4](https://github.com/jbigorra/project-conqueror/commit/10899e47ad07fa9db5949c0e0eb3b2a503da65c1))
* **charts:** add all domain mapper functions with tests ([50496ee](https://github.com/jbigorra/project-conqueror/commit/50496ee78e64e57027c680c20ba9b407ab307176))
* **charts:** add bar+treemap domain wrappers (authors, main-dev, refactoring-dev) ([31fbe93](https://github.com/jbigorra/project-conqueror/commit/31fbe9365be2afdc747703350006ce59fd5ff20d))
* **charts:** add buildHotspotsTree mapper with TDD tests ([334917b](https://github.com/jbigorra/project-conqueror/commit/334917b5d329e1dde90524d050f89c0362e53711))
* **charts:** add churn domain wrappers (abs, author, entity) ([3fe44f2](https://github.com/jbigorra/project-conqueror/commit/3fe44f240df56c806ed752bac8e776d6a655e808))
* **charts:** add coupling, communication, and hotspots domain wrappers ([7be90fd](https://github.com/jbigorra/project-conqueror/commit/7be90fde9ab311597a53442f21ada7ba9e084085))
* **charts:** add CSS theme stylesheets for link imports ([ca535c1](https://github.com/jbigorra/project-conqueror/commit/ca535c1e187a13e35f747687d48553d86417d031))
* **charts:** add first vertical slice — ranked-bar, revisions-chart, mappers, stories ([3ab0c0b](https://github.com/jbigorra/project-conqueror/commit/3ab0c0bc6b11ffe778c785fdf0360e92e83ab1b5))
* **charts:** add ownership, effort, and fragmentation domain wrappers ([0c4c91b](https://github.com/jbigorra/project-conqueror/commit/0c4c91b13b68e0c8dd1062be606e666a1a11e716))
* **charts:** add pq-bubble generic component ([4a9439d](https://github.com/jbigorra/project-conqueror/commit/4a9439dd90198e246345b7e13a5527f61468d5e3))
* **charts:** add pq-doughnut generic component ([8f318f0](https://github.com/jbigorra/project-conqueror/commit/8f318f0a3251ffb9c9ccd8160279b0b4f287dde8))
* **charts:** add pq-grouped-bar with dataset builder ([f648327](https://github.com/jbigorra/project-conqueror/commit/f6483272b6282fbe119098241930ef2a3b4f8e4e))
* **charts:** add pq-histogram with binning mapper ([80a91a1](https://github.com/jbigorra/project-conqueror/commit/80a91a121f159ac306e3a178360dca37899233a7))
* **charts:** add pq-line-area with dataset builder ([c8826db](https://github.com/jbigorra/project-conqueror/commit/c8826db4a5550a778dc7e689c69c50ca29552956))
* **charts:** add pq-soc-chart and pq-messages-chart domain wrappers ([91646af](https://github.com/jbigorra/project-conqueror/commit/91646afd04f9bab7b2fc0122fd2d58771dd677e9))
* **charts:** add pq-stacked-bar with dataset builder ([b37ed0c](https://github.com/jbigorra/project-conqueror/commit/b37ed0cd9033a3a1f15940dc5b9a4a5774e1a46e))
* **charts:** add pq-treemap generic component ([533bdc7](https://github.com/jbigorra/project-conqueror/commit/533bdc7f74116304ad54bc772f9b19cf1d4bb170))
* **charts:** add PqEnclosure D3 circle-packing web component ([23c48de](https://github.com/jbigorra/project-conqueror/commit/23c48de54cf240d0ce5378c1e1c30d1acf932ba0))
* **charts:** add Storybook stories for all components ([6b0a44e](https://github.com/jbigorra/project-conqueror/commit/6b0a44edb79751a5d5b24d98440029eb2a896973))
* **charts:** add ThemeController and DataFetchController with tests ([b75452c](https://github.com/jbigorra/project-conqueror/commit/b75452cff08d5dba08cd434162206a55cc719d3a))
* **charts:** compute folder aggregates in hotspots tree builder ([8bbabd2](https://github.com/jbigorra/project-conqueror/commit/8bbabd22fc10ad1cfbeb011fa006ed2e714d341a))
* **charts:** enclosure diagram for complexity hotspots ([1b9518b](https://github.com/jbigorra/project-conqueror/commit/1b9518b5cebf475a0ced5bc36c49af4cd7c1f412))
* **charts:** export all 18 domain wrappers from domain index ([47aea42](https://github.com/jbigorra/project-conqueror/commit/47aea424904ce0657ecf3a776fc360187e386576))
* **charts:** install D3 dependencies and define hotspots tree types ([9023351](https://github.com/jbigorra/project-conqueror/commit/902335174fcbb4bdaffcd38d14479f2961d3471d))
* **charts:** wire enclosure variant into PqHotspotsChart ([d56630a](https://github.com/jbigorra/project-conqueror/commit/d56630a9a028a130d06b699962b16fb3d3a85c70))
* **charts:** wire up treemap variant in pq-revisions-chart ([90b4942](https://github.com/jbigorra/project-conqueror/commit/90b4942fd4069b45af7bced82a9d135794292bea))


### Bug Fixes

* **charts:** correct return type annotation in enclosure _createSvg method ([5a1f056](https://github.com/jbigorra/project-conqueror/commit/5a1f0568530298b0b7cae280262c3b2e15655e86))
* **charts:** eliminate all noExplicitAny errors and fix Storybook deps ([eeeb233](https://github.com/jbigorra/project-conqueror/commit/eeeb2332e4288bd35227b7b8dc0e9289043bd836))
* **charts:** register Chart.js components in ChartController and fix canvas reuse ([bd00fda](https://github.com/jbigorra/project-conqueror/commit/bd00fdaaed48df38b6470d20f2d2ebcb4da67a41))
* **charts:** resolve lint issues from pre-commit hook ([1896729](https://github.com/jbigorra/project-conqueror/commit/1896729239671ee90a442ca8aec642b3f057bac2))
* **charts:** set esbuild target to esnext in storybook to fix destructuring transform errors ([27501d8](https://github.com/jbigorra/project-conqueror/commit/27501d8313c97393b36e2010e8033abcd624a843))
* **deps:** update storybook and vite to patch security vulnerabilities ([c58f53a](https://github.com/jbigorra/project-conqueror/commit/c58f53a2fec368dfc55533ca36720bd15e809350))
* merge conflict ([6670c66](https://github.com/jbigorra/project-conqueror/commit/6670c66a8f43cd2a963c147c15dc957cd07ef01e))

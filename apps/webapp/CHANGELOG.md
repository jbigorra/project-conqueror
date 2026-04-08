# Changelog

## [0.1.1](https://github.com/jbigorra/project-conqueror/compare/webapp-v0.1.0...webapp-v0.1.1) (2026-04-08)


### Features

* Add custom font styles and CSS ([5b6f743](https://github.com/jbigorra/project-conqueror/commit/5b6f7436dd85418ef845de40b8fad3235816f9f5))
* Add error handling to S3FileStorage upload method and implement corresponding tests ([92cf6d8](https://github.com/jbigorra/project-conqueror/commit/92cf6d87b5c2e2a7d5f7386c026d351c94a89825))
* **ATM-5:** Add database configuration and migrations for SQLite ([c80bd9d](https://github.com/jbigorra/project-conqueror/commit/c80bd9daf81c6f186216a226d7c4c7669d555c97))
* **ATM-5:** Add uploads table and related migrations for file storage ([30c994b](https://github.com/jbigorra/project-conqueror/commit/30c994b7230352b3bb56a3d588595437916221a5))
* **ATM-5:** Enhance Upload entity and implement UploadRepository ([7204d57](https://github.com/jbigorra/project-conqueror/commit/7204d57de3a7310e684ebef6acd76075d4cce449))
* **ATM-5:** Enhance UploadFile use case to include UUIDv7 for filenames ([8fba980](https://github.com/jbigorra/project-conqueror/commit/8fba9801743631f94d166a3fa81d37ceb1ae472a))
* **ATM-5:** Ensure files are uploaded with a unique identifier as filename. ([b3f43b0](https://github.com/jbigorra/project-conqueror/commit/b3f43b01a93ceb5cc50179485464865fdb92c0de))
* **ATM-5:** Handle error case in UploadFile use case and add corresponding test ([28043c8](https://github.com/jbigorra/project-conqueror/commit/28043c87b1735a226b758939dea38666aa91c11e))
* **ATM-6:** Add FileUploadedHandler placeholder and update event bus subscription ([b580e20](https://github.com/jbigorra/project-conqueror/commit/b580e20fde059c7ed160376f8fec3261bd7e8261))
* **ATM-6:** Add test to ensure success is returned when analysis is finished successfully ([56e8023](https://github.com/jbigorra/project-conqueror/commit/56e80233d6ce27d0f51cbe0ee377acac458e7404))
* **ATM-6:** Enhance FileUploadedEvent to include file object ([cc812b7](https://github.com/jbigorra/project-conqueror/commit/cc812b7af50beec3eb9b5109589f795ce7785169))
* **ATM-6:** fix test to wait for the SUT ([4074187](https://github.com/jbigorra/project-conqueror/commit/407418716471314ed1ab6be62039fbfda459fd6a))
* **ATM-6:** Introduce event bus and file uploaded event for upload process ([2e00fe9](https://github.com/jbigorra/project-conqueror/commit/2e00fe95715cd3455645161c66960179f6727a27))
* **ATM-6:** Introduce ILocalFileStorage interface and placeholder LocalFileStorage implementation ([f08b646](https://github.com/jbigorra/project-conqueror/commit/f08b646d0cdf2bc56df892f192a07f0e0d27a549))
* **charts:** enclosure diagram for complexity hotspots ([1b9518b](https://github.com/jbigorra/project-conqueror/commit/1b9518b5cebf475a0ced5bc36c49af4cd7c1f412))
* configure static file serving and setup basic file upload in the page ([b833c48](https://github.com/jbigorra/project-conqueror/commit/b833c48c653b7459eb8f23274c8036719e351f4a))
* create base Elysia project ([ca32799](https://github.com/jbigorra/project-conqueror/commit/ca327997c09c2eb39d998c243492900cb74d5d7b))
* **database:** Implement database creation functions for development, production, and testing ([d2f35d7](https://github.com/jbigorra/project-conqueror/commit/d2f35d74f4e24358f2066eb36a402dc055d527bb))
* Enhance file upload functionality and update UI components ([0546c51](https://github.com/jbigorra/project-conqueror/commit/0546c510926c80a20a0b699fb07a5b87ea153ff8))
* Enhance UploadFile use case with uploads repository and S3 file storage integration ([4d1bf59](https://github.com/jbigorra/project-conqueror/commit/4d1bf59cc880cde45979c9b2f66397700ef2b336))
* implement file upload functionality and enhance UI ([76a261d](https://github.com/jbigorra/project-conqueror/commit/76a261d1562ecd4640355163f2741aa4c266f6a9))
* Implement file upload functionality with progress tracking ([0401a96](https://github.com/jbigorra/project-conqueror/commit/0401a9630fad21eadaeb5d59d28e36b1ca7f52e1))
* implement file upload use case ([6ccf7a7](https://github.com/jbigorra/project-conqueror/commit/6ccf7a7eb25b9bd23e4f476428df5fd476cb3870))
* Implement IFileStorage interface and S3FileStorage implementation ([b84218e](https://github.com/jbigorra/project-conqueror/commit/b84218ec2fd94a586a6fda9d310cf400762e23c0))
* Implement skeleton of the web page ([a162aec](https://github.com/jbigorra/project-conqueror/commit/a162aec73893c3731d7c39b8c90b440e4c343cf2))
* Introduce AnalysisRunnerSubscriber to process uploaded files ([bf94e8b](https://github.com/jbigorra/project-conqueror/commit/bf94e8b6d9cc2e6a3708d6ddeb4bbc825363004b))
* introduce error handling in S3FileStorage ([9afc30c](https://github.com/jbigorra/project-conqueror/commit/9afc30c74619c445d7911586b998d4aa8164fb49))
* Introduce GenericErrorAlert component ([4d9cb7c](https://github.com/jbigorra/project-conqueror/commit/4d9cb7cc412a36893ff858765aafd36648e643ec))
* **migrations:** Add initial uploads table and migration scripts ([dc4f310](https://github.com/jbigorra/project-conqueror/commit/dc4f310e374c3d3454e9339cabe0a547754f1902))
* Refactor upload page and introduce new layout components ([46bc3bc](https://github.com/jbigorra/project-conqueror/commit/46bc3bc0d79c9adabcd5b78e9f3d5373d897679c))
* **repository:** Refactor repository types and introduce DomainEntity class ([1bc6438](https://github.com/jbigorra/project-conqueror/commit/1bc6438fae0c03d2e38213a20e0b4c81759de65a))


### Bug Fixes

* add missing dependency breaking the test:coverage step in the pipeline ([33c4526](https://github.com/jbigorra/project-conqueror/commit/33c45269dcee44146cdb316f9af9d8e614f0347d))
* broken pipeline due to Bun not available ([127b653](https://github.com/jbigorra/project-conqueror/commit/127b653ecba28e35df0249aa5ac595c0971b4b08))
* **deps:** update storybook and vite to patch security vulnerabilities ([c58f53a](https://github.com/jbigorra/project-conqueror/commit/c58f53a2fec368dfc55533ca36720bd15e809350))
* fix sonarlint and pipeline to reintroduce coverage reports ([c8fddbf](https://github.com/jbigorra/project-conqueror/commit/c8fddbfbadb43f5252f036a31a60e7d0fab72c69))
* **tests:** Remove exclusive test execution for S3FileStorage tests ([3d570fa](https://github.com/jbigorra/project-conqueror/commit/3d570fa10654f54e0faf3c49382bf369bb79de41))
* **tests:** Remove exclusive test execution for upload-file tests ([946f2c0](https://github.com/jbigorra/project-conqueror/commit/946f2c02c3537e2b1f437f805d888e5adc53e760))
* **webapp:** remove t.File type constraint broken by Elysia 1.4.27 file-type validation ([32f83b2](https://github.com/jbigorra/project-conqueror/commit/32f83b244565706032e7991b41491a7e6002a233))

export const gitlog = `--783fae8--2025-07-03--Juan bigorra
2	1	Gemfile
38	1	Gemfile.lock
49	0	Guardfile
-	-	code_maat_client-1.0.0.gem
6	4	code_maat_client.gemspec
317	0	lib/client.rb
5	0	lib/code_maat/version.rb
-	-	pkg/code_maat_client-1.0.0.gem
15	0	spec/lib/client_spec.rb
3	5	spec/spec_helper.rb

--3f626f7--2025-07-03--Juan bigorra
3	1	.gitignore
0	54	lib/code_maat_client/analysis_types/abs_churn.rb
0	156	lib/code_maat_client/analysis_types/age.rb
0	56	lib/code_maat_client/analysis_types/author_churn.rb
0	83	lib/code_maat_client/analysis_types/authors.rb
0	46	lib/code_maat_client/analysis_types/communication.rb
0	88	lib/code_maat_client/analysis_types/coupling.rb
0	135	lib/code_maat_client/analysis_types/entity_churn.rb
0	56	lib/code_maat_client/analysis_types/entity_effort.rb
0	46	lib/code_maat_client/analysis_types/entity_ownership.rb
0	46	lib/code_maat_client/analysis_types/fragmentation.rb
0	111	lib/code_maat_client/analysis_types/identity.rb
0	47	lib/code_maat_client/analysis_types/main_dev.rb
0	48	lib/code_maat_client/analysis_types/main_dev_by_revs.rb
0	46	lib/code_maat_client/analysis_types/messages.rb
0	52	lib/code_maat_client/analysis_types/refactoring_main_dev.rb
0	96	lib/code_maat_client/analysis_types/revisions.rb
0	53	lib/code_maat_client/analysis_types/soc.rb
0	89	lib/code_maat_client/analysis_types/summary.rb
0	41	lib/code_maat_client/builders/result_builder.rb
0	100	lib/code_maat_client/configuration/analysis_configuration.rb
0	227	lib/code_maat_client/configurations/analysis_configurations.rb
0	4	lib/code_maat_client/errors/analysis_error.rb
0	4	lib/code_maat_client/errors/base_error.rb
0	13	lib/code_maat_client/errors/csv_parse_error.rb
0	10	lib/code_maat_client/errors/csv_validation_error.rb
0	4	lib/code_maat_client/errors/jar_not_found_error.rb
0	4	lib/code_maat_client/errors/java_not_found_error.rb
0	74	lib/code_maat_client/executors/analysis_executor.rb
0	68	lib/code_maat_client/factories/analysis_factory.rb
0	32	lib/code_maat_client/factories/executor_factory.rb
0	6	lib/code_maat_client/infrastructure/command_builder.rb
0	27	lib/code_maat_client/infrastructure/csv_parser.rb
0	83	lib/code_maat_client/infrastructure/jar_executor.rb
0	72	lib/code_maat_client/strategies/analysis_strategy.rb
0	23	lib/code_maat_client/validators/default_validator.rb
0	68	lib/code_maat_client/validators/validator_factory.rb
0	82	lib/code_maat_client/value_objects/analysis_options.rb
0	63	lib/code_maat_client/value_objects/analysis_result.rb
0	68	lib/code_maat_client/value_objects/execution_result.rb
0	3	lib/code_maat_client/version.rb
0	44	spec/code_maat_client/analysis_types/abs_churn_spec.rb
0	311	spec/code_maat_client/analysis_types/age_spec.rb
0	52	spec/code_maat_client/analysis_types/author_churn_spec.rb
0	192	spec/code_maat_client/analysis_types/authors_spec.rb
0	52	spec/code_maat_client/analysis_types/communication_spec.rb
0	148	spec/code_maat_client/analysis_types/coupling_spec.rb
0	246	spec/code_maat_client/analysis_types/entity_churn_spec.rb
0	36	spec/code_maat_client/analysis_types/entity_effort_spec.rb
0	72	spec/code_maat_client/analysis_types/entity_ownership_spec.rb
0	45	spec/code_maat_client/analysis_types/fragmentation_spec.rb
0	55	spec/code_maat_client/analysis_types/identity_spec.rb
0	43	spec/code_maat_client/analysis_types/main_dev_by_revs_spec.rb
0	107	spec/code_maat_client/analysis_types/main_dev_spec.rb
0	55	spec/code_maat_client/analysis_types/messages_spec.rb
0	51	spec/code_maat_client/analysis_types/refactoring_main_dev_spec.rb
0	163	spec/code_maat_client/analysis_types/revisions_spec.rb
0	59	spec/code_maat_client/analysis_types/soc_spec.rb
0	129	spec/code_maat_client/analysis_types/summary_spec.rb
0	178	spec/code_maat_client/builders/result_builder_spec.rb
0	214	spec/code_maat_client/client_spec.rb
0	149	spec/code_maat_client/client_strategy_integration_spec.rb
0	189	spec/code_maat_client/configuration/analysis_configuration_spec.rb
0	195	spec/code_maat_client/executors/analysis_executor_spec.rb
0	117	spec/code_maat_client/factories/analysis_factory_spec.rb
0	86	spec/code_maat_client/infrastructure/csv_parser_spec.rb
0	154	spec/code_maat_client/infrastructure/jar_executor_spec.rb
0	97	spec/code_maat_client/strategies/analysis_strategy_spec.rb
0	80	spec/code_maat_client/validators/default_validator_spec.rb
0	98	spec/code_maat_client/validators/validator_factory_spec.rb
0	124	spec/code_maat_client/value_objects/analysis_options_spec.rb
0	91	spec/code_maat_client/value_objects/analysis_result_spec.rb
0	143	spec/code_maat_client/value_objects/execution_result_spec.rb
0	161	spec/integration/analysis_execution_integration_spec.rb

--50f9808--2025-06-26--Juan bigorra
7	2	Gemfile
41	1	Gemfile.lock
27	0	bin/tapioca
4	0	sorbet/config
1	0	sorbet/rbi/annotations/.gitattributes
269	0	sorbet/rbi/annotations/rainbow.rbi
1	0	sorbet/rbi/gems/.gitattributes
585	0	sorbet/rbi/gems/ast@2.4.3.rbi
619	0	sorbet/rbi/gems/benchmark@0.4.1.rbi
4794	0	sorbet/rbi/gems/csv@3.3.5.rbi
1134	0	sorbet/rbi/gems/diff-lcs@1.6.2.rbi
155	0	sorbet/rbi/gems/erubi@1.13.1.rbi
2051	0	sorbet/rbi/gems/json@2.12.2.rbi
9	0	sorbet/rbi/gems/language_server-protocol@3.17.0.5.rbi
240	0	sorbet/rbi/gems/lint_roller@1.1.0.rbi
963	0	sorbet/rbi/gems/logger@1.7.0.rbi
159	0	sorbet/rbi/gems/netrc@0.11.0.rbi
291	0	sorbet/rbi/gems/parallel@1.27.0.rbi
7254	0	sorbet/rbi/gems/parser@3.3.8.0.rbi
41732	0	sorbet/rbi/gems/prism@1.4.0.rbi
160	0	sorbet/rbi/gems/racc@1.8.1.rbi
403	0	sorbet/rbi/gems/rainbow@3.1.1.rbi
3039	0	sorbet/rbi/gems/rake@13.3.0.rbi
6893	0	sorbet/rbi/gems/rbi@0.3.6.rbi
6978	0	sorbet/rbi/gems/rbs@3.9.4.rbi
3795	0	sorbet/rbi/gems/regexp_parser@2.10.0.rbi
5240	0	sorbet/rbi/gems/rexml@3.4.1.rbi
11004	0	sorbet/rbi/gems/rspec-core@3.13.4.rbi
8189	0	sorbet/rbi/gems/rspec-expectations@3.13.5.rbi
5350	0	sorbet/rbi/gems/rspec-mocks@3.13.5.rbi
1630	0	sorbet/rbi/gems/rspec-support@3.13.4.rbi
83	0	sorbet/rbi/gems/rspec@3.13.1.rbi
7853	0	sorbet/rbi/gems/rubocop-ast@1.45.1.rbi
1369	0	sorbet/rbi/gems/rubocop-capybara@2.22.1.rbi
956	0	sorbet/rbi/gems/rubocop-factory_bot@2.27.1.rbi
8280	0	sorbet/rbi/gems/rubocop-rspec@2.31.0.rbi
911	0	sorbet/rbi/gems/rubocop-rspec_rails@2.29.1.rbi
62565	0	sorbet/rbi/gems/rubocop@1.76.2.rbi
1318	0	sorbet/rbi/gems/ruby-progressbar@1.13.0.rbi
6985	0	sorbet/rbi/gems/spoom@1.6.3.rbi
3628	0	sorbet/rbi/gems/tapioca@0.16.11.rbi
4378	0	sorbet/rbi/gems/thor@1.3.2.rbi
132	0	sorbet/rbi/gems/unicode-display_width@3.1.4.rbi
251	0	sorbet/rbi/gems/unicode-emoji@4.0.4.rbi
435	0	sorbet/rbi/gems/yard-sorbet@0.9.0.rbi
18379	0	sorbet/rbi/gems/yard@0.9.37.rbi
7	0	sorbet/rbi/todo.rbi
13	0	sorbet/tapioca/config.yml
4	0	sorbet/tapioca/require.rb

--ed30209--2025-06-25--Juan bigorra
2	0	.gitignore

--196106a--2025-06-20--Juan bigorra
1	1	Gemfile.lock
-	-	code_maat_client-1.0.0.gem
1	1	code_maat_client.gemspec

--9bc75c4--2025-06-20--Juan bigorra
10	2	spec/code_maat_client/factories/analysis_factory_spec.rb

--87a3fba--2025-06-20--Juan bigorra
8	1	lib/code_maat_client/builders/result_builder.rb
2	1	lib/code_maat_client/factories/executor_factory.rb
5	9	spec/code_maat_client/analysis_types/age_spec.rb
31	35	spec/code_maat_client/analysis_types/authors_spec.rb
5	8	spec/code_maat_client/analysis_types/coupling_spec.rb
5	9	spec/code_maat_client/analysis_types/entity_churn_spec.rb
5	9	spec/code_maat_client/analysis_types/revisions_spec.rb
5	8	spec/code_maat_client/analysis_types/summary_spec.rb
50	23	spec/code_maat_client/builders/result_builder_spec.rb
9	18	spec/integration/analysis_execution_integration_spec.rb
0	170	spec/integration/composition_architecture_integration_spec.rb

--c23835f--2025-06-20--Juan bigorra
1	0	.mailmap
2	0	Gemfile.lock
122	44	README.md
7	5	code_maat_client.gemspec

--66c5d8a--2025-06-20--Juan bigorra
40	0	docs/wiki/Home.md
81	0	docs/wiki/Installation-and-Setup.md
98	0	docs/wiki/Your-First-Analysis.md
2	0	lib/code_maat_client.rb
13	0	lib/code_maat_client/errors/csv_parse_error.rb
10	0	lib/code_maat_client/errors/csv_validation_error.rb
23	2	lib/code_maat_client/infrastructure/csv_parser.rb
86	0	spec/code_maat_client/infrastructure/csv_parser_spec.rb

--6a8a481--2025-06-20--Juan bigorra
26	64	lib/code_maat_client.rb
1	0	lib/code_maat_client/analysis_types/abs_churn.rb
1	0	lib/code_maat_client/analysis_types/age.rb
1	0	lib/code_maat_client/analysis_types/author_churn.rb
1	0	lib/code_maat_client/analysis_types/authors.rb
1	0	lib/code_maat_client/analysis_types/communication.rb
1	0	lib/code_maat_client/analysis_types/coupling.rb
1	0	lib/code_maat_client/analysis_types/entity_churn.rb
1	0	lib/code_maat_client/analysis_types/entity_effort.rb
1	0	lib/code_maat_client/analysis_types/entity_ownership.rb
1	0	lib/code_maat_client/analysis_types/fragmentation.rb
71	5	lib/code_maat_client/analysis_types/identity.rb
1	0	lib/code_maat_client/analysis_types/main_dev.rb
1	0	lib/code_maat_client/analysis_types/main_dev_by_revs.rb
1	0	lib/code_maat_client/analysis_types/messages.rb
1	0	lib/code_maat_client/analysis_types/refactoring_main_dev.rb
1	0	lib/code_maat_client/analysis_types/revisions.rb
2	0	lib/code_maat_client/analysis_types/soc.rb
1	0	lib/code_maat_client/analysis_types/summary.rb
68	0	lib/code_maat_client/factories/analysis_factory.rb
72	0	lib/code_maat_client/strategies/analysis_strategy.rb
1	1	spec/code_maat_client/client_spec.rb
149	0	spec/code_maat_client/client_strategy_integration_spec.rb
109	0	spec/code_maat_client/factories/analysis_factory_spec.rb
97	0	spec/code_maat_client/strategies/analysis_strategy_spec.rb

--20b8c52--2025-06-19--Juan bigorra
222	15	lib/code_maat_client.rb
0	21	lib/code_maat_client/client.rb
214	0	spec/code_maat_client/client_spec.rb

--aaa76fd--2025-06-19--Juan bigorra
12	0	lib/code_maat_client.rb
53	0	lib/code_maat_client/analysis_types/abs_churn.rb
55	0	lib/code_maat_client/analysis_types/author_churn.rb
45	0	lib/code_maat_client/analysis_types/communication.rb
55	0	lib/code_maat_client/analysis_types/entity_effort.rb
45	0	lib/code_maat_client/analysis_types/entity_ownership.rb
45	0	lib/code_maat_client/analysis_types/fragmentation.rb
45	0	lib/code_maat_client/analysis_types/identity.rb
46	0	lib/code_maat_client/analysis_types/main_dev.rb
47	0	lib/code_maat_client/analysis_types/main_dev_by_revs.rb
45	0	lib/code_maat_client/analysis_types/messages.rb
51	0	lib/code_maat_client/analysis_types/refactoring_main_dev.rb
51	0	lib/code_maat_client/analysis_types/soc.rb
121	1	lib/code_maat_client/configurations/analysis_configurations.rb
44	0	spec/code_maat_client/analysis_types/abs_churn_spec.rb
52	0	spec/code_maat_client/analysis_types/author_churn_spec.rb
52	0	spec/code_maat_client/analysis_types/communication_spec.rb
36	0	spec/code_maat_client/analysis_types/entity_effort_spec.rb
72	0	spec/code_maat_client/analysis_types/entity_ownership_spec.rb
45	0	spec/code_maat_client/analysis_types/fragmentation_spec.rb
55	0	spec/code_maat_client/analysis_types/identity_spec.rb
43	0	spec/code_maat_client/analysis_types/main_dev_by_revs_spec.rb
107	0	spec/code_maat_client/analysis_types/main_dev_spec.rb
55	0	spec/code_maat_client/analysis_types/messages_spec.rb
51	0	spec/code_maat_client/analysis_types/refactoring_main_dev_spec.rb
59	0	spec/code_maat_client/analysis_types/soc_spec.rb

--ab90ab1--2025-06-19--Juan bigorra
1	0	lib/code_maat_client.rb
155	0	lib/code_maat_client/analysis_types/age.rb
13	1	lib/code_maat_client/configurations/analysis_configurations.rb
315	0	spec/code_maat_client/analysis_types/age_spec.rb

--1aba4b1--2025-06-19--Juan bigorra
1	0	lib/code_maat_client.rb
134	0	lib/code_maat_client/analysis_types/entity_churn.rb
13	1	lib/code_maat_client/configurations/analysis_configurations.rb
250	0	spec/code_maat_client/analysis_types/entity_churn_spec.rb

--80ed95f--2025-06-19--Juan bigorra
-	-	code_maat_client-1.0.0.gem
2	1	lib/code_maat_client.rb
82	0	lib/code_maat_client/analysis_types/authors.rb
0	89	lib/code_maat_client/analysis_types/base.rb
87	0	lib/code_maat_client/analysis_types/coupling.rb
35	6	lib/code_maat_client/analysis_types/revisions.rb
26	22	lib/code_maat_client/analysis_types/summary.rb
25	1	lib/code_maat_client/configurations/analysis_configurations.rb
196	0	spec/code_maat_client/analysis_types/authors_spec.rb
151	0	spec/code_maat_client/analysis_types/coupling_spec.rb
1	1	spec/code_maat_client/analysis_types/revisions_spec.rb
1	1	spec/code_maat_client/analysis_types/summary_spec.rb

--fe65bd3--2025-06-19--Juan bigorra
-	-	code_maat_client-1.0.0.gem
2	0	lib/code_maat_client.rb
15	0	lib/code_maat_client/analysis_types/revisions.rb
15	0	lib/code_maat_client/analysis_types/summary.rb
59	0	lib/code_maat_client/configurations/analysis_configurations.rb
31	0	lib/code_maat_client/factories/executor_factory.rb
170	0	spec/integration/analysis_execution_integration_spec.rb
170	0	spec/integration/composition_architecture_integration_spec.rb

--2020b01--2025-06-19--Juan bigorra
5	0	lib/code_maat_client.rb
34	0	lib/code_maat_client/builders/result_builder.rb
100	0	lib/code_maat_client/configuration/analysis_configuration.rb
74	0	lib/code_maat_client/executors/analysis_executor.rb
23	0	lib/code_maat_client/validators/default_validator.rb
68	0	lib/code_maat_client/validators/validator_factory.rb
151	0	spec/code_maat_client/builders/result_builder_spec.rb
189	0	spec/code_maat_client/configuration/analysis_configuration_spec.rb
195	0	spec/code_maat_client/executors/analysis_executor_spec.rb
80	0	spec/code_maat_client/validators/default_validator_spec.rb
98	0	spec/code_maat_client/validators/validator_factory_spec.rb

--0b811ef--2025-06-19--Juan bigorra
-	-	code_maat_client-1.0.0.gem
43	0	lib/code_maat_client.rb
89	0	lib/code_maat_client/analysis_types/base.rb
51	0	lib/code_maat_client/analysis_types/revisions.rb
69	0	lib/code_maat_client/analysis_types/summary.rb
21	0	lib/code_maat_client/client.rb
6	0	lib/code_maat_client/infrastructure/command_builder.rb
6	0	lib/code_maat_client/infrastructure/csv_parser.rb
3	0	lib/code_maat_client/version.rb
167	0	spec/code_maat_client/analysis_types/revisions_spec.rb
132	0	spec/code_maat_client/analysis_types/summary_spec.rb

--d2dcd18--2025-06-19--Juan bigorra
20	0	CHANGELOG.md
11	0	Gemfile
80	0	Gemfile.lock
86	0	README.md
11	0	Rakefile
27	0	code_maat_client.gemspec
4	0	lib/code_maat_client/errors/analysis_error.rb
4	0	lib/code_maat_client/errors/base_error.rb
4	0	lib/code_maat_client/errors/jar_not_found_error.rb
4	0	lib/code_maat_client/errors/java_not_found_error.rb
83	0	lib/code_maat_client/infrastructure/jar_executor.rb
82	0	lib/code_maat_client/value_objects/analysis_options.rb
63	0	lib/code_maat_client/value_objects/analysis_result.rb
68	0	lib/code_maat_client/value_objects/execution_result.rb
154	0	spec/code_maat_client/infrastructure/jar_executor_spec.rb
124	0	spec/code_maat_client/value_objects/analysis_options_spec.rb
91	0	spec/code_maat_client/value_objects/analysis_result_spec.rb
143	0	spec/code_maat_client/value_objects/execution_result_spec.rb
40	0	spec/spec_helper.rb
-	-	vendor/code-maat-1.0.4-standalone.jar
`;

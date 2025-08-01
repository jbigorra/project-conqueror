#!/bin/bash

# Copy the code-maat-1.0.4-standalone.jar file to the dist directory
# This is needed because the code-maat-1.0.4-standalone.jar file is not included in the package
# and is required to run the code_maat analysis
mkdir -p ./dist/infrastructure/code_maat/vendor
cp ./src/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar ./dist/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar

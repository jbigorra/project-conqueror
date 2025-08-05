#!/bin/bash

# Copy the code-maat-1.0.4-standalone.jar file to the dist directory
# This is needed because the code-maat-1.0.4-standalone.jar file is not included in the package
# and is required to run the code_maat analysis

pwd

echo "=== DEBUG: Checking file structure ==="
echo "Contents of src/infrastructure/code_maat/:"
ls -la src/infrastructure/code_maat/ || echo "Directory doesn't exist"

echo "Contents of src/infrastructure/code_maat/vendor/:"
ls -la src/infrastructure/code_maat/vendor/ || echo "Vendor directory doesn't exist"

echo "Searching for any .jar files in the entire package:"
find . -name "*.jar" -type f || echo "No JAR files found"

echo "=== END DEBUG ==="

echo "Creating dist/infrastructure/code_maat/vendor directory"
mkdir -p ./dist/infrastructure/code_maat/vendor

echo "Copying code-maat-1.0.4-standalone.jar to dist/infrastructure/code_maat/vendor"
cp ./src/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar ./dist/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar

echo "Done copying vendor files!!"

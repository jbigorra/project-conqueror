#! /bin/bash

# Pre-build dependencies between internal packages.
# NOTE: Avoid excesive use of dependencies between internal packages.
#       This is mostly used for shared types, generics and useful patterns that other packages can use.
turbo build --filter=@prj-conq/lib


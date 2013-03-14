#!/bin/bash

command -v java >/dev/null 2>&1 || { echo >&2 "I require java but it's not installed.  Aborting."; exit 1; }
echo "Compressing files"
java -jar compiler.jar --warning_level VERBOSE --generate_exports --use_types_for_optimization --compilation_level SIMPLE_OPTIMIZATIONS --externs ../js/externs/*.js --js ../js-packed/framebase-nightly.js > ../js-packed/framebase-test.js
sleep 1
echo "Done!"

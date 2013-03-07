#!/bin/bash

command -v node >/dev/null 2>&1 || { echo >&2 "I require nodejs but it's not installed.  Aborting."; exit 1; }
command -v java >/dev/null 2>&1 || { echo >&2 "I require java but it's not installed.  Aborting."; exit 1; }

echo "Creating pack directory"
rm -rf ../js-packed
mkdir ../js-packed
rm -rf ../js-inprogress
cp -R ../js ../js-inprogress
echo "Compiling files"
node r.js -o deploy-main.js
sleep 1 # Weird race condition
# Add license info
sed -i 's|\@license||g' ../js-inprogress/framebase.out.js
printf "/** @license (c) Framebase 2013 */\n\n" | cat - ../js-inprogress/framebase.out.js > /tmp/out && mv /tmp/out ../js-inprogress/framebase.out.js
echo "Compressing files"
# If you want to disable packing entirely for debugging, comment the java line, and uncomment this one
#cp ../js-inprogress/framebase.out.js ../js-packed/framebase.js
java -jar compiler.jar --warning_level VERBOSE --generate_exports --use_types_for_optimization --compilation_level SIMPLE_OPTIMIZATIONS --externs ../js/externs/*.js --js ../js-inprogress/framebase.out.js > ../js-packed/framebase.js
sleep 1
echo "Cleaning up"
rm -rf ../js-inprogress
echo "Done!"

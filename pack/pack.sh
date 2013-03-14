#!/bin/bash

command -v node >/dev/null 2>&1 || { echo >&2 "I require nodejs but it's not installed.  Aborting."; exit 1; }

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
cp ../js-inprogress/framebase.out.js ../js-packed/framebase-nightly.js
echo "Cleaning up"
rm -rf ../js-inprogress

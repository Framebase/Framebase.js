#!/bin/bash

./mv.sh
rm /mnt/framebase/www/assets/framebase-js/framebase.js
cp /mnt/framebase/www/assets/framebase-js/framebase-test.js /mnt/framebase/www/assets/framebase-js/framebase.js

#!/bin/bash

# To automatically restart the app on the server, we need to recreate the restart.txt file
# https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/

source .env
lftp -u $HAIFIVE_FTP_USER,$HAIFIVE_FTP_PASSWORD \
    $HAIFIVE_FTP_HOST \
    -e "set ftp:ssl-allow no; \
    mput -O $HAIFIVE_FTP_DESTINATION -P 2 package*.json; \
    put -O $HAIFIVE_FTP_DESTINATION runner.cjs; \
    mirror -R -P 10 ./build $HAIFIVE_FTP_DESTINATION; \
    rm -rf $HAIFIVE_FTP_DESTINATION/tmp; \
    mkdir -f $HAIFIVE_FTP_DESTINATION/tmp; \
    put -O $HAIFIVE_FTP_DESTINATION/tmp /dev/null -o restart.txt; \
    quit"

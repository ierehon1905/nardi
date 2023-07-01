#!/bin/bash

# To automatically restart the app on the server, we need to recreate the restart.txt file
# https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/

source .env
lftp -u $NARDY_FTP_USER,$NARDY_FTP_PASSWORD \
    $NARDY_FTP_HOST \
    -e "set ftp:ssl-allow no; \
    mirror -R -P 1 ./app-dist $NARDY_FTP_DESTINATION; \
    rm -rf $NARDY_FTP_DESTINATION/tmp; \
    mkdir -f $NARDY_FTP_DESTINATION/tmp; \
    put -O $NARDY_FTP_DESTINATION/tmp /dev/null -o restart.txt; \
    quit"

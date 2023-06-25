#!/bin/bash

source .env
lftp -u $HAIFIVE_FTP_USER,$HAIFIVE_FTP_PASSWORD \
    $HAIFIVE_FTP_HOST \
    -e "set ftp:ssl-allow no; \
    put -O $HAIFIVE_FTP_DESTINATION package.json; \
    put -O $HAIFIVE_FTP_DESTINATION package-lock.json; \
    put -O $HAIFIVE_FTP_DESTINATION runner.cjs; \
    mirror -R ./build $HAIFIVE_FTP_DESTINATION; quit"

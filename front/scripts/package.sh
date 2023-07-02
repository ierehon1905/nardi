#!/bin/bash

source ../.env
set -e

rm -rf package-dist

if [ "$1" == "preview" ]; then
  echo "Building preview"
  npm run build:preview
elif [ "$1" == "prod" ]; then
  echo "Building production"
  npm run build:prod
else
  echo "Building dev"
  npm run build
fi

cp -r build/ package-dist/
cp package*.json package-dist/
cp runner.cjs package-dist/

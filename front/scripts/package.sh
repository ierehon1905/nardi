#!/bin/bash

source ../.env
set -e

npm run build
cp -r build/ package-dist/
cp package*.json package-dist/
cp runner.cjs package-dist/

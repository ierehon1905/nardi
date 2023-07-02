rm -rf package-dist

if [ "$1" == "preview" ]; then
  echo "Building preview"
  npm run build
else
  echo "Building production"
    npm run build:linux
fi

rm -rf package-dist
mkdir package-dist
cp -r build/* package-dist
cp package.json package-dist
cp runner.cjs package-dist
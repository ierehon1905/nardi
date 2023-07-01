npm run build:linux
rm -rf package-dist
mkdir package-dist
cp -r build/* package-dist
cp package.json package-dist
cp runner.cjs package-dist
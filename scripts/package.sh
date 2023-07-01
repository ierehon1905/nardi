# remove the app-dist directory if it exists
rm -rf app-dist
# create the app-dist directory
mkdir app-dist
# copy front/package-dist to app-dist
cp -r front/package-dist app-dist/front
cp -r backend/package-dist app-dist/backend
cp package.json app-dist
cp app-runner.cjs app-dist
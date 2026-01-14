#!/usr/bin/env bash

# Get the current version
version=`node -e "console.log(require('./package.json').version)"`

# Year
year=$(date +'%Y')

# Set current working directory to src/
cd src/

# Create banner
banner="/*! hellojs v${version} - (c) 2012-${year} Andrew Dodson - MIT https://adodson.com/hello.js/LICENSE */";

echo "${banner}" > ../dist/hello.js
echo "${banner}" > ../dist/hello.min.js
echo "${banner}" > ../dist/hello.all.js
echo "${banner}" > ../dist/hello.all.min.js

# Merge all src files into dist/hello.js
cat hello.polyfill.js \
	hello.js \
	hello.chromeapp.js \
	hello.phonegap.js \
	hello.amd.js \
	hello.commonjs.js \
	>> ../dist/hello.js

# Merge all src files and modules into dist/hello.all.js
cat hello.polyfill.js \
	hello.js \
	hello.chromeapp.js \
	hello.phonegap.js \
	modules/dropbox.js \
	modules/facebook.js \
	modules/flickr.js \
	modules/foursquare.js \
	modules/github.js \
	modules/google.js \
	modules/instagram.js \
	modules/joinme.js \
	modules/linkedin.js \
	modules/soundcloud.js \
	modules/spotify.js \
	modules/twitter.js \
	modules/vk.js \
	modules/windows.js \
	modules/yahoo.js \
	hello.amd.js \
	hello.commonjs.js \
	>> ../dist/hello.all.js

# Uglify
uglifyjs ../dist/hello.js >> ../dist/hello.min.js
uglifyjs ../dist/hello.all.js >> ../dist/hello.all.min.js

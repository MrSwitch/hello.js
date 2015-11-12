#!/bin/bash
set -ev
grunt test
if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
	./node_modules/.bin/browserstack-runner
fi

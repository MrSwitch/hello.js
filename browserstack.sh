#!/bin/bash
if [ "${BROWSERSTACK_KEY}" ]; then
	./node_modules/.bin/browserstack-runner
else
	echo "Browserstack disabled: requires BROWSERSTACK_KEY and BROWSERSTACK_USERNAME env vars to be defined"
fi


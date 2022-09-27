#!/bin/bash

set -o errexit

printf "\n[-] Building Angular application bundle...\n\n"

printf "\n[-] Increasing Memory size for Node...\n\n"

export NODE_OPTIONS="--max-old-space-size=8192"

mkdir --parents $APP_BUNDLE_FOLDER/client

cd $APP_SOURCE_FOLDER

printf "\n[-] Building Meteor Client bundle...\n\n"

meteor npm run meteor-client:bundle

printf "\n[-] Building Angular bundle...\n\n"

meteor npm run prod

cp -R dist/* $APP_BUNDLE_FOLDER/client

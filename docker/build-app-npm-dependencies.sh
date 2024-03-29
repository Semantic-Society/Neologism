#!/bin/bash

set -o errexit

printf "\n[-] Installing app NPM dependencies...\n\n"

cd $APP_SOURCE_FOLDER

npm i --package-lock-only

meteor npm ci || meteor npm install # The latter is for older versions of Meteor that ship with npm < 5.7.0

mkdir --parents $APP_SOURCE_FOLDER/api/node_modules

cp -R node_modules/* $APP_SOURCE_FOLDER/api/node_modules
#!/bin/bash

set -o errexit

printf "\n[-] Building Angular application bundle...\n\n"

mkdir --parents $APP_BUNDLE_FOLDER/client

cd $APP_SOURCE_FOLDER

printf "\n[-] Building Meteor Client bundle...\n\n"

ROOT_URL=$METEOR_CLIENT_CONN_URL METEOR_BUNDLER_URL=$METEOR_CLIENT_CONN_URL  meteor npm run meteor-client:bundle-server

printf "\n[-] Building Angular bundle...\n\n"

meteor npm run prod

cp -R dist/* $APP_BUNDLE_FOLDER/client

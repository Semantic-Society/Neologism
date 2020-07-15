#!/bin/bash

set -o errexit

printf "\n[-] Building Meteor application bundle...\n\n"

mkdir --parents $APP_BUNDLE_FOLDER/api

cd $APP_SOURCE_FOLDER/api

meteor build --directory $APP_BUNDLE_FOLDER/api --server-only

#!/bin/bash

set -o errexit

cd $SCRIPTS_FOLDER

# Source an init script that a child image may have added
# if [ -x ./startup.sh ]; then
source ./updateMeteorBundleConfig.sh
# fi

# Poll until we can successfully connect to MongoDB
source ./connect-to-mongo.sh

# seed data into MongoDB
source ./mongoseed.sh

# ToDo create env.js using envsubset here with 


# echo 'Starting app...'
# cd $APP_BUNDLE_FOLDER/api/bundle

# service nginx start
# node main.js
exec /usr/bin/supervisord -c /etc/supervisord.conf

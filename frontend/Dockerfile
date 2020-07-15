# The tag here should match the Meteor version of your app, per .meteor/release
# Based on:
# - https://github.com/jshimko/meteor-launchpad/blob/master/Dockerfile
# - https://github.com/meteor/galaxy-images/blob/master/ubuntu/Dockerfile
FROM ubuntu

# Meteor version to build for; see ../build.sh
ENV METEOR_VERSION 1.8

ENV SCRIPTS_FOLDER /docker
ENV APP_SOURCE_FOLDER /opt/src
ENV APP_BUNDLE_FOLDER /opt/bundle

# Install dependencies, based on https://github.com/jshimko/meteor-launchpad/blob/master/scripts/install-deps.sh (only the parts we plan to use)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
	apt-get install --assume-yes apt-transport-https ca-certificates && \
	apt-get install --assume-yes --no-install-recommends build-essential bzip2 curl git libarchive-tools python

# Install Meteor
RUN curl https://install.meteor.com/?release=$METEOR_VERSION --output /tmp/install-meteor.sh && \
	# Replace tar with bsdtar in the install script; https://github.com/jshimko/meteor-launchpad/issues/39 and https://github.com/intel/lkp-tests/pull/51
	sed --in-place "s/tar -xzf.*/bsdtar -xf \"\$TARBALL_FILE\" -C \"\$INSTALL_TMPDIR\"/g" /tmp/install-meteor.sh && \
	# Install Meteor
	printf "\n[-] Installing Meteor $METEOR_VERSION...\n\n" && \
	sh /tmp/install-meteor.sh

# Fix permissions warning; https://github.com/meteor/meteor/issues/7959
ENV METEOR_ALLOW_SUPERUSER true


# Copy entrypoint and dependencies
COPY ./docker $SCRIPTS_FOLDER/

# Install Docker entrypoint dependencies; npm ci was added in npm 5.7.0, and therefore available only to Meteor 1.7+
RUN cd $SCRIPTS_FOLDER && \
	if bash -c "if [[ ${METEOR_VERSION} == 1.6* ]]; then exit 0; else exit 1; fi"; then \
		meteor npm install; \
	else \
		meteor npm ci; \
	fi

# No ONBUILD lines, because this is intended to be used by your app’s multistage Dockerfile and you might need control of the sequence of steps using files from this image


# Copy app package.json and package-lock.json into container

COPY ./package*.json $APP_SOURCE_FOLDER/


RUN bash $SCRIPTS_FOLDER/build-app-npm-dependencies.sh

# Copy app source into container
COPY . $APP_SOURCE_FOLDER/

RUN bash $SCRIPTS_FOLDER/build-meteor-bundle.sh

RUN bash $SCRIPTS_FOLDER/build-angular-bundle.sh

# Use the specific version of Node expected by your Meteor release, per https://docs.meteor.com/changelog.html; this is expected for Meteor 1.10.2
FROM node:8.11.4-alpine

ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker

# Install OS build dependencies, which stay with this intermediate image but don’t become part of the final published image
RUN apk --no-cache add \
	bash \
	g++ \
	make \
	python

# Copy in entrypoint
COPY --from=0 $SCRIPTS_FOLDER $SCRIPTS_FOLDER/

# Copy in app bundle
COPY --from=0 $APP_BUNDLE_FOLDER/api/bundle $APP_BUNDLE_FOLDER/api/bundle/

COPY --from=0 $APP_BUNDLE_FOLDER/client $APP_BUNDLE_FOLDER/client

RUN bash $SCRIPTS_FOLDER/build-meteor-npm-dependencies.sh --build-from-source


# Start another Docker stage, so that the final image doesn’t contain the layer with the build dependencies
# See previous FROM line; this must match
FROM node:8.11.4-alpine

ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker

# Install OS runtime dependencies
RUN apk --no-cache add \
	bash \
	ca-certificates \
	nginx \
	supervisor

RUN mkdir -p /run/nginx

# Copy in entrypoint with the built and installed dependencies from the previous image
COPY --from=1 $SCRIPTS_FOLDER $SCRIPTS_FOLDER/

# Copy in app bundle with the built and installed dependencies from the previous image
COPY --from=1 $APP_BUNDLE_FOLDER/api/bundle $APP_BUNDLE_FOLDER/api/bundle/

COPY --from=1 $APP_BUNDLE_FOLDER/client/frontend /usr/share/nginx/html

COPY $SCRIPTS_FOLDER/config/supervisord.conf /etc/

COPY $SCRIPTS_FOLDER/config/nginx.default.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT /usr/bin/supervisord -c /etc/supervisord.conf

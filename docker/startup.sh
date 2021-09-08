
#!/bin/bash

set -o errexit

#replacing bundle url with client

printf "\n[-] Running Entry Point Script...\n\n"
echo $CDDP_URL
echo $CROOT_URL

sed --in-place "s+\"DDP_DEFAULT_CONNECTION_URL\": \".*\"+\"DDP_DEFAULT_CONNECTION_URL\": \"$CDDP_URL\"+g" /usr/share/nginx/html/vendor*.js

sed --in-place "s+\"ROOT_URL\": \".*\"+\"ROOT_URL\": \"$CROOT_URL\"+g" /usr/share/nginx/html/vendor*.js

#!/bin/bash

set -o errexit

#replacing bundle url with client
if [ -e "${SCRIPTS_FOLDER}/.clientconfig" ]  
then  
  printf "\nWARNING"
  printf "\n==========\n"
  printf "Client already configured!\n"
  printf "If you want to remove and reconfigure run 'rm /scripts/.clientconfig'\n\n"
else  
    printf "\nConfiguring URL\n==========================\n"
    printf "===================================================\n"
    printf "\n[-] Running Entry Point Script...\n\n"
    
    echo $METEOR_CLIENT_CONFIG_URL
    
    sed --in-place "s+DDP_DEFAULT_CONNECTION_URL:\"http://localhost:3000\"+DDP_DEFAULT_CONNECTION_URL:\"$METEOR_CLIENT_CONFIG_URL\"+g" /usr/share/nginx/html/scripts*.js

    sed --in-place "s+ROOT_URL:\"http://localhost:3000\"+ROOT_URL: \"$METEOR_CLIENT_CONFIG_URL\"+g" /usr/share/nginx/html/scripts*.js
  touch $SCRIPTS_FOLDER/.clientconfig
  printf "\nDONE!\n"
fi 
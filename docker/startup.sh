
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
    
    echo $CDDP_URL
    
    echo $CROOT_URL
    
    sed --in-place "s+DDP_DEFAULT_CONNECTION_URL:\"http://localhost/api\"+DDP_DEFAULT_CONNECTION_URL:\"$CDDP_URL\"+g" /usr/share/nginx/html/scripts*.js

    sed --in-place "s+ROOT_URL:\"http://localhost\"+ROOT_URL: \"$CROOT_URL\"+g" /usr/share/nginx/html/scripts*.js
  touch $SCRIPTS_FOLDER/.clientconfig
  printf "\nDONE!\n"
fi 
#!/bin/bash

set -o errexit

if [ -e "${SCRIPTS_FOLDER}/.seeddata" ]  
then  
  printf "\nWARNING"
  printf "\n==========\n"
  printf "Data already seeded!\n"
  printf "If you want to remove and reseed, run 'rm /scripts/.seeddata'\n\n"
else  
    printf "\nImporting Document in Database\n"
    printf "===================================================\n"
    mongoimport --uri $MONGO_URL --collection users --file $SCRIPTS_FOLDER/guest.json
  touch $SCRIPTS_FOLDER/.seeddata
  printf "\nDONE!\n"
fi 

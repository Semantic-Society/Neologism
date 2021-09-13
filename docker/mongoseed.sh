#!/bin/bash

set -o errexit

if [ -e "${SCRIPTS_FOLDER}/.seeddata" ]  
then  
  printf "\nWARNING"
  printf "\n==========\n"
  printf "Data already seeded!\n"
  printf "If you want to remove and reseed, run 'rm /scripts/.seeddata'\n\n"
else  
    printf "\nREMOVING Sample Database\n==========================\n"
    #mongo meteor --eval "db.dropDatabase()"
    printf "\nImporting Documents in a new Database called Sample\n"
    printf "===================================================\n"
    mongoimport $MONGO_URL --db meteor --collection users --file $SCRIPTS_FOLDER/guest.json --jsonArray
  touch $SCRIPTS_FOLDER/.seeddata
  printf "\nDONE!\n"
fi 


# #!/bin/bash

# set -o errexit

# cd $SCRIPTS_FOLDER

# if [ -n "${MONGO_URL:-}" ]; then # Check for MongoDB connection if MONGO_URL is set
# 	# Poll until we can successfully connect to MongoDB
# 	echo 'Connecting to MongoDB...'
# 	node <<- 'EOJS'
# 	const mongoClient = require('mongodb').MongoClient;
# 	const assert = require('assert');
# 	setInterval(function() {
# 		mongoClient.connect(process.env.MONGO_URL, function(err, client) {
# 			if (client) {
# 				const filter={ emails:"guest@neologism.com"}
# 				const coll = client.db('meteor').collection('users');
# 					coll.find(filter, (cmdErr, result) => {
# 					assert.equal(null, cmdErr);
# 					var doc = result.hasNext() ? result.next() : null;
# 					if(!doc){
# 						coll.insertOne({
# 										"services": {
# 											"password": {
# 											"bcrypt": "$2a$10$lP9ocByzDWN8IYDwVoB4/eXhxrgvny6c2KgZaOZYYi7JO3c6VrhDS"
# 											},
# 											"resume": {
# 											"loginTokens": []										
# 											}
# 										},
# 										"emails": [
# 											{
# 											"address": "guest@neologism.com",
# 											"verified": false
# 											}]
# 										})
# 					}
# 					});
				
# 			}
# 			if (err) {
# 				console.error(err);
# 			} else {
# 				process.exit(0);
# 			}
# 		});
# 	}, 1000);
# 	EOJS
# fi

#!/bin/bash

set -o errexit

cd $SCRIPTS_FOLDER

if [ -n "${MONGO_URL:-}" ]; then # Check for MongoDB connection if MONGO_URL is set
	# Poll until we can successfully connect to MongoDB
	echo 'Connecting to MongoDB...'
	node <<- 'EOJS'
	const mongoClient = require('mongodb').MongoClient;
	setInterval(function() {
		mongoClient.connect(process.env.MONGO_URL, function(err, client) {
			if (client) {
				const filter={ emails:"guest@neologism.com"}
				const coll = client.db('meteor').collection('users');
					coll.find(filter, (cmdErr, result) => {
					assert.equal(null, cmdErr);
					if(result.toArray()==[]){
						coll.insertOne({
										"createdAt": {
											"$date": "2021-06-06T11:16:19.790Z"
										},
										"services": {
											"password": {
											"bcrypt": "$2a$10$lP9ocByzDWN8IYDwVoB4/eXhxrgvny6c2KgZaOZYYi7JO3c6VrhDS"
											},
											"resume": {
											"loginTokens": []										
											}
										},
										"emails": [
											{
											"address": "guest@neologism.com",
											"verified": false
											}]
										})
					}
					});
				client.close();
			}
			if (err) {
				console.error(err);
			} else {
				process.exit(0);
			}
		});
	}, 1000);
	EOJS
fi

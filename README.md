# Frontend

## Architecture overview
[Neologism architecture diagram](https://drive.google.com/file/d/1kQOoR5Egi8TAk_P-l9mEZVdkiu2BeH0x/view?usp=sharing)


![neologism architecture](NeologismArchitecture.png "Neologism architecture")

## Installation

__Easy usage via Docker:__
1. Run `docker build` from within the `frontend` folder.
2. `docker-compose build`
3. `docker-compose up`

__Custom setup:__
1. Clone the repository
2. Install meteor using `curl https://install.meteor.com/ | sh`
3. Install mongo from https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
4. Install node version manager from https://github.com/nvm-sh/nvm
5. Set node version to 10.15.0
6. Run `npm install` in the `frontend` folder
7. Run the meteor bundler (see below)
  - Initially & every time you make a change to the server code (which affects the client side code), rebundle the meteor client side code by running `npm run meteor-client:bundle`.
  - Run `npm run api` to start a local meteor server (running on `http://localhost:3000/` with a connection to a local mongodb at port `3001`).
  - Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
  - Find detail for the Angular/Meteor integration here: https://github.com/Urigo/angular-meteor/tree/master/examples/AngularCLI


## Usage
After starting Neologism, navigate to `localhost` (or whatever server you are hosting it on), and follow the user interface.

## MongoDB Schema

### Class (classes)
```
{
   "_id":"autogenerated",
   "name":"string",
   "description":"string",
   "URI":"string",
   "properties":[
      "property_id"
   ],
   "position":{
      "x":"number",
      "y":"number"
   },
   "skos":{
      "closeMatch":[

      ],
      "exactMatch":[

      ]
   }
}
```

### Property (properties)
```
{
   "_id":"autogenerated",
   "name":"string",
   "description":"string",
   "URI":"string",
   "range":"class_id"
}
```
### Vocabulary (vocabularies)
```
{
   "_id":"autogenerated",
   "name":"string",
   "description":"string",
   "URI":"string",
   "properties":[
        "property_id"
   ],
   "position":{
      "x":"number",
      "y":"number"
   },
   "skos":{
      "closeMatch":[

      ],
      "exactMatch":[

      ]
   }
}
```
### User (users)
```
{
   "_id":"autogenerated",
   "createdAt":{
      "$date":"ISODate"
   },
   "services":{
      "password":{
         "bcrypt":"autogenerated"
      },
      "resume":{
         "loginTokens":[
            {
               "when":{
                  "$date":"ISODate"
               },
               "hashedToken":"autogenerated"
            },
            {
               "when":{
                  "$date":"ISODate"
               },
               "hashedToken":"autogenerated="
            }
         ]
      }
   },
   "emails":[
      {
         "address":"string@email",
         "verified":"boolean"
      }
   ]
}
```

# How to cite

We are currently preparing a scientific paper for a peer-reviewed publication. Please refer to [references.bib](references.bib) for BibTex references, which we will continuously update. 
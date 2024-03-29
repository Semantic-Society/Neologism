# Neologism 2.0

Neologism 2.0 is an open-source tool for quick vocabulary creation through domain experts.
Its guided vocabulary creation and its collaborative graph editor enable the quick creation of proper vocabularies, even for non-experts, and dramatically reduces the time and effort to draft vocabularies collaboratively.
An RDF export allows quick bootstrapping of any other Semantic Web tool.


## Usage (Live Demo)

We provide a [live demo version](http://cloud33.dbis.rwth-aachen.de/dashboard) of Neologism 2.0, which can be used as a guest without registration. If our live demo is unavailable, you could also try [Onto4ALL](https://onto4all.com/).
Additionally, [this short video](https://youtu.be/5IwOZ8eqoKE) shows the vocabulary creation and exporting process, including subsequent editing in WebProtégé.

![img.png](screenshot01.png)

The dashboard shows all created vocabularies and allows creating, editing, deleting, and exporting vocabularies.
Please note that the guest account can only create 10 vocabularies to reduce database load.

![img.png](screenshot02.png)

A graphical editor helps users creating vocabularies visually in an interactive mode.
Note that all ontology URIs (identifiers) are automatically created for simplicity and user convenience.

![img.png](screenshot03.png)

Clicking on nodes (classes) allows creating properties between classes.

![img.png](screenshot04.png)

An RDF (turtle) export allows quick bootstrapping of any other Semantic Web tool.
We suggest using Neologism 2.0 for creating early vocabulary drafts and importing its RDF export into Protégé for subsequent refinements by Semantic Web experts, which can finally yield fully-featured ontologies.

## Architecture Overview

Neologism 2.0’s frontend communicates with a backend to persist information,
and might interact with a recommender to improve the quality of drafted vocabularies.

![neologism architecture](assets/NeologismArchitecture.png "Neologism architecture")

## Getting Started
<!-- 
__Easy usage via Docker Image Build:__
1.  `docker-compose up`
__Easy usage via Docker Building Image on Local:__
1.  `docker-compose build`
3. `docker-compose up` -->

__Deploy via Docker Image Run Instructions Local:__

Default Ports to be used: 80, 3000

1. Set the environnement vars `METEOR_CLIENT_CONFIG_URL: {complete-server-url}` in docker-compose-yml
2. exec `docker-compose up`

##### Note:
To disable signup/register please update the var with `forbidClientAccountCreation: true` on the string `METEOR_SETTINGS: '{ "storageLocation":"/etc/neologism/uploads/vocabularies","forbidClientAccountCreation" :"true" }'` in docker-compose-yml

__Local setup:__

Installations required: 

- [Meteor, Node](https://docs.meteor.com/install.html). Otherwise tested versions can be found in below sections.
- Install /Download nginx for CORS (Linux: `sudo apt-get install nginx` Arch: `sudo pacman -S nginx` Windows: http://nginx.org/en/docs/windows.html) (On Windows move the folder to C:\)
<!--
- Edit the `nginx.conf` file by including the path of the sites-enabled folder. For Windows the path to the .com file: 

```
{
http {
    include       mime.types;
    default_type  application/octet-stream;
	include 	"C:/nginx-1.19.6/sites-enabled/neologism.com";
	...
}

```
-->

1. Clone the repository
2. Create env.js file in `app/src/assets/env.js`. This sets the guest user credentials: Please paste the default configuration code:

```
(function(window) {
    window["env"] = window["env"] || {};
  
    // Environment variables
    window["env"]["guser"] = "guest@neologism.com";
    window["env"]["gpass"] = "12345";
    window["env"]["gMaxlength"] = "2";
  })(this);
```

3. Create a `sites-enabled` folder inside the nginx folder (Linux: /etc/nginx/sites-enabled).
4. Put the [neologism.com](nginx/neologism.com) file inside this folder.
4. Install node modules using `npm i` in app and subfolder api
5. Set ENV variable as shown in example.env file in the app root
6. Run `npm run meteor-client:bundle` in the app folder
7. Import guest user document generated using cmd `node generateCredentials.js  guest@neologism.com 12345`  in the utils folder using any mongodb interface
8. Navigate to the app
10. Run `npm run api` to start a local meteor server (running on http://localhost:3000/ with a connection to a local MongoDB at port 3001).
11. Run `npm run start` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.
12. Optional: If you need to run the recommender, install an AddOn for your browser to allow CORS, as configurations need to be done

__TEST IF THE RECOMMENDER WORKS PROPERLY__

- Run `curl -v -d @test-recommender-request.json http://localhost:8080/recommender/batchRecommender -H "Content-Type:application/json"` and inspect the result.

__DISCLAIMER:__
The steps above are valid to run in Ubuntu focal

__NOTE:__
- Initially & every time you make a change to the server code (which affects the client-side code), rebundle the meteor client-side code by running `npm run meteor-client:bundle`.
- Find more details for the Angular/Meteor integration here: https://github.com/Urigo/angular-meteor/tree/master/examples/AngularCLI


__Major Versions:__
- Angular 12.0.4
- Meteor 2.2
- Node 14.17.0

__Troubleshooting:__
- check if node version compatibility for front and api
- run `meteor npm -v` or `meteor node -v
- For slow run of meteor on windows turn on the profiler see link https://github.com/meteor/meteor/issues/7253

## Technical Workflow
After starting Neologism, navigate to `localhost` (or whatever server you are hosting it on), and follow the user interface.

## MongoDB Schema

### Class (classes)
```
{
   "_id":"autogenerated",
   "name":"string",
   "description":"string",
   "isDataTypeVertex": "boolean"
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
   "range":"class_id | xsdDataTypes",
   "type":"owl:ObjectProperty | owl:DatatypeProperty"
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

We are currently preparing a scientific paper for a peer-reviewed publication. Please refer to [references.bib](references.bib) for BibTex references, which we will update continuously.

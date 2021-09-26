var bcrypt = require('bcryptjs');
var hash = require('crypto').createHash('sha256');

const salt = bcrypt.genSaltSync(10);

const args = process.argv.slice(2);

data = hash.update(args[1], 'utf-8');

var hash = bcrypt.hashSync(data.digest('hex'), salt);


const creds = `{
    "services": {
        "password": {
            "bcrypt": "${hash}"
        },
        "resume": {
            "loginTokens": [
            ]
        }
    },
    "emails": [
        {
            "address": "${args[0]}",
            "verified": false
        }
    ]
}`

console.log(creds)

return;
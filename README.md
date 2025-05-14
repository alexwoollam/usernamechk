# Username Check Microservice Example
This is a basic microservice setup for checking if a username is available. It uses a few different services tied together with RabbitMQ and follows an inbox/outbox messaging pattern. It also throws in some AI-powered username suggestions if your dream handle is taken.

# How it works
## Gateway
This is the entry point - the API you'll actually call.

POST to:
http://localhost:8080/username-check

with a JSON body like this:
{
  "username": "alexjames"
}
This kicks off the process...

you'll get a respone of something like:
{
    "username": "alexjames",
    "available": false,
    "check_type": "existsInBloom",
    "suggestions": [
        "AlexNinjaJames",
        "JamesRocketeer",
        "AdventureAlexJazz"
    ]
}

# Message Relay
This service takes the incoming request from the Gateway and pops it onto a RabbitMQ queue. Classic inbox/outbox pattern so things stay decoupled and you can retry stuff if needed.

# UsernameChecker
Picks up the message from the queue and checks if the username is available.

First checks a cache for speed

Then checks a Bloom filter

Then falls back to the database if needed

All about speed and not hammering the DB unless we have to.

# UsernameSuggester
If the username is taken, this service calls OpenAI to come up with some alternative suggestions. (OpenAI token needed for this)

# Setup notes
All services are separate and can be run individually

RabbitMQ must be up and running

Gateway is on port 8080

Suggest keeping the services Dockerised for easy running

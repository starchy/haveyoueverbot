var restclient = require('node-restclient');
var Twit = require('twit');
var config = require("./config.json");

// Add your Twitter and Wordnik API info to config.json
var API_KEY = config.API_KEY;
var consumer_key = config.consumer_key;
var consumer_secret = config.consumer_secret;
var access_token = config.access_token; 
var access_token_secret = config.access_token_secret;

var T = new Twit({
      consumer_key:     consumer_key, 
      consumer_secret:  consumer_secret,
      access_token:     access_token,
      access_token_secret: access_token_secret
});

var statement =   "";

// insert your Wordnik API info below
var getVerbURL = "https://api.wordnik.com/v4/words.json/randomWord\?hasDictionaryDef\=true\&includePartOfSpeech\=verb-intransitive\&minCorpusCount\=0\&maxCorpusCount\=-1\&minDictionaryCount\=1\&minLength\=5\&maxLength\=-1\&api_key\=" + API_KEY;

function makeQuestion() {
  statement = "";
  restclient.get(getVerbURL,

  function(data) {
    odds = Math.floor(Math.random() * (10 - 1 + 1) + 1);
    if (odds == 1)
      statement += "Tell me something, my friend: ";
    statement += "You ever " + data.word + " with the devil in the pale moonlight?";

    console.log(statement);
    
    T.post('statuses/update', { status: statement}, function(err, reply) {
        if(err) console.error("error: " + err);
        });
      }
  ,"json");
}

function favRTs () {
  T.get('statuses/retweets_of_me', {}, function (e,r) {
    for(var i=0;i<r.length;i++) {
      T.post('favorites/create/'+r[i].id_str,{},function(){});
    }
    console.log('harvested some RTs'); 
  });
}

// At startup, make and tweet a question
// wrapped in a try/catch in case Twitter is unresponsive, don't really care about error
// handling. it just won't tweet.
try {
  makeQuestion();
}
catch (e) {
  console.log(e);
}

// every 20 minutes, make and tweet a question
// wrapped in a try/catch in case Twitter is unresponsive, don't really care about error
// handling. it just won't tweet.
setInterval(function() {
  try {
    makeQuestion();
  }
 catch (e) {
    console.log(e);
  }
}, parseInt(config.interval) >= 120000 ? parseInt(config.interval) : 1200000;

// every 5 hours, check for people who have RTed a metaphor, and favorite that metaphor
setInterval(function() {
  try {
    favRTs();
  }
 catch (e) {
    console.log(e);
  }
},60000*60*5);

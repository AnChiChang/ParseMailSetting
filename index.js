// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieSession = require('cookie-session');


//for router use
var indexRouter = require('./routers/index'); //product introduct, login
var productRouter = require('./routers/product');  //product management
var groupRouter = require('./routers/group');  //group management
var orderRouter = require('./routers/order');  //order management


var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}


var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://192.168.200.45:27017/groupbuy',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'AAAA',
  masterKey: process.env.MASTER_KEY || 'BBB', //Add your master key here. Keep it secret!
  //javascriptKey: process.env.JAVASCRIPT_KEY || '',
  serverURL: process.env.SERVER_URL || 'http://192.168.200.45:1111/parse',  // Don't forget to change to https if needed
  oauth: {
   // twitter: {
   //   consumer_key: "", // REQUIRED
   //   consumer_secret: "" // REQUIRED
   // },
   facebook: {
     appIds: "xxxx"
   }
  },
  liveQuery: {
    classNames: ['Chat']
  },
  //mail server setting
  verifyUserEmails: true,
  emailVerifyTokenValidityDuration: 2 * 60 * 60,
  preventLoginWithUnverifiedEmail: false,
  publicServerURL: 'http://192.168.200.45:1111',
  appName: 'GroupBuy',
  emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter', //parse-server-mailgun-adapter-template
    options: {
      // The address that your emails come from
      fromAddress: 'no-reply@mydomain.com',
      // Your domain from mailgun.com
      domain: 'domain.mailgun',
      // Your API key from mailgun.com
      apiKey: 'key-FromMailGun'
    }
  }
});

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey
var app = express();


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     
  extended: true
})); 

app.use(cookieSession({
  name: "mydomain",
  secret: "aaaa",
  maxAge: 15724800000
}));
// Parse Server plays nicely with the rest of your web routes

app.use('/', indexRouter);
app.use('/product', productRouter); //for product management
app.use('/group', groupRouter); //for group management
app.use('/order', orderRouter); //for order management


var port = process.env.PORT || 1111;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('server on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
---
title: HelloJS
layout: default
---
<link rel="source" href="README.md"/>

<!-- Open Graph -->
<meta property="og:title" content="hello.js - JavaScript API for OAuth2 authentication and RESTful services" />
<meta property="og:url" content="http://adodson.com/hello.js" />
<meta property="og:type" content="website" />
<meta property="og:description" content="A client-side JavaScript SDK for authenticating with OAuth2 (and OAuth 1 with an 'oauth proxy') web services and querying their REST APIs. HelloJS standardizes paths and responses to common APIs like Google Data Services, Facebook Graph and Windows Live Connect. It's modular, so that list is growing. No more spaghetti code!" />
<meta property="og:image" content="assets/favicon.ico" />

<!-- Twitter Card -->
<meta name="twitter:hashtag" content="hellojs" /><!-- i made this up -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@setData" />
<meta name="twitter:creator" content="@setData" />

<script src="demos/client_ids.js"></script>
<script src="./dist/hello.all.js"></script>

{% include_relative README.md %}

<script src="assets/knockout/dist/knockout.js"></script>
<script src="assets/index.js"></script>
<script type="text/html" id="tests-template"></script>

<script>

// Initiate the library
hello.init(CLIENT_IDS_ALL, {
	redirect_uri: 'redirect.html',
	oauth_proxy: OAUTH_PROXY_URL
});

getText('assets/test_network.html', function(response) {
	document.getElementById('tests-template').text = response;
	// Knockout binding goes here
	ko.applyBindings(model);
});


</script>

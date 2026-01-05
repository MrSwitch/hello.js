(function(hello) {

    hello.init({
        yahoo: {
            // Updated to modern OAuth 2.0 authentication flow
            oauth: {
                version: 2,
                auth: 'https://api.login.yahoo.com/oauth2/request_auth',
                grant: 'https://api.login.yahoo.com/oauth2/get_token'
            },

            // Modern Yahoo API requires a different scope format
            scope: {
                basic: 'openid profile email'
            },
            
            // The `base` URL now points to the new user info endpoint.
            base: 'https://api.login.yahoo.com/openid/v1/userinfo',

            // Login handler
            login: function(p) {
                // Yahoo requires the state param to be base 64 encoded.
                p.qs.base64_state = true;
            },

            // API methods to get user data
            get: {
                me: 'https://api.login.yahoo.com/openid/v1/userinfo'
            },
            
            // Wrapper to handle the new data format from the `userinfo` endpoint
            wrap: {
                me: formatUser
            }
        }
    });

    // Helper function to format user data
    function formatUser(o) {
        if (o.sub) {
            o.id = o.sub;
            o.name = o.name;
            o.first_name = o.given_name;
            o.last_name = o.family_name;
            o.email = o.email;
            o.thumbnail = o.picture;
        }
        return o;
    }

})(hello);
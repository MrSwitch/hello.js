(function(hello) {

    hello.init({

        joinme : {

            name : 'join.me',

            oauth : {
                version : 2,
                auth : 'https://secure.join.me/api/public/v1/auth/oauth2',
                grant : 'https://secure.join.me/api/public/v1/auth/oauth2'
            },

            refresh : false,

            scope : {
                basic: '',
                user : 'user_info',
                scheduler : 'scheduler',
                start : 'start_meeting'
            },

            scope_delim : ' ',

            login: function(p) {
                p.options.window_width = 400;
                p.options.window_height = 700;
            },

            base : 'https://api.join.me/v1/',

            get : {
                "me" : "user",
                "meetings": "meetings",
                "meetings/info": "meetings/@{id}"
            },

            post: {
                "meetings/start/adhoc": function(p, callback) {
                    callback('meetings/start');
                },

                "meetings/start/scheduled": function(p, callback) {
                    var meetingId = p.data.meetingId;
                    p.data = {};
                    callback('meetings/' + meetingId + '/start');
                },

                "meetings/schedule": function(p, callback) {
                    callback('meetings');
                }
            },

            patch: {
                "meetings/update": function(p, callback) {
                    callback('meetings/' + p.data.meetingId);
                }
            },

            del: {
                "meetings/delete": "meetings/@{id}"
            },

            wrap: {
                me: function(o, headers) {
                    formatError(o, headers);

                    if (!o.email) {
                        return o;
                    }

                    o.name = o.fullName;
                    o.first_name = o.name.split(' ')[0];
                    o.last_name = o.name.split(' ')[1];
                    o.id = o.email;         

                    return o;
                },

                'default': function(o, headers) {
                    formatError(o, headers);

                    return o;
                }
            },

            xhr : formatRequest

        }
    });

    function formatError(o, headers) {
        if (o && ('Message' in o) || 
            (headers.statusCode === 401 || headers.statusCode === 403)) {
            
            var errorCode;
            switch(headers.statusCode) {
                case 400:
                    errorCode = 'invalid_request';
                    break;
                case 401: 
                    errorCode = 'stale_token';
                    break;
                case 403:
                    errorCode = 'invalid_token';
                    break;
                case 500:
                    errorCode = 'server_error';
                    break;
                default:
                    errorCode = 'server_error';
            }

            o.error = {
                code: errorCode,
                message: o.Message || o,
                details: o
            };
        }
        return o;
    }

    function formatRequest(p, qs) {
        // move the access token from the request body to the request header
        var token = qs.access_token;
        delete qs.access_token;
        p.headers = {
            "Authorization": "Bearer " + token
        };

        // format non-get requests to indicate json body
        if (p.method !== 'get' && p.data) {
            p.headers['Content-Type'] = 'application/json';
            if (typeof (p.data) === 'object') {
                p.data = JSON.stringify(p.data);
            }
        }

        if (p.method === 'put') {
            p.method = 'patch';
        }

        return true;
    }

}(hello));
(function (hello) {

  hello.init({
    line: {
      name: "line",
      oauth: {
        version: 2,
        auth: "https://access.line.me/oauth2/v2.1/authorize",
        grant: "https://api.line.me/oauth2/v2.1/token",
        response_type: "code",
        client_secret: process.env.LINE_CLIENT_SECRET,
        scope: {
          basic: "profile%20openid%20email", // https://developers.line.biz/en/docs/line-login/integrate-line-login/#scopes
        },
        state: Math.random(),
        scope_map: {
          basic: ["profile", "openid", "email"],
        },
      },

      base: "https://access.line.me/oauth2/v2.1/",

      get: {
        me: function (p, callback) {
          p.path = "https://api.line.me/v2/profile";
          p.headers = {
            Authorization: `Bearer ${p.authResponse.access_token}`,
          };
          callback("https://api.line.me/v2/profile");
        },
      },

      login: function (p) {
        // OAuth2 non-standard adjustments
        p.qs.scope = "profile%20openid%20email";
      },

      wrap: {
        me: function (o) {
          if (o.userId) {
            o.picture = o.thumbnail = o.pictureUrl;
            o.id = o.userId;
            o.name = o.displayName;
          }

          return o;
        },
      },

      jsonp: false,
    },
  });
})(hello);

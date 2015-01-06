define([], function () {

  describe('hello.api / modules', function () {

    var forEach = function (collection, fn) {
      if (collection && collection.length) {
        for (var i = 0; i < collection.length; i += 1) {
          fn(collection[i]);
        }
      }
    };

    var utils = hello.utils;

    var originalGetAuthResponse = hello.getAuthResponse;
    var originalRequest = utils.request;

    var requestProxy = function (req, callback) {

      var r = {
        network: req.network,
        method: req.method,
        url: req.url,
        data: req.data,
        xhr: true
      };

      r.url = './stubs/' + req.network + '/' + req.method + '/' + req.path + '.json';
      originalRequest.call(utils, r, callback);
    };

    before(function () {
      hello.getAuthResponse = function (service) {
        return {
          access_token: 'the-access-token'
        };
      };
      utils.request = requestProxy;
    });

    after(function () {
      hello.getAuthResponse = originalGetAuthResponse;
      utils.request = originalRequest;
    });

    describe.only('/me', function () {

      var tests = [
        {
          network: "dropbox",
          expect: {
            id: 374434467,
            name: "Jane McGee",
            thumbnail: undefined
          }
        },
        {
          network: "facebook",
          expect: {
            id: "100008806508341",
            name: "Jane McGee",
            thumbnail: "http://graph.facebook.com/100008806508341/picture"
          }
        },
        {
          network: "foursquare",
          expect: {
            id: "110649444",
            name: "Jane McGee",
            thumbnail: "https://irs0.4sqi.net/img/user/100x100/110649444-XTNO1LD24NJOW0TW.jpg"
          }
        },
        {
          network: "github",
          expect: {
            id: 10398423,
            name: "janemcgee35",
            thumbnail: "https://avatars.githubusercontent.com/u/10398423?v=3"
          }
        },
        {
          network: "google",
          expect: {
            id: "115111284799080900590",
            name: "Jane McGee",
            thumbnail: "https://lh3.googleusercontent.com/-NWCgcgRDieE/AAAAAAAAAAI/AAAAAAAAABc/DCi-M8IuzMo/photo.jpg?sz=50"
          }
        },
        {
          network: "instagram",
          expect: {
            id: "1636340308",
            name: "Jane McGee",
            thumbnail: "https://igcdn-photos-h-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-19/10919499_876030935750711_2062576510_a.jpg"
          }
        },
        {
          network: "linkedin",
          expect: {
            id: "sDsPqKdBkl",
            name: "Jane McGee",
            thumbnail: "https://media.licdn.com/mpr/mprx/0_oFea4Eo2n6j5ZQS2oLwg4HE7NiWQ4Qp2H_yl4dVyw6gBFGIuQ3ZGnWmtsSdZUTjhIXErcmkkxGoX"
          }
        },
        {
          network: "soundcloud",
          expect: {
            id: 131420710,
            name: "janemcgee35",
            thumbnail: "https://i1.sndcdn.com/avatars-000123511300-upb183-large.jpg"
          }
        },
        {
          network: "twitter",
          expect: {
            id: 2961707375,
            name: "Jane McGee",
            thumbnail: "http://pbs.twimg.com/profile_images/552017091583152128/a8lyS35y_normal.jpeg"
          }
        },
        {
          network: "windows",
          expect: {
            id: "939f37452466502a",
            name: "Jane McGee",
            thumbnail: "https://apis.live.net/v5.0/939f37452466502a/picture?access_token=the-access-token"
          }
        },
        {
          network: "yahoo",
          expect: {
            id: "UKGYDRAHEWONVO35KOOBBGQ4UU",
            name: "Jane McGee",
            thumbnail: "https://socialprofiles.zenfs.com/images/805efb9485e4878f21be4d9e9e5890ca_192.png"
          }
        }
      ];

      forEach(tests, function (test) {

        it('should format ' + test.network + ' correctly', function (done) {
          hello(test.network).api('/me', function (me) {
            expect(me.id).to.be(test.expect.id);
            expect(me.name).to.be(test.expect.name);
            expect(me.thumbnail).to.be(test.expect.thumbnail);
            done();
          });
        });

      });

    });

    describe('/me/photos', function () {

      var tests = [
        {
          network: "instagram",
          expect: {
            length: 5,
            first: {
              id: "891783660020488189_1636340308",
              name: "Red Carpet Piggy",
              picture: "http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_n.jpg"
            }
          }
        },
        {
          network: "google",
          expect: {
            length: 7,
            first: {
              id: "https://picasaweb.google.com/data/entry/api/user/115111284799080900590/albumid/6101137643479860177/photoid/6101137679962229346?alt=json",
              name: "wistful-piggy.jpg",
              picture: "https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/wistful-piggy.jpg"
            }
          }
        },
        {
          network: "facebook",
          expect: {
            length: 5,
            first: {
              id: "1380493922254145",
              name: "LBD Piggy",
              picture: "https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/s130x130/10897962_1380493922254145_5386757285347386511_n.jpg?oh=98e30ce334bf9cb01f808c0c1134afff&oe=55291C94&__gda__=1429910956_84b3b9a2d5d9326485e630290657afcc"
            }
          }
        }
      ];

      forEach(tests, function (test) {

        it('should format ' + test.network + ' correctly', function (done) {
          hello(test.network).api('/me/photos', function (photos) {
            var first = photos.data[0];
            expect(photos.data.length).to.be(test.expect.length);
            expect(first.id).to.be(test.expect.first.id);
            expect(first.name).to.be(test.expect.first.name);
            expect(first.picture).to.be(test.expect.first.picture);
            done();
          });
        });

      });
    });

  });

});

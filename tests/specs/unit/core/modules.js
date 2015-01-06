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

    describe('/me', function () {

      var tests = [];

      var makeTest = function (network, override) {
        return {
          network: network,
          expect: utils.extend(
            {
              id: "",
              name: "Jane McGee",
              thumbnail: undefined
            },
            override || {}
          )
        };
      };

      tests.push(makeTest("dropbox", {
        id: 374434467
      }));

      tests.push(makeTest("facebook", {
        id: "100008806508341",
        thumbnail: "http://graph.facebook.com/100008806508341/picture"
      }));

      tests.push(makeTest("foursquare", {
        id: "110649444",
        thumbnail: "https://irs0.4sqi.net/img/user/100x100/110649444-XTNO1LD24NJOW0TW.jpg"
      }));

      tests.push(makeTest("github", {
        id: 10398423,
        name: "janemcgee35",
        thumbnail: "https://avatars.githubusercontent.com/u/10398423?v=3"
      }));

      tests.push(makeTest("google", {
        id: "115111284799080900590",
        thumbnail: "https://lh3.googleusercontent.com/-NWCgcgRDieE/AAAAAAAAAAI/AAAAAAAAABc/DCi-M8IuzMo/photo.jpg?sz=50"
      }));

      tests.push(makeTest("instagram", {
        id: "1636340308",
        thumbnail: "https://igcdn-photos-h-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-19/10919499_876030935750711_2062576510_a.jpg"
      }));

      tests.push(makeTest("linkedin", {
        id: "sDsPqKdBkl",
        thumbnail: "https://media.licdn.com/mpr/mprx/0_oFea4Eo2n6j5ZQS2oLwg4HE7NiWQ4Qp2H_yl4dVyw6gBFGIuQ3ZGnWmtsSdZUTjhIXErcmkkxGoX"
      }));

      tests.push(makeTest("soundcloud", {
        id: 131420710,
        name: "janemcgee35",
        thumbnail: "https://i1.sndcdn.com/avatars-000123511300-upb183-large.jpg"
      }));

      tests.push(makeTest("twitter", {
        id: 2961707375,
        thumbnail: "http://pbs.twimg.com/profile_images/552017091583152128/a8lyS35y_normal.jpeg"
      }));

      tests.push(makeTest("windows", {
        id: "939f37452466502a",
        thumbnail: "https://apis.live.net/v5.0/939f37452466502a/picture?access_token=the-access-token"
      }));

      tests.push(makeTest("yahoo", {
        id: "UKGYDRAHEWONVO35KOOBBGQ4UU",
        thumbnail: "https://socialprofiles.zenfs.com/images/805efb9485e4878f21be4d9e9e5890ca_192.png"
      }));

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

    describe.only('/me/photos', function () {

      var tests = [];

      var makeTest = function (network, override) {
        return {
          network: network,
          expect: utils.extend(
            {
              length: 0,
              first: {
                id: undefined,
                name: undefined,
                picture: undefined
              }
            },
            override || {}
          )
        };
      };

      tests.push(makeTest("instagram", {
        length: 5,
        first: {
          id: "891783660020488189_1636340308",
          name: "Red Carpet Piggy",
          picture: "http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_n.jpg"
        }
      }));
      tests.push(makeTest("google", {
        length: 7,
        first: {
          id: "https://picasaweb.google.com/data/entry/api/user/115111284799080900590/albumid/6101137643479860177/photoid/6101137679962229346?alt=json",
          name: "wistful-piggy.jpg",
          picture: "https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/wistful-piggy.jpg"
        }
      }));

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

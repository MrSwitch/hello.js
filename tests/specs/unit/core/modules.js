define([], function () {

  describe('modules', function () {

    var request = hello.utils.request;

    var requestProxy = function (req, callback) {

      var r = {
        network: req.network,
        method: req.method,
        url: req.url,
        data: req.data,
        xhr: true
      };

      r.url = './stubs/' + req.network + '/' + req.method + '/' + req.path + '.json';
      request.call(hello.utils, r, callback);
    };

    before(function () {
      hello.utils.request = requestProxy;
    });

    after(function () {
      hello.utils.request = request;
    });

    describe.only('/me', function () {

      var tests = [];

      tests.push({
        network: "facebook",
        expect: {
          id: "id-12345678",
          name: "Full Name",
          thumbnail: "http://graph.facebook.com/id-12345678/picture"
        }
      });

      tests.push({
        network: "instagram",
        expect: {
          id: "1012345678",
          name: "My Name",
          thumbnail: "https://www.examples.com/instagram-profile.jpg"
        }
      });

      hello.utils.forEach(tests, function (test) {

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

  });

});

define(['unit/modules/helper'], function (helper) {

  describe('hello.api("/me/album")', function () {

    helper.sharedSetup();

    var tests = [
      {
        network: "google",
        expect: {
          length: 6,
          first: {
            id: "https://picasaweb.google.com/data/entry/api/user/115111284799080900590/albumid/6101137643479860177/photoid/6101137651261702722?alt=json",
            name: "bling-piggy.jpg",
            picture: "https://lh5.googleusercontent.com/-WYnDVp26U7k/VKuYXl03AkI/AAAAAAAAADU/nOsGBUZecRw/bling-piggy.jpg"
          }
        }
      },
      {
        network: "facebook",
        expect: {
          length: 7,
          first: {
            id: "1380486122254925",
            name: undefined,
            picture: "https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xfa1/v/t1.0-9/s130x130/10924813_1380486122254925_8328783981056301338_n.jpg?oh=d703e6d45262e4996a783dcd056dec03&oe=5531C3B7&__gda__=1429692476_20dfea8df43185ea83fd611e043f5213"
          }
        }
      },
      {
        network: "windows",
        expect: {
          length: 7,
          first: {
            id: "file.939f37452466502a.939F37452466502A!117",
            name: "funeral-piggy.jpg",
            picture: "https://public-ch3301.files.1drv.com/y2mVoR3TWKeWdH5vzmYmYyFRaFRlj0FPPy6zAcQWY2hy9tcjqWfKc5Uqg2ctPFwuz-WmPIhp5gZKZz8SU3gFx1vNdVDmLetto8IOMRpD0wAKoQMl1IWJFPCmu-hE8-FVB2Eb4x9885zel5SRdAqfsR3OA/funeral-piggy.jpg?psid=1"
          }
        }
      }
    ];

    helper.forEach(tests, function (test) {

      it('should format ' + test.network + ' correctly', function (done) {
        hello(test.network).api('/me/album', { id: 'album-id' }, function (album) {
          var first = album.data[0];
          expect(album.data.length).to.be(test.expect.length);
          expect(first.id).to.be(test.expect.first.id);
          expect(first.name).to.be(test.expect.first.name);
          expect(first.picture).to.be(test.expect.first.picture);
          done();
        });
      });

    });

  });

});

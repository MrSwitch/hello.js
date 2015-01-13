define(['unit/modules/helper'], function (helper) {

  describe('hello.api("/me/photos")', function () {

    helper.sharedSetup();

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
      },
      {
        network: "flickr",
        expect: {
          length: 5,
          first: {
            id: "6206400436",
            name: "DSC03367",
            picture: "https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99.jpg"
          }
        }
      },
      {
        network: "windows",
        expect: {
          length: 7,
          first: {
            id: "file.939f37452466502a.939F37452466502A!109",
            name: "funeral-piggy.jpg",
            picture: "https://public-ch3301.files.1drv.com/y2mtE3u-1oVm7UJkYR5Ylxn2b8BR4attabxQ0AEiajowKHvlJUZBxjLpP8LWG4Pi4ZEuDyQFELhxSxoNNHxP--6kcx0Z6mCsWnYjR1_1-izBx8HkqE1ghH6I22bQtIKPjFXnXJbHtHXhFgvQwq7eKZ03Q/funeral-piggy.jpg?psid=1"
          }
        }
      }
    ];

    helper.forEach(tests, function (test) {

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

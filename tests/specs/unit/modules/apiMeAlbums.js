define(['unit/modules/helper'], function (helper) {

  describe('hello.api("/me/albums")', function () {

    helper.sharedSetup();

    var tests = [
      {
        network: "facebook",
        expect: {
          length: 3,
          first: {
            id: "1380499628920241",
            name: "Timeline Photos",
            thumbnail: "https://graph.facebook.com/1380493922254145/picture?access_token=the-access-token",
            photos: undefined
          }
        }
      },
      {
        network: "flickr",
        expect: {
          length: 3,
          first: {
            id: "72157627511003764",
            name: "Wales with mum and Matt - dropped in on Ozzy",
            photos: "https://api.flickr.com/services/rest?method=flickr.photosets.getPhotos&api_key=undefined&format=json&photoset_id=72157627511003764"
          }
        }
      },
      {
        network: "google",
        expect: {
          length: 2,
          first: {
            id: "https://picasaweb.google.com/data/entry/api/user/115111284799080900590/albumid/6101137643479860177?alt=json",
            name: "2015-01-06",
            thumbnail: "https://lh4.googleusercontent.com/-FwGrKcgx4II/VKuYXI1hg9E/AAAAAAAAADQ/_EpYdYBoAng/s160-c/20150106.jpg",
            photos: "https://picasaweb.google.com/data/feed/api/user/115111284799080900590/albumid/6101137643479860177?alt=json&authkey=Gv1sRgCJW1vqqlkp_74wE"
          }
        }
      },
      {
        network: "windows",
        expect: {
          length: 2,
          first: {
            id: "folder.939f37452466502a.939F37452466502A!115",
            name: "More Pictures",
            thumbnail: undefined,
            photos: "https://apis.live.net/v5.0/folder.939f37452466502a.939F37452466502A!115/photos"
          }
        }
      }
    ];

    helper.forEach(tests, function (test) {

      it('should format ' + test.network + ' correctly', function (done) {
        hello(test.network).api('/me/albums', function (albums) {
          var first = albums.data[0];
          expect(albums.data).not.to.be(undefined);
          expect(albums.data.length).to.be(test.expect.length);
          expect(first.id).to.be(test.expect.first.id);
          expect(first.name).to.be(test.expect.first.name);
          expect(first.thumbnail).to.be(test.expect.first.thumbnail);
          expect(first.photos).to.be(test.expect.first.photos);
          done();
        });
      });

    });

  });

});

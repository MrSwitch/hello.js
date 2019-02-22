define(['./helper'], function(helper) {

	describe('hello.api(\'/me/album\')', function() {

		helper.sharedSetup();

		var tests = [
			{
				network: 'google',
				method: 'post',
				expect: {
					length: 2,
					first: {
						id: 'test_file_1',
						name: 'test_file_1.jpg',
						picture: 'https://via.placeholder.com/300'
					}
				}
			},
			{
				network: 'facebook',
				method: 'get',
				expect: {
					length: 7,
					first: {
						id: '1380486122254925',
						name: undefined,
						picture: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xfa1/v/t1.0-9/s130x130/10924813_1380486122254925_8328783981056301338_n.jpg?oh=d703e6d45262e4996a783dcd056dec03&oe=5531C3B7&__gda__=1429692476_20dfea8df43185ea83fd611e043f5213'
					}
				}
			},
			{
				network: 'windows',
				method: 'get',
				expect: {
					length: 7,
					first: {
						id: 'file.939f37452466502a.939F37452466502A!117',
						name: 'funeral-piggy.jpg',
						picture: 'https://public-ch3301.files.1drv.com/y2mVoR3TWKeWdH5vzmYmYyFRaFRlj0FPPy6zAcQWY2hy9tcjqWfKc5Uqg2ctPFwuz-WmPIhp5gZKZz8SU3gFx1vNdVDmLetto8IOMRpD0wAKoQMl1IWJFPCmu-hE8-FVB2Eb4x9885zel5SRdAqfsR3OA/funeral-piggy.jpg?psid=1'
					}
				}
			}
		];

		helper.forEach(tests, function(test) {

			it('should format ' + test.network + ' correctly', function(done) {

				hello(test.network)
				.api('/me/album', test.method, {
					id: 'album-id'
				})
				.then(function(album) {
					var first = album.data[0];
					expect(album.data.length).to.be(test.expect.length);
					expect(first.id).to.be(test.expect.first.id);
					expect(first.name).to.be(test.expect.first.name);
					expect(first.picture).to.be(test.expect.first.picture);
					done();
				})
				.then(null, done);

			});

		});

	});

});

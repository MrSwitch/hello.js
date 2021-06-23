import helper from './helper';

describe('hello.api(\'/me/photos\')', function() {

	helper.sharedSetup();

	var tests = [
		{
			network: 'instagram',
			expect: {
				length: 5,
				first: {
					id: '891783660020488189_1636340308',
					name: 'Red Carpet Piggy',
					picture: 'http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_n.jpg',
					pictures: [
						{
							source: 'http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_s.jpg',
							width: 150,
							height: 150
						},
						{
							source: 'http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_a.jpg',
							width: 306,
							height: 306
						},
						{
							source: 'http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903489_924233790922795_96516085_n.jpg',
							width: 640,
							height: 640
						}
					]
				}
			}
		},
		{
			network: 'google',
			expect: {
				length: 7,
				first: {
					id: 'https://picasaweb.google.com/data/entry/api/user/115111284799080900590/albumid/6101137643479860177/photoid/6101137679962229346?alt=json',
					name: 'wistful-piggy.jpg',
					picture: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/wistful-piggy.jpg',
					pictures: [
						{
							source: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/s72/wistful-piggy.jpg',
							width: 48,
							height: 72
						},
						{
							source: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/s144/wistful-piggy.jpg',
							width: 96,
							height: 144
						},
						{
							source: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/s288/wistful-piggy.jpg',
							width: 192,
							height: 288
						},
						{
							source: 'https://lh3.googleusercontent.com/-A9K1HZCyma8/VKuYZQvmSmI/AAAAAAAAADU/9AvsN7uNS2Y/wistful-piggy.jpg',
							width: 300,
							height: 450
						}
					]
				}
			}
		},
		{
			network: 'facebook',
			expect: {
				length: 5,
				first: {
					id: '1380493922254145',
					name: 'LBD Piggy',
					picture: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/s130x130/10897962_1380493922254145_5386757285347386511_n.jpg?oh=98e30ce334bf9cb01f808c0c1134afff&oe=55291C94&__gda__=1429910956_84b3b9a2d5d9326485e630290657afcc',
					pictures: [
						{
							source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p130x130/10897962_1380493922254145_5386757285347386511_n.jpg?oh=c844758a0168dc0fa20106614496f20f&oe=553CD544&__gda__=1433335420_b6b78a2b6554da54741dffea139b18bf',
							width: 130,
							height: 147
						},
						{
							source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p75x225/10897962_1380493922254145_5386757285347386511_n.jpg?oh=ea4175f2762b46d4b8b3bfb663a0cc91&oe=55361281&__gda__=1428907231_a5b7ab31f4bdf6ad829389734e4bf42b',
							width: 198,
							height: 225
						},
						{
							source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p320x320/10897962_1380493922254145_5386757285347386511_n.jpg?oh=be66c3ee515536d73917146cfa6f7d86&oe=552CF0A3&__gda__=1428296859_6705bd7c1183d77b84a9249492334798',
							width: 320,
							height: 362
						},
						{
							source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p180x540/10897962_1380493922254145_5386757285347386511_n.jpg?oh=a5cd1de629354d1b880133cf314408c9&oe=552BFCE8&__gda__=1430386896_07316fcb7c40fc98585837b6b33773ff',
							width: 477,
							height: 540
						},
						{
							source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/p480x480/10897962_1380493922254145_5386757285347386511_n.jpg?oh=be2c6c759107eecf58c323cfb2053492&oe=553FE4E4&__gda__=1428803548_71b51cb1f98f4eb0608bcb11df5cb8bf',
							width: 480,
							height: 543
						},
						{
							source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/p600x600/10896389_1380493922254145_5386757285347386511_o.jpg',
							width: 600,
							height: 679
						},
						{
							source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/p720x720/10896389_1380493922254145_5386757285347386511_o.jpg',
							width: 720,
							height: 815
						},
						{
							source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/p960x960/10896389_1380493922254145_5386757285347386511_o.jpg',
							width: 960,
							height: 1086
						},
						{
							source: 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10896389_1380493922254145_5386757285347386511_o.jpg',
							width: 1809,
							height: 2048
						}
					]
				}
			}
		},
		{
			network: 'flickr',
			expect: {
				length: 5,
				first: {
					id: '6206400436',
					name: 'DSC03367',
					picture: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99.jpg',
					pictures: [
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_t.jpg',
							width: 100,
							height: 100
						},
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_m.jpg',
							width: 240,
							height: 240
						},
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_n.jpg',
							width: 320,
							height: 320
						},
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99.jpg',
							width: 500,
							height: 500
						},
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_z.jpg',
							width: 640,
							height: 640
						},
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_c.jpg',
							width: 800,
							height: 800
						},
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_b.jpg',
							width: 1024,
							height: 1024
						},
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_h.jpg',
							width: 1600,
							height: 1600
						},
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_k.jpg',
							width: 2048,
							height: 2048
						},
						{
							source: 'https://farm7.staticflickr.com/6162/6206400436_1d15b3aa99_o.jpg',
							width: 2048,
							height: 2048
						}
					]
				}
			}
		},
		{
			network: 'windows',
			expect: {
				length: 7,
				first: {
					id: 'file.939f37452466502a.939F37452466502A!109',
					name: 'funeral-piggy.jpg',
					picture: 'https://public-ch3301.files.1drv.com/y2mtE3u-1oVm7UJkYR5Ylxn2b8BR4attabxQ0AEiajowKHvlJUZBxjLpP8LWG4Pi4ZEuDyQFELhxSxoNNHxP--6kcx0Z6mCsWnYjR1_1-izBx8HkqE1ghH6I22bQtIKPjFXnXJbHtHXhFgvQwq7eKZ03Q/funeral-piggy.jpg?psid=1',
					pictures: [
						{
							source: 'https://public-ch3301.files.1drv.com/y2mtE3u-1oVm7UJkYR5Ylxn2b8BR4attabxQ0AEiajowKHvlJUZBxjLpP8LWG4Pi4ZEuDyQFELhxSxoNNHxP--6kcx0Z6mCsWnYjR1_1-izBx8HkqE1ghH6I22bQtIKPjFXnXJbHtHXhFgvQwq7eKZ03Q/funeral-piggy.jpg?psid=1',
							width: 85,
							height: 96
						},
						{
							source: 'https://public-ch3301.files.1drv.com/y2mrLoEhkFAzHOjlFCyVV4ypi_TtACvF476rRuvAOBoVSsNJrt722EP9xCR_b_Z0qa8vocx8kNPlxoUFehnT_7e6LD-L8J14V-SzD5nCRiiT-Mg8J2pKgtW_pf6XD2Sg7oS/funeral-piggy.jpg?psid=1&ck=2&ex=720',
							width: 156,
							height: 176
						},
						{
							source: 'https://public-ch3301.files.1drv.com/y2mqUA8S78mIJyXz1Tof4bZ8a_4CuConMxRIJ4nZ2I6QyQDjmshrQb393fB8xwt_5b_3b1-je4c_OlJbXJVF9oafdXw1t7eB4rqFTuVZAq-snGg1ksLwLM3OAJUUPGTidy6/funeral-piggy.jpg?psid=1&ck=2&ex=720',
							width: 707,
							height: 800
						},
						{
							source: 'https://public-ch3301.files.1drv.com/y2mg6goRE11zDIFTJ7rokvWLucBkeD6k6ljXPP2ARkUjR2rfo5-xU13wAU23CrmaGEsIr6NIeXfetdx0htCjqUb7QYttyRnuP2BXFJ0f_7uEA5NGIeH2tk6_DjFoUUIHKg-KdFDuKWM_FHUe48vF6fr4g/funeral-piggy.jpg?psid=1',
							width: 2000,
							height: 2263
						}
					]
				}
			}
		}
	];

	helper.forEach(tests, function(test) {

		it('should format ' + test.network + ' correctly', function(done) {

			hello(test.network)
				.api('/me/photos')
				.then(function(photos) {
					var first = photos.data[0];
					expect(photos.data.length).to.be(test.expect.length);
					expect(first.id).to.be(test.expect.first.id);
					expect(first.name).to.be(test.expect.first.name);
					expect(first.picture).to.be(test.expect.first.picture);
					if (test.expect.first.pictures)
						expect(first.pictures).to.eql(test.expect.first.pictures);
					done();
				})
				.then(null, done);

		});

	});

});

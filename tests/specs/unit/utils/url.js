define([
//	'../../../../src/utils/url'
], function(
//	realPath
){

var Url = hello.utils.url;

//
// Events
//
describe('utils / url', function(){

	var test_location_root = window.location.protocol + "//" + window.location.hostname;
	var test_location_dir = window.location.pathname.replace(/\/[^\/]+$/, '/');
	var test_location_filename = 'redirect.html';

	it('should return current URL, if no URL is given', function(){

		var path = Url().href;
		expect( path ).to.equal( window.location.href );

	});

	it('should return a full URL, if a full URL is given', function(){

		var path = 'http://test/' + test_location_filename;
		var url = Url( path );
		expect( url.href ).to.equal( path );
		expect( url.hostname ).to.equal( 'test' );
		expect( url.protocol ).to.equal( 'http:' );

	});

	it('should return a full URL, if a protocol-less URL is given', function(){
		var url = '//test/' + test_location_filename;
		var path = Url( url ).href;
		expect( path ).to.equal( window.location.protocol + url );
	});

	it('should return a full URL, if a base-path is given', function(){
		var url = '/test/' + test_location_filename;
		var path = Url( url ).href;
		expect( path ).to.equal( test_location_root + url );
	});

	it('should return a full URL, if a relative-path is given', function(){
		var url = './' + test_location_filename;
		var path = Url( url ).href;
		expect( path ).to.equal( test_location_root + ( test_location_dir + url.replace('./', '') ) );
	});

	it('should return a full URL, if a relative-ascendant-path is given', function(){
		var url = '../' + test_location_filename;
		var path = Url( url ).href;
		expect( path ).to.equal( test_location_root + test_location_dir.replace(/\/[^\/]+\/$/, '/') + test_location_filename );
	});

	it('should return a full URL, if a deeper relative-ascendant-path is given', function(){
		var url = '../../' + test_location_filename;
		var path = Url( url ).href;
		expect( path ).to.equal( test_location_root + test_location_dir.replace(/\/[^\/]+\/$/, '/').replace(/\/[^\/]+\/$/, '/') + test_location_filename );
	});

	it('should return a full URL, if a complex relative-ascendant-path is given', function(){
		var url = '../../asdasd/asdasd/../../' + test_location_filename;
		var path = Url( url ).href;
		expect( path ).to.equal( test_location_root + test_location_dir.replace(/\/[^\/]+\/$/, '/').replace(/\/[^\/]+\/$/, '/') + test_location_filename );
	});

});

	
});
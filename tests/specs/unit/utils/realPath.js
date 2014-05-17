define([
//	'../../../../src/utils/realPath'
], function(
//	realPath
){

var realPath = hello.utils.realPath;

//
// Events
//
describe('utils / realPath', function(){

	var test_location_root = window.location.protocol + "//" + window.location.hostname;
	var test_location_dir = window.location.pathname.replace(/\/[^\/]+$/, '/');
	var test_location_filename = 'redirect.html';

	it('should return current URL, if no URL is given', function(){

		var path = realPath();
		expect( path ).to.equal( window.location.href );

	});

	it('should return a full URL, if a full URL is given', function(){

		var url = 'http://test/' + test_location_filename;
		var path = realPath( url );
		expect( path ).to.equal( url );

	});

	it('should return a full URL, if a protocol-less URL is given', function(){
		var url = '//test/' + test_location_filename;
		var path = realPath( url );
		expect( path ).to.equal( window.location.protocol + url );
	});

	it('should return a full URL, if a base-path is given', function(){
		var url = '/test/' + test_location_filename;
		var path = realPath( url );
		expect( path ).to.equal( test_location_root + url );
	});

	it('should return a full URL, if a relative-path is given', function(){
		var url = './' + test_location_filename;
		var path = realPath( url );
		expect( path ).to.equal( test_location_root + ( test_location_dir + url.replace('./', '') ) );
	});

	it('should return a full URL, if a relative-ascendant-path is given', function(){
		var url = '../' + test_location_filename;
		var path = realPath( url );
		expect( path ).to.equal( test_location_root + test_location_dir.replace(/\/[^\/]+\/$/, '/') + test_location_filename );
	});

	it('should return a full URL, if a deeper relative-ascendant-path is given', function(){
		var url = '../../' + test_location_filename;
		var path = realPath( url );
		expect( path ).to.equal( test_location_root + test_location_dir.replace(/\/[^\/]+\/$/, '/').replace(/\/[^\/]+\/$/, '/') + test_location_filename );
	});

	it('should return a full URL, if a complex relative-ascendant-path is given', function(){
		var url = '../../asdasd/asdasd/../../' + test_location_filename;
		var path = realPath( url );
		expect( path ).to.equal( test_location_root + test_location_dir.replace(/\/[^\/]+\/$/, '/').replace(/\/[^\/]+\/$/, '/') + test_location_filename );
	});

});

	
});
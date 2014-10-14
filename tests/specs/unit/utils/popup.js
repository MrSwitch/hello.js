define([
	'../../libs/safari_hack'
//	'../../../../src/utils/diff'
], function(
	safari_hack
//	diff
){

var util = hello.utils;

//
// Events
//
describe('utils / popup', function(){

	var url = 'http://url';
	var _open;

	before(function(){
		_open = window.open;
	});

	after(function(){
		window.open = _open;
	});


	it('should accept a url, redirect_uri, and window arguments', function(done){

		window.open = function( path, name, args ){
			path = safari_hack(path);
			expect( path ).to.equal( url );
			expect( name ).to.equal( '_blank' );
			expect( args ).to.contain( 'width=20' ).and.to.contain( 'height=20' ).and.to.contain( 'hidden=1' );
			done();
		};

		util.popup( url, url, {
			width:20,
			height:20,
			hidden:true
		});

	});


});

	
});
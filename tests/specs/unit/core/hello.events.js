// hello.events.js


describe('hello events', function(){

	it('should bind handler using hello.on( event_name, handler ) and trigger hello.emit', function(done){
		hello.on('auth.login', function(){
			done();
		});

		hello.emit('auth.login');
	});

	it('should support legacy handlers using hello.subscribe( event_name, handler ) and trigger hello.emit', function(done){
		hello.subscribe('auth.login', function(){
			done();
		});

		hello.emit('auth.login');
	});

});
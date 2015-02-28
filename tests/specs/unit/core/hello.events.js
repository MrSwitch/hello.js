// hello.events.js


describe('hello events', function(){

	it('should bind handler using hello.on( event_name, handler ) and trigger hello.emit', function(done){
		function handler(){
			done();
		}

		hello.on('auth.login', handler);
		hello.emit('auth.login');
		hello.off('auth.login', handler);
	});

	it('should support legacy handlers using hello.subscribe( event_name, handler ) and trigger hello.emit', function(done){

		function handler(){
			done();
		}

		hello.subscribe('auth.login', handler);
		hello.emit('auth.login');
		hello.unsubscribe('auth.login', handler);
	});

});
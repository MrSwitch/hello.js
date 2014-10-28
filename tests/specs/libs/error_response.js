// Error response

define(function(){

	return function(event_code,done){
		return function(data, type){

			expect(data).to.be.a("object");
			expect(data).to.have.property("error");
			expect(data.error).to.have.property("code");
			expect(data.error).to.have.property("message");
			expect(data.error.code).to.not.be.an("object");
			expect(data.error.message).to.not.be.an("object");

			if(event_code)
				expect(data.error.code).to.be(event_code);

			done();
		};
	};

});
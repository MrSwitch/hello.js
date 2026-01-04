export default function(eventCode, done) {
		return function(data, type) {

			expect(data).to.be.a('object');
			expect(data).to.have.property('error');
			expect(data.error).to.have.property('code');
			expect(data.error).to.have.property('message');
			expect(data.error.code).to.not.be.an('object');
			expect(data.error.message).to.not.be.an('object');

			if (eventCode)
				expect(data.error.code).to.be(eventCode);

			done();
		};
	}

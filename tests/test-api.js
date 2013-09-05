

describe('Hello API', function(){

	//
	// Are errors thrown if an invalid network is provided
	//
	describe('dataToJSON', function(){

		it('should extrapolate the data in a form', function(){

			// Create a form
			document.body.innerHTML = "<form id='form'>"+
				["<input name='key' value='value'/>",
				"<input name='key2' value='value2'/>", 
				"<input name='file' type='file'/>"].join()+
				"</form>";

			// Make request
			var obj = {
				data : document.getElementById('form')
			};

			hello.utils.dataToJSON(obj);

			assert.typeOf(obj.data, "object");
			assert.equal(obj.data.key, "value");
			assert.equal(obj.data.key2, "value2");
			assert.typeOf(obj.data.file, "object");
		});
	});

});
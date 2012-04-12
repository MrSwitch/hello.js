

	// Tests
	function Test(test){
		this.section = test.section || false;
		this.aside = test.aside || false;

		this.result = ko.observable();
		this.response = ko.observable();
		this.noauth = test.auth === false;
		this.side = test.aside || null;
		this.note = test.note || '';
		this.execute = test.execute || function(service,callback){
			var authResponse = hello.getAuthResponse(service);
			var test = this;
			var action = function(r){
				
				test.result('working');
				var data = JSON.parse(ko.toJSON(test.data.itemsAsObject()));
				var cb = function(r){

					// update the test
					var b = test.validate(r);

					// update model
					test.response(r);
					
					// update model
					test.result(b?'success':'failed');
					
					if(callback&&typeof(callback)==='function'){
						callback();
					}
				}
				
				if(test.method === 'login'){
					hello.login('knarly',cb,data);
					return;
				}
				
				// update model
				hello.api(test.path, test.method, data, cb);
			};
			
			if( !this.noauth && ( !authResponse || !("access_token" in authResponse ) || !("expires" in authResponse) || authResponse.expires < ((new Date()).getTime()/1e3) ) ){
				// check user is signed in
				hello.login(service,action);
			}
			else{
				action({authResponse:authResponse});
			}
		};
		this.method = test.method || 'get';
		this.data = new Dictionary( test.data || {} );
		this.validate = test.validate || function(r){return r && !("error" in r);};
		this.name = test.name || false;
		this.path = test.path;
		return this;
	}


	// Loop through the tests and 
	function testModel(tests){
		var self = this;

		// Add to tests object
		self.tests = ko.observableArray();

		// Format the tests
		$.each(tests, function(){
			self.tests.push(new Test(this));
		});
		

		//
		// Execute Tests
		// 
		self.executeTests = function(service){
			// trigger test
			(function loop(i){
				var test = self.tests()[i];
				if(!test){
					return;
				}
				test.execute(service,function(){loop(++i);});
			})(0);
		}
	}

	/**
	 * Beautify content
	 */
	ko.bindingHandlers.beautify = {
	    update: function(element, valueAccessor, allBindingsAccessor) {
			var value = ko.utils.unwrapObservable( valueAccessor() );
            $(element).html(beautify(value)); // Make the element visible
	    }
	};
	
	function isArray(o){
		return Object.prototype.toString.call(o) === '[object Array]';
	}
	
	function beautify(r){
		return JSON.stringify(r,null,2);
	}


	$(function(){
		// Bind model
		ko.applyBindings(new testModel(tests));
	});


//need to hold the keys discretely, so they can be edited

function DictionaryItem(key, value) {
    this.key = ko.observable(key);
    this.value = ko.observable(value);
}

//represent the dictionary object

function Dictionary(data) {
    this.items = ko.observableArray([]);
    for (field in data) {
        if (data.hasOwnProperty(field)) {
            this.items.push(new DictionaryItem(field, data[field]));
        }
    }

    this.addItem = function() {
        this.items.push(new DictionaryItem());
    }.bind(this);

    this.removeItem = function(item) {
        this.items.remove(item);
    }.bind(this);
        
    this.itemsAsObject = ko.dependentObservable(function() {
        var result = {};
        ko.utils.arrayForEach(this.items(), function(item) {
            result[item.key()] = item.value;
        });

        return result;
    }, this);
}


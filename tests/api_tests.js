//
// Test Model
// Defines which parts of our tests are mutable, and how to execute the test.
//
function Test(test){
	this.section = test.section || false;
	this.aside = test.aside || false;

	this.result = ko.observable();
	this.response = ko.observable();
	this.expected = test.expected || null;
	this.request = ko.observable();
	this.path = ko.observable(test.path);
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

				// passed?
				test.passed(b);

				// update model
				test.response(r);
				
				// update model
				test.result(b?'success':'failed');
				
				if(callback&&typeof(callback)==='function'){
					callback.call(test);
				}
			};
			
			if(test.method === 'login'){
				test.request( hello.login('knarly',data,cb) );
			}
			else if(test.method === 'logout'){
				test.request( hello.logout('knarly',cb) );
			}
			else{
				// Call hello.api
				// Save the request information
				test.request( hello.api(test.path(), test.method, data, cb) );
			}
		};

		action({authResponse:authResponse});
	};
	this.method = test.method;
	this.data = new Dictionary( test.data || {} );
	this.validate = test.validate || function(r){
		if(this.expected){
			return testExpected(this.expected,r);
		}
		return r && !("error" in r);
	};
	this.passed = ko.observable();
	this.name = test.name || false;
	return this;
}

function testExpected(test,r){
	for(var x in test){
		if(!r || !(x in r)){
			b = false;
		}
		else if( tests[x] === null ){
			// no test
			b = true;
		}
		else if( test[x] instanceof RegExp ){
			b = test[x].test(r[x]);
		}
		else if( test[x] instanceof Array ){
			b = r[x] instanceof Array;
		}
		else if( typeof( test[x] ) === 'object' ){
			b = testExpected(test[x],r[x]);
		}
		else{
			b = r[x] === test[x];
		}
		if(!b){
			return false;
		}
	}
	return true;
}

//
// Bind model
//
var model = {
	connections : [],
	tests : [],
	executeTests: function(service){
		var self = this;
		// trigger test
		(function loop(i){
			var test = self.tests[i];
			if(!test){
				return;
			}else if(!test.method){
				loop(++i);
			}
			else{
				test.execute('knarly',function(){
					if(this.passed()){
						loop(++i);
					}
				});
			}

		})(0);
	}
};

$.each(tests, function(i,a){
	model.tests.push(new Test(a));
});

//
// When everything is loaded, we map `tests` to applyBindings
// Map the items in the JSON array 'tests' to the Test model and bind to Knockout
//
$(function(){

	// Bind model
	// Map the data to TEST options.
	ko.applyBindings(model);
});






/////////////////////////////////
//
// EXTENSIONS OF KNOCKOUT
//
/////////////////////////////////



//
// make contenteditable controller
// e.g. <span data-bind="contenteditable: mystring"></span>
ko.bindingHandlers.contenteditable = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        ko.utils.registerEventHandler(element, "keyup", function() {
            var modelValue = valueAccessor();
            var elementValue = element.innerHTML;
            if (ko.isWriteableObservable(modelValue)) {
                modelValue(elementValue);
                
            }
            else { //handle non-observable one-way binding
                var allBindings = allBindingsAccessor();
                if (allBindings['_ko_property_writers'] && allBindings['_ko_property_writers'].htmlValue) allBindings['_ko_property_writers'].htmlValue(elementValue);
            }
        });
    },
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()) || "";
        if (element.innerHTML !== value) {
            element.innerHTML = value;
        }
    }
};



//
// Bind beautifier handler
//
ko.bindingHandlers.beautify = {
    update: function(element, valueAccessor, allBindingsAccessor) {
		var value = ko.utils.unwrapObservable( valueAccessor() );
		function fixRegExp(k,v){
			if(v instanceof RegExp){
				v = v.toString();
			}
			return v;
		}
		value = (JSON.stringify(value,fixRegExp,2)||'').replace(/https?:\/\/[^\'\"\s]+/ig, function(r){
			return r.link(r).replace('<a ', '<a target="_blank" ');
		}).replace(/\"(\/.*?\/)\"/, function(m,a){
			return a;
		});

        $(element).html(value); // Make the element visible
    }
};


//
// Turn an object of Key => Value into mutable stores
//
function DictionaryItem(key, value) {
    this.key = ko.observable(key);
    this.value = (typeof(value)==='function')? value : ko.observable(value);
}


//
// Custom Dictionary observable in Knockout
// represent the dictionary object
//
function Dictionary(data) {
    this.items = ko.observableArray([]);
    for (var field in data) {
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
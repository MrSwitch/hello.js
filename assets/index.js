
	/**
	 * Dump the response from the server after a given element
	 */
	function dump(r,target){
		var $log = $('<pre />');
		
		//console.log('Dump');
		
		if($(target).get(0).tagName !== 'PRE'){
			if( $(target).next().get(0).tagName === 'PRE' ){
				$log = $(target).next();
			}
			else {
				$(target).after($log);
			}
		}else{
			$log = $(target);
		}

		var i=0;
		$((function drilldown(name, json){
			var link;
			if(typeof(json)!=='object'||json===null||json.length==0){ 
				return '<b>'+name + '<\/b>: <span class="'+ typeof(json) +'">' + json + '<\/span>';
			}
			var s='';
			for ( var x in json ){
				s += '<li>'+drilldown(x,json[x])+'<\/li>';
			}
			return '<div><a href="javascript:void(0);" class="toggle">'+ name +'</a>: <ul class="hide">' + s + '<\/ul></div>';
		})(typeof(r),r))
		.find('a.toggle')
		.click(function(){
			$(this).next('ul').toggleClass("hide");
		})
		.end()
		.appendTo($log);
	}


	function scopes(frm){
		return $.map($(frm).serializeArray(),function(n,i){
			return n.value;
		}).join(',');
	}


	function restTabs(path){
		console.log(path);
		var input = document.getElementById('playground').elements.path;

		network = ( path.match(/^([^:]+)\:/) || input.value.match(/^([^:]+)\:/) );
		if(network){
			network = network[1];
		}

		var pathname = (path.match(/[^:]+$/)||input.value.match(/[^:]+$/));
		if(pathname){
			pathname = pathname[0];
		}

		path = (network?network+":":'') + (pathname||'');

		var action = function(){
			input.value = path;
		};

		if(network){
			var service = hello.getAuthResponse(network);
			( !service || (service.expires && service.expires < ((new Date()).getTime()/1e3) ) )
				? hello.login(network, action)
				: action();
		}
		else{
			action();
		}
	}


function download(body, type, filename){

	var blob;
	try{
		blob = new Blob([body], { "type" : type||"text/plain" }); // the blob
	}
	catch(e){
		try{
			var bb = new BlobBuilder();
			bb.append(body);
			blob = bb.getBlob("text\/xml");			
		}catch(e){
		}
	}

	if(blob){
		window.saveAs(blob, filename);
	}
	else{
		window.open("data:"+(type||"text/plain")+";base64,"+btoa(body));
	}
}

window.saveAs || ( window.saveAs = (window.navigator.msSaveBlob ? function(b,n){ return window.navigator.msSaveBlob(b,n); } : false) || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs || (function(){
 
	// URL's
	window.URL || (window.URL = window.webkitURL);
 
	if(!window.URL){
		return false;
	}
 
	return function(blob,name){
		var url = URL.createObjectURL(blob);
 
		// Test for download link support
		if( "download" in document.createElement('a') ){
 
			var a = document.createElement('a');
			a.setAttribute('href', url);
			a.setAttribute('download', name);
 
			// Create Click event
			var clickEvent = document.createEvent ("MouseEvent");
			clickEvent.initMouseEvent ("click", true, true, window, 0, 
				event.screenX, event.screenY, event.clientX, event.clientY, 
				event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, 
				0, null);
 
			// dispatch click event to simulate download
			a.dispatchEvent (clickEvent);
 
		}
		else{
			// fallover, open resource in new tab.
			window.open(url, '_blank', '');
		}
	};
 
})() );


$(function(){


$('#download_form').submit(function (e){

	var all = $('input[name=all]',this).val();
	$('input[name=all]',this).val("");

	var minify = !!$('input[name=minify]',this).attr('checked');

	e.preventDefault();

	var services = $.map($("input[name=services]","form").filter(!!all?"*":":checked"), function(r){return r.value;});

 	var script = [];

	// download the service via XHR
	$.ajax({
		url : "dist/hello.js",
		dataType : 'text',
		success : function(r){
			script.unshift(minify?jsmin({source:r}):r);
			if(script.length===services.length+1){
				download( script.join("\n"), "text/plain", "hello.js" );
			}
		},
		error : function(){
			console.error("whoops");
		}
	});

	$(services).each(function(i, name){
		// download the service via XHR
		$.ajax({
			url : 'src/modules/'+name+".js",
			dataType : 'text',
			success : function(r){
				script.push(minify?jsmin({source:r}):r);
				if(script.length===services.length+1){
					download( script.join("\n"), "text/plain", "hello.js" );
				}
			},
			error : function(){
				console.error("whoops");
			}
		});
	});
});



$("form.rest").each(function(i){
	var $frm = $(this).submit(function(e){
			e.preventDefault();
			e.stopPropagation();
			var path = $inpt.val();
			hello.api( path, function (json, network){
				dump(path, $pre );
				dump(json, $pre );
			});
		}),
		$pre = $('pre',this),
		$inpt = $('input[name=path]', this);
});

});

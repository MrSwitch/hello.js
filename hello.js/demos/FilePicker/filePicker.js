//
// FilePicker
// An extension to Hello.js

if( !("ui" in hello) ){
	hello.ui = {};
}

hello.ui.filePicker = function(options, callback){

	var prefix = 'fp-',
		win = window,
		doc = window.document,
		x,
		i=0;

	// Sanitize input vars
	if(typeof(options)==='function'){
		callback = options;
		options = {};
	}

	var main_el = create('div', {'class':prefix + "main"});
		var head_el = create('div', {'class':prefix + "head"}, main_el);
			var path_el = create('div', {'class':prefix + "path"}, head_el);
				var upload_btn = create('button', {'class':prefix + "upload_btn", "text":'Upload'}, path_el);
		var center_el = create('div', {'class':prefix + "center"}, main_el );
			var nav_el = create('div', {'class':prefix + "nav"}, center_el);
			var body_el = create('div', {'class':prefix + "body"}, center_el);
				var select_el = create('ul', {'class':prefix + "local", id:prefix + "local"}, body_el);
				var camera_el = create('div', {'class':prefix + "camera",id:prefix + "camera"}, body_el);
					var video_el = create('video', {'autoplay':true}, camera_el);
					var snap_btn = create('button', {}, camera_el);
		var footer_el = create('div', {'class':prefix + "footer"}, main_el);
			var info_el = create('span', {'class':prefix + "info", 'text':'none'}, footer_el);
			var done_el = create('button', {'class':prefix + "button", 'text':'Done'}, footer_el);
			var cancel_el = create('button', {'class':prefix + "cancel", 'text':'Cancel'}, footer_el);


	var frame_el;

	// Container
	if(!options.element){

		frame_el = options.element = create('div', {'class':prefix+"container"}, document.body);
		addEvent( options.element, 'click', function(e){
			if(e.target===options.element){
				close();
			}
		});
	}

	options.element.appendChild(main_el);


	var global_counter = 0,
		ref = [],
		current_bucket = select_el,
		current_network = null,
		current_folder = "local",
		upl; // Upload input file


	// Add Provider buttons
	var services = {
		"local" : "Local Computer"
	};

	var networks = hello.init();
	for(x in networks) if(networks.hasOwnProperty(x)&&"id" in networks[x]){
		switch(x){
			case "google":
				services[x + ":/me/files"] = "Drive";
				services[x + ":/me/albums"] = "Picasa";
			break;
			case "windows":
				services[x + ":/me/files"] = "SkyDrive";
			break;
			default:
				services[x + ":/me/files"] = x.replace(/^\w/, ucword );
		}
	}


	// Camera?
	// Does this browser support WebRTC?
	if(!win.navigator.getUserMedia){
		win.navigator.getUserMedia = (win.navigator.webkitGetUserMedia || win.navigator.mozGetUserMedia || win.navigator.msGetUserMedia);
	}

	// URL?
	if(!window.URL){
		window.URL = window.webkitURL;
	}

	if(window.URL && win.navigator.getUserMedia){
		services["camera"] = "Camera";
	}

	for(x in services){if(services.hasOwnProperty(x)){

		var btn = create('button', {
			'data-path' : x,
			'name' : x.match(/:/) ? services[x] : '',
			'html' : services[x],
		}, nav_el);

		if(x.indexOf(":")>-1){
			btn.className = x.replace(/\:.*$/,'');
		}
	}}

	// Add Control to all buttons
	var btns = nav_el.children;
	for(i=0;i<btns.length;i++){
		btns[i].onclick = selectBucket;
	}

	function selectBucket(){
		if(this.className.indexOf(prefix+"selected")===-1){
			this.className += ' '+prefix+"selected";
		}

		if(this.getAttribute('data-path') !== "local"){
			upload_btn.style.display = 'none';
		}
		else{
			upload_btn.style.display = 'inline-block';
		}

		for(var i=0;i<btns.length;i++){
			if(btns[i]!==this){
				btns[i].className = btns[i].className.replace(prefix+"selected", '');
			}
		}
		getBucket(this.getAttribute('data-path'), this.getAttribute('name'));
	}

	// Trigger first button
	btns[0].onclick();

	//
	// Buttons
	//
	info_el.onclick = function(){
		btns[0].onclick();
	};

	// Trigger upload into the current path
	addEvent(upload_btn, 'click', function(){

		// insert a form control and trigger the native picker
		if(!upl){
			upl = doc.createElement('input');
			upl.type='file';
			upl.multiple=true;

			var frm = doc.createElement('form');
			frm.style.opacity = 0;
			frm.style.position = 'absolute';
			frm.style.left = '-2000px';
			frm.style.top = 0;
			frm.appendChild(upl);

			doc.body.appendChild(frm);

			// listen to the onchange event
			// This will carry with it a reference to the file which the user has selected
			upl.addEventListener('change', function(e){
				if(!(e.target&&e.target.files)){
					return;
				}

				// Pass to our custom function for reading the file
				uploadFileList(e.target.files);
			},false);

		}

		// Create and Fire a mouse click event
		var clickEvent = doc.createEvent ("MouseEvent");
		clickEvent.initMouseEvent ("click", true, true, window, 0,
			event.screenX, event.screenY, event.clientX, event.clientY,
			event.ctrlKey, event.altKey, event.shiftKey, event.metaKey,
			0, null);

		// Lets ensure we are focussed on the element for which we are triggering the click event
		upl.focus();
		upl.dispatchEvent(clickEvent);
	});

	// Click
	cancel_el.onclick = function(){
		// Deselect all the selected
		for(var i=0;i<ref.length;i++){
			// set to false
			ref[i].toggleSelect(false);
		}

		close();

		callback({
			cancelled : true,
			files : []
		});
	};

	done_el.onclick = function(){

		var r = {files:[]};
		// Find all the selected elements
		for(var i=0;i<ref.length;i++){
			// set to true
			if(ref[i].selected){
				r.files.push(ref[i].item);
			}
		}
		// Close
		close();

		callback(r);
	};

	if(camera_el){
		var video_el = camera_el.getElementsByTagName('video')[0],
			snap_el = video_el.nextSibling;
		addEvent( video_el, 'click', function(){
			win.navigator.getUserMedia({video:true}, function(stream){
				// Create Object
				video_el.src = win.URL ? win.URL.createObjectURL(stream) : stream;
			}, function(e){
				console.log(e);
			});
		});

		addEvent(snap_el, 'click', function(){
			var blob = elementToBlob(video_el, "snapshot.png");
			// Create a new fileRef
			var pointer = new fileRef({
				name : "snapshot.png",
				type : blob.type,
				file : blob
			}, current_network, snap_el, true);
//			}, current_network, current_bucket, true);

			ref.push( pointer );

			readFile(blob, function(dataURL){

				// Update list
				pointer.update({
					picture : dataURL,
					thumbnail : dataURL
				});
			});
		});
	}

	//
	// DRAG and DROP
	//

	// stop FireFox from replacing the whole page with the file.
	main_el.ondragover = function () { main_el.className=prefix+"dragover"; return false; };
	main_el.ondragend = main_el.ondragleave = function () { main_el.className=""; return false; };

	// Add drop handler
	main_el.ondrop = function (e) {
		main_el.className="";
		e.preventDefault();
		e = e || window.event;
		var files = (e.files || e.dataTransfer.files);
		if(files){
			uploadFileList(files);
		}
	};


	// Creates a new Div if one doesn't exist already and loads the resource into the page
	function getBucket(path, name, parent){

		// Does it already exist?
		var id = prefix + path.replace(/\W/g,''),
			tab = doc.getElementById(id),
			label = doc.getElementById("label"+id);

		// Network
		var network = path.replace(/\:.*/, '');

		// Set current path
		if(!label&&name){
			label = doc.createElement('a');
			label.innerHTML = name;
			label.id = "label"+id;
			if(parent){
				label.setAttribute('data-parent', parent);
			}
			label.onclick = function(){
				getBucket(path, name, parent);
			};
			path_el.appendChild(label);
		}


		if(!tab){

			// create a new tab
			tab = doc.createElement('ul');
			tab.id = id;
			tab.innerHTML = "<span class='"+prefix+"loading' data-message='Waiting for signin'><span></span></span>";
			body_el.appendChild(tab);

			// Remove loading
			var span = tab.getElementsByTagName('span')[0];

			// Login
			hello.login(network, function(auth){

				if(!auth||auth.error){
					span.setAttribute('data-message', "Signin failed, try again");
					span.setAttribute('data-animate', false);
					span.onclick = function(){
						tab.parentNode.removeChild(tab);
						getBucket(path, name, parent);
					};
					return;
				}

				span.setAttribute('data-message', "Loading files");

				// API
				hello.api(path, function(r){
					span.parentNode.removeChild(span);

					// Add files to the tab
					for(var i=0;i<r.data.length;i++){
						ref.push( new fileRef(r.data[i], network, tab) );
					}
				});
			});

		}


		// Hide the others
		// LISTS
		var a = body_el.children;
		for(var i=0;i<a.length;i++){
			a[i].style.display = "none";
		}

		// LABELS
		a = path_el.getElementsByTagName('a');
		for(i=a.length-1;i>=0;--i){
			if(parent&&a[i].id === "label"+parent){
				//parent = a[i].getAttribute('data-parent');
				a[i].style.display = "inline-block";
			}
			else if(a[i].id === "label"+id){
				a[i].style.display = "inline-block";
			}
			else{
				a[i].style.display = "none";
			}
		}


		// Update global
		current_folder = path;

		current_bucket = tab;

		current_network = network;

		// show this
		tab.style.display = 'block';

		// Update the upload btn
		upload_btn.innerHTML = name?"Upload to " + name.replace(/^[a-z]/,function(r){return r.toUpperCase();}):'Upload';
	}

	//
	// Each item is stored as a fileRef instance in the ref array
	// This function controls the element which it is applied upon.
	// Controlling when the elements update for generated content
	//
	function fileRef(item, network, bucket, selected){

		this.els = [];
		this.selected = false;

		this.item = {};

		// Item contents change
		this.update = function(item){
			if(!item){
				return this.item;
			}
			else {
				// Merge the two together
				this.item = hello.utils.merge(this.item, item);
			}

			// Loop through the elements and update their content
			for(var i=0;i<this.els.length;i++){
				this.els[i].getElementsByTagName('span')[0].innerHTML = this.item.name;
				if(this.item.thumbnail){
					this.els[i].getElementsByTagName('img')[0].src = this.item.thumbnail;
				}
			}
		};

		// Create an element in the given bucket,
		// adding on click event handlers
		this.create = function(bucket){
			var item = this.item;
			var self = this;
			var el = doc.createElement('li');
			el.title = item.name;
			el.innerHTML = "<img "+(item.thumbnail?"src='"+item.thumbnail+"'":"")+"/>"
							+"<span>"+(item.name||'')+"</span>";
			el.onclick = function(){
				// Is this a folder?
				if(item.type==='folder'||item.type==='album'){
					getBucket(network+":"+(item.files?item.files:item.id+"/files"), item.name, bucket.id );
				}
				else {
					// Toggle selected
					self.toggleSelect();
				}
			};
			// Add to bucket
			bucket.appendChild(el);

			// Add to local store
			this.els.push(el);

			return el;
		};


		this.toggleSelect = function(bool){

			if(bool===this.selected){
				// nothing
				return;
			}
			// else change

			// toggle
			this.selected = !this.selected;

			// Selected
			if(this.selected){
				// Does the element exist within the local bucket
				var local = false;
				for(i=0;i<this.els.length;i++){
					if( this.els[i].parentNode === select_el ){
						local=true;
						break;
					}
				}
				if(!local){
					// create it
					this.create(select_el);
				}
			}

			// Loop through the elements and update their content
			for(i=0;i<this.els.length;i++){
				this.els[i].className = this.selected ? "select" : "";
			}

			// get the number of selected items in ref and update
			info_el.innerHTML = ( this.selected ? ++global_counter : --global_counter );
		};

		// Create the initial element
		this.update(item);
		this.create(bucket);

		// if this is selected
		if(selected){
			this.toggleSelect();
		}
	}


	// Upload file list
	// Take all the photos in the FileList and create items with them
	function uploadFileList(files){

		// FileList
		if(!("FileList" in window) || (files instanceof File) || (files instanceof Blob)){
			// Make an Array
			files = [files];
		}


		var max = 20, len = files.length;
		if(len>max){
			var bool = confirm("You man only upload "+max+" files at a time");
			if(!bool){
				return;
			}
			len = max;
		}

		// Loop through the array and place the items on the page
		for(var i=0;i<len;i++){
			createRef(files[i]);
		}
	}

	// Do we upload them to the endpoint? Or load them into the page?
	function createRef(file){

		// Create a new fileRef
		var pointer = new fileRef({
			name : file.name,
			type : file.type,
			file : file
		}, current_network, current_bucket, true);

		ref.push( pointer );

		if(current_folder==="local"){
			readFile(file, function(dataURL){

				// Update list
				pointer.update({
					thumbnail : dataURL,
					picture : dataURL
				});
			});
		}
		else{
			// Upload the files to the current directory
			hello.api(current_folder, "post", {file: file}, function(r){
				// Once the files have been successfully upload lets update the pointer
				pointer.update({
					id : r.id,
					thumbnail : r.source,
					picture : r.source
				});
			});
		}
	}

	// readFile
	// Perform one operation at a time, to get a nice gradule load
	function readFile(file, callback){

		// Run this sequentially
		sync(function(){
			// Create a new FileReader Object
			var reader = new FileReader();

			// Set an onload handler because we load files into it Asynchronously
			reader.onload = function(e){

				// Print onto Canvas
				callback( this.result );

				// Run the next one;
				sync();
			};

			reader.readAsDataURL(file);
		});
	}

	// Function
	// Load
	var sync_list = [];
	function sync(func){
		if(func){
			// Add to the end
			sync_list.push(func);
		}
		else{
			// remove first one
			sync_list.shift();
		}
		if(sync_list.length===1||(sync_list.length>0&&!func)){
			// Remove it and run it.
			sync_list[0]();
		}
	}

	function elementToBlob(o,name,type){

		// Create a canvas tag
		// is canvas
		if(o instanceof win.HTMLVideoElement){
			var c = doc.createElement('canvas'),
				ctx = c.getContext('2d');
			c.width = parseInt(video_el.width||640, 10);
			c.height = parseInt(video_el.height||480, 10);

			ctx.drawImage(o, 0, 0, c.width, c.height);
			o = c;

			type = "image/jpeg";
		}

		// is canvas
		if(o instanceof win.HTMLCanvasElement){
			// turn into DataURL
			o = o.toDataURL(type||'image/png');
			name = name || "Canvas";
		}

		var binary;

		if(typeof(o)==='string'&&o.match(/^data\:/)){
			name = name || "DataURI";
			binary = atob(o.split(',')[1]);
			type = o.slice(o.indexOf(':')+1, o.indexOf(';') );
		}

		// Does the browser support the native Blob interface and Typed Arrays'?
		if("Blob" in window && "Uint8Array" in window){
			// convert the item to a native Blob object.
			var a = [];
			for(var i = 0; i < binary.length; i++) {
				a.push(binary.charCodeAt(i));
			}
			return new Blob([new Uint8Array(a)], {type: type});
		}
		else {
			throw "Cannot create blob";
		}
	}

	function close(){
		// is this a popup?
		win.close();

		var container = frame_el || main_el;

		// Hide the DOM element
		if(container&&container.parentNode){
			container.parentNode.removeChild(container);
		}
	}

	function addEvent(obj, eventName, listener) { //function to add event
		if (obj.addEventListener) {
			obj.addEventListener(eventName, listener, false);
		} else {
			obj.attachEvent("on" + eventName, listener);
		}
	}
	function remEvent(obj, eventName, listener) { //function to add event
		if (obj.removeEventListener) {
			obj.removeEventListener(eventName, listener);
		} else {
			obj.detachEvent("on" + eventName, listener);
		}
	}

	function create(type,attr,parent){
		var el = doc.createElement(type);
		for(var x in attr){
			if(x==='text'||x==='html'){
				el.innerHTML = attr[x];
			}
			else{
				el.setAttribute(x,attr[x]);
			}
		}
		if(parent){
			parent.appendChild(el);
		}
		return el;
	}

	function ucword(m){
		return m.toUpperCase();
	}

	addEvent(doc, "keydown", function self(e){
		if(e.keyCode===27){
			cancel_el.onclick();
			remEvent(doc, "keydown", self);
		}
		else if (e.keyCode === 13){
			done_el.onclick();
			remEvent(doc, "keydown", self);
		}
	});
}
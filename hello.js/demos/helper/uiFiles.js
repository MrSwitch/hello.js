// uiFiles.js
// Creates a common UI component for inspecting the providers filesystem

function uiFiles(network, target, parent){

	parent = parent || '';

	var app = hello( network );

	// Get Files
	app.api('me/files', {parent: parent}).then(function(p) {

		var ul = document.createElement('ul');
		(target||document.getElementById('uiFiles')).appendChild(ul);

		// Is the response empty
		if (!p.data.length) {
			ul.className="this applications folder is empty";
			return;
		}

		// Else lets get the children
		p.data.forEach(function(item){


			var li = document.createElement('li');

			// Thumbnail
			if(item.thumbnail) {
				var img = document.createElement('img');
				img.src=item.thumbnail;
				li.appendChild(img);
			}

			// Label
			var label = document.createElement('a');
			label.href="javascript:void(0);";
			label.className = "name";
			label.innerHTML = item.name;
			label.onclick = function(){
				var target = this.parentNode;
				var ul = target.getElementsByTagName('ul'),
					ul = ul.length>0?ul[0]:false;

				if( ul && ul.style.display === 'none' ){
					ul.style.display = 'block';
				}
				else if( ul ){
					ul.style.display = 'none';
				}
				else if(item.files){
					uiFiles(network, target, item.files);
				}
			};
			li.appendChild(label);


			// Is a URL available for this resource?
			if (item.downloadLink) {
				var link = document.createElement('a');
				link.target = "_blank";
				link.download = item.name;
				link.href = item.downloadLink;
				link.innerHTML = "download";
				li.appendChild(link);
			}

			// Can we read this resource into the browser?
			if (item.file) {
				var file = document.createElement('a');
				file.href="javascript:void(0);";
				file.innerHTML = "read";
				file.onclick = function(){
					// Get a raw file
					app.api(item.downloadLink, function(a){
						var a = window.URL.createObjectURL(a);
						window.open(a);
					});
				};
				li.appendChild(file);
			}
			ul.appendChild(li);
		});

	}, function(p) {

		if(p.error){
			alert(p.error.message?p.error.message:p.error);
			return;
		}

	});
}

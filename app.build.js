// App.build.js
// Put this in the build package of Sublime Text 2
/*
{
	"cmd": ["node", "${file_path:${folder}}/app.build.js", "$file_path"],
	"working_dir" : "${file_path:${folder}}"
}
*/

// Require IO operations
var fs = require('fs');

// CREATE hello.all.js
// Concat hello.js with all the modules in the modules/ directory
var scripts = [fs.readFileSync('hello.js', 'utf8')];


fs.readdirSync('modules').forEach(function(name){
	if(name.match(/\.js$/)){
		scripts.push(fs.readFileSync('modules/'+name, 'utf8'));
	}
});

fs.writeFile("hello.all.js", scripts.join('\n'), function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("hello.all.js created!");
    }
});
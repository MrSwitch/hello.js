// _build.js
// Put this in the build package of Sublime Text 2
/*
{
	"cmd": ["node", "${file_path:${folder}}/app.build.js", "$file_path"],
	"working_dir" : "${file_path:${folder}}"
}
*/

// Require IO operations
// This package can be found
var shunt = require('shunt');

shunt({
	'dist/hello.js' : 'src/hello.js',
	'dist/hello.all.js' : ['src/hello.js', 'src/modules/'],
	'README.md' : './index.html'
});
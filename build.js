/**
 * Convert a source file into sublime snippets
 */

var fs = require('fs');

function getArgs(line) {
  // turn (one, two, three) into (${1:one}, ${2:two}, ${3:three})
  return line.replace(/\(([^()]+)\)/g, function(match, contents) {
    var args = contents.split(',');
    var parts = [];
    for(var i = 0; i < args.length; i++) {
      var arg = args[i].trim();
      // push the new surrounded argument into an array
      if (arg !== 'callback') {
        parts.push('\\$${' + (i + 1) + ':' + arg.replace(/\$/g, '') + '}');
      } else {
        parts.push('function(${' + (i + 1) + ':args}){\\n\\t${' + (i + 2) + ':// body}\\n}');
      }
    }
    // join that array with a comma space
    return '(' + parts.join(', ') + ')';
  });
}

function makeTemplate(line) {
  // trim this b
  line = line.trim();
  // auto generate a name
  var name = line.split('(')[0];
  // get the arguments
  var snips = getArgs(line);
  // return the nice template
  return "\t{ \"trigger\": \"" + name.replace(/\\/g, "\\\\") + "\", \"contents\": \"" + snips.replace(/\\/g, "\\\\") + ";${0}\" },\n";
}

fs.readFile('sources.txt', function(err, data) {
  // start our master string with the opening object and array
  var master = "{\n  \"scope\": [\n  \"source.php\"\n  ],\n\n  \"completions\": [\n";
  if(err) throw err;
  // split the file into an array of lines
  var lines = data.toString().split("\n");
  for(var i in lines) {
    // leave out the commented lines
    if (lines[i][0] !== '#') {
      master += makeTemplate(lines[i]);
    }
  }
  // cap off the end
  master += "  ]\n}";
  // write to file
  fs.writeFile('phalconphp-completions.sublime-completions', master, function(err) {
    if(err) throw err;
    console.log('file saved');
  });
});
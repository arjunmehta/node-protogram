# minimarg

Handle command line arguments and sub arguments without all the fat.

Easily set up argument handlers while retaining full control over them. Some things this module provides:

- **a minimal interface**
- **control over the handling of argument values**
- **ability to handle sub-contexts in your arguments a la [subarg](https://github.com/substack/subarg)**
- **output a regenerated interpretation of the original command string (useful for subcontexts)**
- access the raw arguments, parsed arguments, and coerced arguments

## Installation
```bash
npm install -save minimarg
```

## Basic Usage

Include the package in your project

```javascript
var program = require('minimarg');
```

Add the options you want your program to handle and how you want to handle them.
```javascript
program.option('--generic', '-g', 'Use a generic flag to do anything', function(value) {
    console.log('Your generic value is', value);
});

program.option('--help', '-h', 'Display usage information', displayHelp);

function displayHelp() {

    var programOptions = program.options;

    console.log('\n  Multiview v.' + pjson.version);
    console.log('  Usage: multiview [options]\n');

    for (var option in programOptions) {
        console.log('    ' + '--' + option, '-' + programOptions[option].shortcut, programOptions[option].description);
    }
    console.log("\n");
}
```

Parse your arguments into the program.

```javascript
program.parse(process.argv.slice(2));
```

## Handle Subcontexts/Subarguments

Let's say we want to execute another process with values passed into our program:

```javascript
var exec = require(child_process).exec;

program.option('--execute', '-e', 'Execute another program', function(value) {
    var flattenedContext = program.flatten(value);
    var string
    exec(flattenedContext[0], flattenedContext.slice(0), function(error, stdout, stderr){
        console.log("Just Executed Sub Command", flattenedContext);
    });
});
```


## API
### program.option(flag, shortcut, description, handler)
### program.parse(argv)
### program.flatten(flag)
# minimarg

Easily set up command-line argument handlers while retaining full control over them. Some things this module provides:

- **a minimal interface**
- **control over the handling of argument values**
- **ability to handle sub-contexts in your arguments a la [subarg](https://github.com/substack/subarg)**
- **output a regenerated interpretation of the original command string (useful for subcontexts)**
- **access the raw arguments, parsed arguments, and coerced arguments and their values**
- **a few useful methods for `child_process.exec` and `child_process.spawn`**

## Installation
```bash
npm install -save minimarg
```

## Basic Usage

Include the package in your project

```javascript
var program = require('minimarg');
```

Add option flags to your program.

```javascript
program.option('--generic').option('--another_option');
```

OR take more control over how you want to handle flags, whether they need required or optional values, and how you want to handle them.

```javascript
program.option('--generic', {
    shortcut: '-g',
    description: 'Use a generic flag to do anything',
    required: 'channel name',
    action: function(err, value){
        if(err) console.error('Error!', err)
        else console.log("generic value is:", value);
    }
});
```

Parse your arguments into the program.

```javascript
program.parse(process.argv);
```

Test whether a specific flag name has been used

```javascript
if(program.selected['generic']){
    console.log('the --generic flag has been used!')
}
```


## API
### program.option(flag_name, options)
Add a flag with `flag_name` as an option to your program.

#### Options
`shortcut`: Specify a shortcut letter for the flag. Defaults to the first letter of the `flag_name`.
`description`: Specify a description for the flag to recall later.
`required`: Set this flag to a short 'string' describing a required value that needs to be passed in when this flag is set.
`optional`: Set this flag to a short 'string' describing an optional value that needs to be passed in when this flag is set. If `required` is set, `optional` will be ignored.
`action`: A callback method to handle the `value` passed in with the command-line flag. Also handles `err` which is non-`null` if a value is `required` but not set by the user.

#### Minimal Example
```javascript
program.option('--name');
```

#### Minimal with a Handler Example

```javascript
program.option('--name', function(err, value){
    console.log("Name is set to", value);
});
```

#### The Works

```javascript
program.option('--name', {
    shortcut: '-n',
    description: 'Set the name of the user',
    required: 'username',
    action: function(err, value){
        if(err) console.error('Required value needed when using the --name flag');
        else console.log("Name set to:", value);
    }
});
```

### program.parse(argv)
Pass in your full `process.argv` object into the `program.parse` method to begin parsing the command-line arguments.

```javascript
program.parse(process.argv);
```

### program.selected[flag]
Check to see whether the user has used a flag, and retrieve the passed in value. This will only work after the arguments have been parsed by `program.parse`.

```javascript
if(program.selected['name']){
    console.log('the --name flag has been set to', program.selected['name'])
}
```

### program.raw_arguments

## Extra API
The following is some other useful stuff available in the API that might help you when dealing with command line arguments.

### program.buildExecString(arguments_object)
A method to build (the best of its ability) a command string, based on the parsed arguments object passed in.

This is useful in conjunction with `[child_process.exec](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)`.

```javascript
// rebuild the original command string for this program
var original_command_string = program.buildExecString(program.raw_arguments);
```

Or a better example using sub contexts:

```bash
node main.js --execute [ ls -l ./ ]
```

```javascript
if(program.selected[execute]){
    console.log("Original Command String", program.buildExecString(program.selected[execute]));
}
```

### program.buildSpawnArray(arguments_object)
A method to rebuild to (the best of its ability) a command array, based on the parsed arguments object passed in.

This is useful in conjunction with `[child_process.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)`.

```javascript
var original_command_array = program.buildSpawnArray(program.raw_arguments);
```

Or a better example using sub contexts:

```bash
node main.js --spawn [ ls -l ./ ]
```

```javascript
if(program.selected[spawn]){
    console.log("Original Command Array", program.buildSpawnArray(program.selected[spawn]));
}
```


## More Examples

### Custom Help Info

```javascript
var columnify = require('columnify');
var pjson = require('./package.json');

program.option('--help',{
    shortcut: "-h",
    description: "display usage information",
    action: displayHelp
})
.option('--optionA').option('--optionB').option('--optionC');

function displayHelp(err, value) {

    var display = [],
        flag;

    console.log('\n  Minimarg Test Case ' + 'v1.0.0');
    console.log('  Usage: node test/test.js [options]\n');

    for (var flag_name in program.options) {
        flag = program.options[flag_name];
        display.push({
            ' ': ' ',
            flag: program.renderFlagDetails(flag_name),
            description: flag.description
        });
    }

    console.log(columnify(display, {
        columnSplitter: '  '
    }), "\n");
}
```

### Execute Child Processes through CLI

Let's say we want to execute another process with values passed into our program:

```javascript
var exec = require(child_process).exec;

program.option('--execute', function(err, value) {
    var flattenedContext = program.flatten(value);
    var string
    exec(flattenedContext[0], flattenedContext.slice(0), function(error, stdout, stderr){
        console.log("Just Executed Sub Command", flattenedContext);
    });
});
```


## License

The MIT License (MIT)

Copyright (c) 2014 Arjun Mehta

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

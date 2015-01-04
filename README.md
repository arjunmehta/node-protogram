# prorogram

[![Build Status](https://travis-ci.org/arjunmehta/node-prorogram.svg?branch=master)](https://travis-ci.org/arjunmehta/node-prorogram)

![prorogram title image](https://raw.githubusercontent.com/arjunmehta/node-prorogram/image/image/prorogram.png)

Recursively create command-line programs and sub-programs. Easily handle arguments and sub-commands without all the fat. Some things this module provides:

- **a minimal, scalable interface**
- **control over the handling of argument flags and sub-commands**
- **ability to handle sub-contexts in your arguments a la [subarg](https://github.com/substack/subarg)**.
- **access the raw arguments and parsed arguments along with passed-in user values**
- **a few useful methods for `child_process.exec` and `child_process.spawn`**

## Installation
```bash
npm install --save prorogram
```

## Basic Usage

### Include

```javascript
var prorogram = require('prorogram');
```

### Add Option Flags and Their Handlers
Add option flags to your prorogram. Shortcuts will automatically be made based on the first character of the specified option name.

```javascript
prorogram.option('--generic').option('--another_option');
```

OR take more control over how you want to handle flags, whether they need required or optional values, and how you want to handle them.

```javascript
prorogram.option('--generic', {
    shortcut: '-g',
    description: 'Use a generic flag to do anything',
    required: 'channel name',
    action: function(err, value){
        if(err) console.error('Error!', err)
        else console.log("generic value is:", value);
    }
});
```


### Add Commands as Sub-Programs
Infinitely add git-style commands to your program, and build them as you would your main prorogram.

```javascript
var sub_prorogram = prorogram.command('run', {
    alias: 'execute',
    description: 'execute',
    required: 'path name',
    action: function(err, args){
        if(err) console.error('Error!', err)
        else console.log("arguments used for this sub program", args);
    }
});
```

### Parse Arguments

Now that you've set everything up, you're ready to parse your program's arguments.

```javascript
prorogram.parse(process.argv);
```

### Test Flags
If you'd prefer the good ol' fashioned way of testing your flags, instead of using the handlers, just test their existence after you've parsed your arguments:

```javascript
if(prorogram.selected['generic']){
    console.log('the --generic flag has been used!')
}
```

### View All Parsed Arguments
You can view the parsed arguments (parsed with [subarg](https://github.com/substack/subarg)) easily. Do what you will with them.
```
console.log(prorogram.parsed);
```

## Example Program
Try the example program included in the module to get some ideas of how to use this.

```bash
# Switch to the prorogram module directory
cd ./node_modules/prorogram

# install dependencies for the example
npm install

# run the example program and experiment
node ./example/example.js -h
```


## API
### prorogram.option(flag_name, options, handler)
Add a flag with `flag_name` as an option to your prorogram.

Use a handler method to handle the `value` passed in with the command-line flag. Also handles `err` which is non-`null` if a value is `required` but not set by the user. Alternatively look at the `action` option.

#### Options
`shortcut`: Specify a shortcut letter for the flag. Defaults to the first letter of the `flag_name`.
`description`: Specify a description for the flag to recall later.
`required`: Set this flag to a short 'string' describing a required value that needs to be passed in when this flag is set.
`optional`: Set this flag to a short 'string' describing an optional value that needs to be passed in when this flag is set. If `required` is set, `optional` will be ignored.
`action`: A convenience property to use to specify the handler method. If both are specified, only this one will be used.

#### Minimal Example
```javascript
prorogram.option('--name');
```

#### Minimal with a Handler Example

```javascript
prorogram.option('--name', function(err, value){
    console.log("Name is set to", value);
});
```

#### The Works

```javascript
prorogram.option('--name', {
    shortcut: '-n',
    description: 'Set the name of the user',
    required: 'username',
    action: function(err, value){
        if(err) console.error('Required value needed when using the --name flag');
        else console.log("Name set to:", value);
    }
});
```

### prorogram.parse(argv)
Pass in your full `process.argv` object into the `prorogram.parse` method to begin parsing the command-line arguments.

```javascript
prorogram.parse(process.argv);
```

### prorogram.selected[flag]
An object you can use to check to see whether the user has used a flag, and retrieve the passed in value. This will only work after the arguments have been parsed by `prorogram.parse`.

```javascript
if(prorogram.selected['name']){
    console.log('the --name flag has been set to', prorogram.selected['name'])
}
```

### prorogram.createProgram()
You can parse arguments from sub contexts by just creating a new prorogram. Imagine:
```bash
myprogram --optionA --optionB --subprogram [ node ./main.js --optionA --optionB ]
```

```
var new_prorogram = prorogram.createProgram();
```

Now you can parse subcontexts passed through the main program and perform actions on them too.

```javascript
new_prorogram.options(...);
new_prorogram.parse(prorogram.selected['subprogram'])
```

## Extra API

The following is some other useful stuff available in the API that might help you when dealing with command line arguments.

### prorogram.rebuildArgString(arguments_object)
A method to build (the best of its ability) a command string, based on the parsed arguments object passed in.

This is useful in conjunction with `[child_process.exec](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)`.

```javascript
// rebuild the original command string for this program
var original_command_string = prorogram.rebuildArgString(prorogram.raw_arguments);
```

Or a better example using sub contexts:

```bash
node main.js --execute [ ls -l ./ ]
```

```javascript
if(prorogram.selected[execute]){
    console.log("Original Command String", prorogram.rebuildArgString(prorogram.selected[execute]));
}
```

### prorogram.rebuildArgArray(arguments_object)
A method to rebuild to (the best of its ability) a command array, based on the parsed arguments object passed in.

This is useful in conjunction with `[child_process.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)`.

```javascript
var original_command_array = prorogram.rebuildArgArray(prorogram.raw_arguments);
```

Or a better example using sub contexts:

```bash
node main.js --spawn [ ls -l ./ ]
```

```javascript
if(prorogram.selected[spawn]){
    console.log("Original Command Array", prorogram.rebuildArgArray(prorogram.selected[spawn]));
}
```


## More Examples

### Custom Help Info

```javascript
var columnify = require('columnify');

prorogram.option('--help',{
    shortcut: "-h",
    description: "display usage information",
    action: displayHelp
})
.option('--optionA').option('--optionB').option('--optionC');

function displayHelp(err, value) {

    var display = [],
        flag;

    console.log('\n  prorogram Test Case ' + 'v1.0.0');
    console.log('  Usage: node test/test.js [options]\n');

    for (var flag_name in prorogram.options) {
        flag = prorogram.options[flag_name];
        display.push({
            ' ': ' ',
            flag: prorogram.renderFlagDetails(flag_name),
            description: flag.description
        });
    }

    console.log(columnify(display, {
        columnSplitter: '  '
    }), "\n");
}
```

### Spawn Child Processes through CLI

Let's say we want to spawn another process with values passed into our program:

```javascript
var spawn = require(child_process).spawn;

prorogram.option('--spawn', {
    description: 'spawn an evented command (captures stdout and stderr as streams, as well as an exit code) (ex. --execute [ ls -l ./ ])',
    required: 'command string',
    action: spawnCommand
});

function spawnCommand(err, value) {
    if (err) throw err;

    var arr = prorogram.rebuildArgArray(value);
    console.log("spawing from array", arr);

    var little_one = spawn(arr[0], arr.slice(1), {
        stdio: "inherit"
    });
}
```


## License

The MIT License (MIT)

Copyright (c) 2014 Arjun Mehta

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

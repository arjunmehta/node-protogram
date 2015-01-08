# protogram

[![Build Status](https://travis-ci.org/arjunmehta/node-protogram.svg?branch=master)](https://travis-ci.org/arjunmehta/node-protogram)

![protogram title image](https://raw.githubusercontent.com/arjunmehta/node-protogram/image/image/protogram.png)

A node.js module to **recursively create command-line programs and sub-programs**. Easily handle arguments and sub-commands without all the fat. Some things this module provides:

- **a minimal, scalable interface**
- **control over the handling of argument flags and sub-commands**
- **ability to handle sub-contexts in your arguments a la [subarg](https://github.com/substack/subarg)**.
- **access the raw arguments and parsed arguments along with passed-in user values**
- **a few useful methods for `child_process.exec` and `child_process.spawn`**

## Installation
```bash
npm install --save protogram
```

## Basic Usage

### Include

```javascript
var protogram = require('protogram');
```

### Add Option Flags and Their Handlers
Add option flags to your protogram. Shortcuts will automatically be made based on the first available character of the specified option name.

```javascript
protogram.option('--optionA').option('--optionB');
```

OR take more control over how you want to handle flags, whether they need required or optional values, and how you want to handle them.

```javascript
protogram.option('--optionA', {
    shortcut: '-a',
    description: 'Use a generic flag to do anything',
    required: 'file name',
    action: function(value){
        console.log("generic value is:", value);
    },
    error: function(err, args){
        console.error("Error", err.message, "for arguments", args);
    }
});
```


### Add Commands as Sub-Programs
Infinitely add git-style commands to your program, and build them as you would your main protogram.

```javascript
var sub_protogram = protogram.command('run', {
    alias: 'execute',
    description: 'execute a command',
    required: 'path name',
    action: function(args){
        console.log("executed was executed:", args);
    },
    error: function(err, args){
        console.error("Error", err.message, "for arguments", args);
    }
});
```

### Parse Arguments

Now that you've set everything up, you're ready to parse your program's arguments.

```javascript
protogram.parse(process.argv);
```

### Test Flags
If you'd prefer the good ol' fashioned way of testing your flags, instead of using the handlers, just test their existence after you've parsed your arguments:

```javascript
if(protogram.flagged['generic']){
    console.log('the --generic flag has been used!')
}
```

### View All Parsed Arguments
You can view the parsed arguments (parsed with [subarg](https://github.com/substack/subarg)) easily. Do what you will with them.
```
console.log(protogram.parsed);
```

## Example Program
Try the example program included in the module to get some ideas of how to use this.

```bash
# Switch to the protogram module directory
cd ./node_modules/protogram

# install dependencies for the example
npm install

# run the example program and experiment
node ./example/example.js -h
```


## API
### protogram.command(command_name, options)
Add a sub-command to your protogram. Set the `command_name` to `'*'` to 

- `command_name` **String**: Name of the sub-command to your program.
- `options` Object:
    - `description` **String**: Specify a description for the command to recall later.
    - `required` **String**: Set this command to a short 'string' describing a required value that needs to be passed in when this command is set.
    - `optional` **String**: Set this command to a short 'string' describing an optional value that needs to be passed in when this command is set. If `required` is set, `optional` will be ignored.
    - `action` **Function(value, program)**: A convenience property to use to specify the handler method. If both are specified, only this one will be used.
    - `error` **Function(error, value,** program): A convenience property to use to specify the handler method. If both are specified, only this one will be used.

Returns a new `Protogram` command object.

#### The Special `*` Wildcard Command Setting



### protogram.option(flag_name, options)
Add a flag as an option to your protogram.

- `flag_name` **String**: Name of the option of your program.
- `options` Object:
    - `shortcut` **String**: Specify a shortcut letter for the flag. Defaults to the first available letter of the `flag_name`.
    - `required` **String**: Set this flag to a short 'string' describing a required value that needs to be passed in when this flag is set.
    - `optional` **String**: Set this flag to a short 'string' describing an optional value that needs to be passed in when this flag is set. If `required` is set, `optional` will be ignored.
    - `description` **String**: Specify a description for the flag to recall later.
    - `action` **Function(value, program)**: A convenience property to use to specify the handler method. If both are specified, only this one will be used.
    - `error` **Function(error, value,** program): A convenience property to use to specify the handler method. If both are specified, only this one will be used.

returns the parent `Protogram` command object.

#### Minimal Example
```javascript
protogram.option('--name');
```

#### Minimal with a Handler Example

```javascript
protogram.option('--name', function(err, value){
    console.log("Name is set to", value);
});
```

#### The Works

```javascript
protogram.option('--name', {
    shortcut: '-n',
    description: 'Set the name of the user',
    required: 'username',
    action: function(err, value){
        if(err) console.error('Required value needed when using the --name flag');
        else console.log("Name set to:", value);
    }
});
```

### protogram.parse(argv)
Pass in your full `process.argv` array into the `protogram.parse` method to begin parsing the command-line arguments.

```javascript
protogram.parse(process.argv);
```

### protogram.flagged[flag]
An object you can use to check to see whether the user has used a flag, and retrieve the passed in value. This will only work after the arguments have been parsed by `protogram.parse`.

```javascript
if(protogram.flagged['name']){
    console.log('the --name flag has been set to', protogram.flagged['name'])
}
```

### protogram.create(options)
You can parse arguments from sub contexts by just creating a new protogram. Imagine:
```bash
myprogram --optionA --optionB --subprogram [ node ./main.js --optionA --optionB ]
```

```
var new_protogram = protogram.create();
```

Now you can parse subcontexts passed through the main program and perform actions on them too.

```javascript
new_protogram.options(...);
new_protogram.parse(protogram.flagged['subprogram'])
```

## Extra API

The following is some other useful stuff available in the API that might help you when dealing with command line arguments.

### protogram.rebuildArgString(arguments_object)
A method to build (the best of its ability) a command string, based on the parsed arguments object passed in.

This is useful in conjunction with `[child_process.exec](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)`.

```javascript
// rebuild the original command string for this program
var original_command_string = protogram.rebuildArgString(protogram.raw_arguments);
```

Or a better example using sub contexts:

```bash
node main.js --execute [ ls -l ./ ]
```

```javascript
if(protogram.flagged[execute]){
    console.log("Original Command String", protogram.rebuildArgString(protogram.flagged[execute]));
}
```

### protogram.rebuildArgArray(arguments_object)
A method to rebuild to (the best of its ability) a command array, based on the parsed arguments object passed in.

This is useful in conjunction with `[child_process.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)`.

```javascript
var original_command_array = protogram.rebuildArgArray(protogram.raw_arguments);
```

Or a better example using sub contexts:

```bash
node main.js --spawn [ ls -l ./ ]
```

```javascript
if(protogram.flagged[spawn]){
    console.log("Original Command Array", protogram.rebuildArgArray(protogram.flagged[spawn]));
}
```


## More Examples

### Custom Help Info

```javascript
var columnify = require('columnify');

protogram.option('--help',{
    shortcut: "-h",
    description: "display usage information",
    action: displayHelp
})
.option('--optionA').option('--optionB').option('--optionC');

function displayHelp(err, value) {

    var display = [],
        flag;

    console.log('\n  protogram Test Case ' + 'v1.0.0');
    console.log('  Usage: node test/test.js [options]\n');

    for (var flag_name in protogram.options) {
        flag = protogram.options[flag_name];
        display.push({
            ' ': ' ',
            flag: protogram.renderFlagDetails(flag_name),
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

protogram.command('spawn', {
    description: 'spawn an evented command (captures stdout and stderr as streams, as well as an exit code) (ex. --execute [ ls -l ./ ])',
    required: 'command string',
    action: spawnCommand
});

function spawnCommand(err, args) {
    if (err) throw err;

    console.log("spawing from array", args);

    var little_one = spawn(args[0], args.slice(1), {
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

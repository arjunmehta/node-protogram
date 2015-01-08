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
var program = require('protogram');
```

### Add Option Flags and Their Handlers
Add option flags to your program. Shortcuts will automatically be made based on the first available character of the specified option name.

```javascript
program.option('--optionA').option('--optionB');
```

OR take more control over how you specify flags and how to handle them.

```javascript
program.option('--optionA', {
    shortcut: '-a',
    description: 'Use a generic flag to do anything',
    action: function(value){
        console.log("optionA was set to:", value);
    }
});
```


### Add Commands as Sub-Programs
Recursively add git-style commands to your program, and build them as you would your main program.

```javascript
var sub_program = program.command('run', {
    description: 'execute a command',
    required: 'path name',
    action: function(args){
        console.log("path to execute:", args._[0]);
        if(this.flagged.now) // executing now
    }
});

sub_program.option('--now')
```

### Parse Arguments

Now that you've set everything up, you're ready to parse your program's arguments.

```javascript
program.parse(process.argv);
```

### Test Flags
If you'd prefer the good ol' fashioned way of testing your flags, instead of using the handlers, just test their existence after you've parsed your arguments:

```javascript
if(program.flagged['generic']){
    console.log('the --generic flag has been used!')
}
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
Add a sub-command to your program. The sub-command is a new instance of the `Protogram` object!

- `command_name` **String**: Name of the sub-command to your program.
- `options` Object:
    - `description` **String**: Specify a description for the sub-command.
    - `required` **String**: Describe a required value that **must be** be passed in by the user if this sub-command is used.
    - `optional` **String**: Describe an optional value that can be passed in when this sub-command is used. If `required` is set, `optional` will be ignored.
    - `action` **Function(args, program)**: A handler method called if the sub-command is set without any errors. Receives all `args` passed in.
    - `error` **Function(error, value, program)**: A handler method called if the flag is set but has an error (ie. `required` was set and no value was passed in by the user).

Returns a new `Protogram` command object.

#### Minimal Example
```javascript
```

#### The Special `*` Wildcard Command Setting
Set the `command_name` to `'*'` to apply universal settings to all sub-commands on your program.

```javascript

```

### protogram.option(flag_name, options)
Add a `Flag` as an option to your protogram.

- `flag_name` **String**: Name of the option of your program.
- `options` Object:
    - `shortcut` **String**: Specify a shortcut letter for the flag. Defaults to the first available letter of the `flag_name`.
    - `description` **String**: Specify a description for the flag.
    - `required` **String**: Describe a required value that **must be** be passed in when this flag is set.
    - `optional` **String**: Describe an optional value that can be passed in when this flag is set. If `required` is set, `optional` will be ignored.
    - `action` **Function(value, program)**: A handler method called if the flag is set without any errors.
    - `error` **Function(error, value, program)**: A handler method called if the flag is set but has an error (ie. `required` was set and no value was passed in by the user).
    - `added` **Function(program, flag)**: A method called when your option has been added to the program.

returns the parent `Protogram` command object.

#### Minimal Example
```javascript
program.option('--name');
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

#### Minimal with a Handler Example
Optionally, you can just pass a method as a classic callback, which will be called with both the error (`null` if none) and the value.

```javascript
program.option('--name', function(err, value){
    console.log("Name is set to", value);
});
```

### protogram.parse(argv)
Pass in your full `process.argv` array into the `protogram.parse` method to begin parsing the command-line arguments.

```javascript
program.parse(process.argv);
```

### protogram.flagged[flag]
An object you can use to check to see whether the user has used a flag, and retrieve the passed in value. This will only work after the arguments have been parsed by `protogram.parse`.

```javascript
if(program.flagged['name']){
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

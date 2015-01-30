# protogram

[![Build Status](https://travis-ci.org/arjunmehta/node-protogram.svg?branch=master)](https://travis-ci.org/arjunmehta/node-protogram)

![protogram title image](https://raw.githubusercontent.com/arjunmehta/node-protogram/image/image/protogram.png)

A node.js module to **recursively create command-line programs and sub-programs**. Easily handle command line arguments and sub arguments and sub sub arguments and sub sub sub arguments, etc... with just a *little bit* of fat. Some things this module provides:

- **a minimal, yet easily scalable interface**
- **flexible control over the handling of argument flags and sub-commands**
- **ability to handle sub-contexts as arguments a la [subarg](https://github.com/substack/subarg)**.
- **autogenerate help information via [protogram-help](https://github.com/arjunmehta/node-protogram-help)**

## Installation
```bash
npm install --save protogram
```

## Basic Usage

### Include and Create your Program

```javascript
var program = require('protogram').create();
```

### Add Option Flags
Add option flags to your program. Shortcuts will automatically be made based on the first available character of the specified option name.

```javascript
program
    .option('--optionA')  // shortcut will be -o
    .option('--optionB'); // shortcut will be -O
```

### Set an Action For When Your Program Runs

```javascript
program.action = function(args, flags){
    if(flags.optionA) console.log("optionA set to:", flags.optionA)
    if(flags.optionB) console.log("optionB set to:", flags.optionB)
    console.log("passed in arguments:", args)
};
```

### Parse Your Arguments to Execute

Finally, the most important step! Now that you've set everything up, you're ready to parse your program's arguments.

```javascript
program.parse(process.argv);
```

### Test It

```bash
node example.js 198787 "Arg 2" --optionA [ A 29787 "b C" -A -B 29872 ] --optionB "This Is A Long String"
```

Will output:

```
optionA set to: { _: [ "A", 29787, "b C"], A: true, B: 29872 }
optionB set to: "This Is A Long String"
passed in arguments: [ 198787, "Arg 2" ]
```


## Advanced Usage

The above was just to get you started. The API is super flexible and you can control the flow of your program to near infinite specificity.

### Advanced Option Specification

Take more control over how flags are specified and handled by passing in options to your `option` setting. Aside from the first argument specifying the flag name, all of the flag settings below are of course optional.

```javascript
program.option('--optionA', {
    shortcut: '-a',
    description: 'Use a generic flag to do anything',
    required: 'a value'
    action: function(value){
        // called if the flag is set and there are no errors
        console.log("optionA was set to:", value);
    },
    error: function(err, value){
        // called if the 'required' value is not specified when executing
        console.error(err.message);
    }
});
```

### Add Commands as Sub-Programs
Recursively add git-style commands to your program, and build them as you would your main program.

```javascript
var sub_program = program.command('run', {
    description: 'execute a command',
    required: 'path name',
    action: function(args, flags){
        // executed if there are no errors
        console.log("path to execute:", args[0]);
        if(flags.now) // executing now
    },
    error: function(err, args){
        // called if the required argument is missing
        // or if any flags' required arguments are missing.
        console.error(err.message);
    }
});

sub_program.option('--now')
```


### Use a Wildcard for Configuring All Commands

```javascript
program.command('*', {
    includeRoot: true // also apply all these settings to the root program
}).option('--version', {
    action: function(value){
        console.log("My Program v4.0.0")
    }
});
```


### Add Automated Help to Your Program
Want to output usage instructions automatically for your program? Use the **protogram-help** module. Refer to the documentation for how to use.


### Bubble Up Execution Paths

By default the execution of `action` methods of a program does not bubble up to the parent commands.

For example, let's say we create a program with a system of sub commands:

```javascript
var program = protogram.create({
    action: function(args, flags) {
        console.log("main program activated"); // will not be executed 
    }
});

var sub_program = program.command('sub-command', {
    action: function(args, flags) {
        console.log("sub-command activated"); // will not be executed 
    }
});

sub_program.command('sub-sub-command', {
    action: function(args, flags) {
        console.log("sub-sub-command activated"); // will be executed
    }
});
```

And execute:

```bash
node example.js sub-command sub-sub-command
```

Only the `sub-sub-command` action method would be trigged. We can change this by setting the `bubbleUp` option on any parent command.

```javascript
var program = protogram.create({
    action: function(args, flags) {
        console.log("main program activated"); // will not be executed 
    }
});

var sub_program = program.command('sub-command', {
    bubbleUp: true,
    action: function(args, flags) {
        console.log("sub-command activated"); // will be executed
    }
});

sub_program.command('sub-sub-command', {
    action: function(args, flags) {
        console.log("sub-sub-command activated");  // will be executed
    }
});
```

Now both the `sub-command` and the `sub-sub-command` actions will be executed.

### Halt on Error
By default if there is an error (ie. a required argument is missing) for a parent command, the program will continue to parse and evaluate sub-commands and flags. Prevent this by setting the `haltOnError` option to `true` when you create your program.

```javascript
var program = protogram.create({haltOnError: true});
```

or apply to specific sub-commands:

```javascript
var sub_program = program.command('run', {
    haltOnError: true,
    required: 'path name',
    action: function(args, flags){ },
    error: function(err, args){ }
})

sub_program.command('at', {
    required: 'a time',
    action: function(args, flags){ },
    error: function(err, args){ }
});
```

```bash
node example.js run at "13:34"
```

Now in the above example, even though the sub-command `at` is specified, it will not execute because the required argument `path name` is missing for the `run` command. The error will be handled by the `run`'s `error` property.


### Test Flags
If you'd prefer the good ol' fashioned way of testing your flags, instead of using handlers, just test their existence after you've parsed your arguments:

```javascript
if(program.flagged['generic']){
    console.log('the --generic flag has been used!')
}
```


## API

### Protogram.create(options)
Returns a new `Protogram` command object.

- `options` **Object**:
    - `description` **String**: Specify a description for the sub-command.
    - `required` **String**: Describe a required value that **must be** be passed in by the user if this sub-command is used.
    - `optional` **String**: Describe an optional value that can be passed in when this sub-command is used. If `required` is set, `optional` will be ignored.
    - `action` **Function(args, program)**: A handler method called if the sub-command is set without any errors. Receives all `args` passed in.
    - `error` **Function(error, value, program)**: A handler method called if the flag is set but has an error (ie. `required` was set and no value was passed in by the user).
    - `haltOnError` **Boolean**: Set whether the program should stop parsing if there is an error.
    - `bubbleUp` **Boolean**: Set whether the program's `action` method should be executed along with sub-commands.

```javascript
var program = protogram.create({
    action: function(args, flags) {
        console.log("running your program");
    }
});
```

### Protogram.command(command_name, options)
Returns a new `Protogram` command object.

Add a sub-command to your program. The sub-command is a new instance of `Protogram`.

- `command_name` **String**: Name of the sub-command to your program. Use the `*` command name to apply this setting to all sub-commands of the program.
- `options` **Object**: Since the **Protogram.command** method returns a new Protogram object, you can set the same options as **Protogram.create()**.

#### Minimal Example
```javascript
program.command('run', {
    action: function(args, flags) {
        console.log("executed the run command");
    }
});
```

#### Example with a Required Argument

```javascript
program.command('run', {
    required: 'file path',
    action: function(args, flags) {
        console.log("executed the run command successfully");
    },
    error: function(err, args){
        console.log(err.message); // missing required <file path>
    }
}); 
```

#### The Special `*` Wildcard Command Setting
Set the `command_name` to `'*'` to apply universal settings to all sub-commands on your program. You can use the `includeRoot` option.

```javascript
program.command('*', {
    includeRoot: true // also apply all these settings to the root program
    error: function(err, args){
        console.log("A universal error message");
    }
}).option('--version', {
    action: function(value){
        console.log("My Program v4.0.0")
    }
});

program.command('run');
```

The `run` command, as well as the `main program` will inherit the settings from the `*` command configuration, as well as the flag options specified (ie. `version`).


### Protogram.option(flag_name, options)
Add a `Flag` as an option to your program.

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
Add an option (`--name`) to your program. Protogram will automatically create a shortcut (`-n`) to your program.
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


### Protogram.parse(argv)
After your program is configured, pass in your full `process.argv` array into the **Protogram.parse()** method to begin parsing the command-line arguments.

```javascript
program.parse(process.argv);
```

### Protogram.flagged & Protogram.flagged[flag_name]
An object you can use to check to see whether the user has used a flag, and retrieve the passed in value. This will only work after the arguments have been parsed by `program.parse`.

```javascript
if(program.flagged['name']){
    console.log('the --name flag has been set to', program.flagged['name'])
}
```


## License

```
The MIT License (MIT)
Copyright (c) 2014 Arjun Mehta
```
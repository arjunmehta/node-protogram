var pjson = require('../package.json');


// we'll use spawn and exec in this example

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;


// including protogram and the protogram help generator

var protogram = require('../main');
var help = require('protogram-help');


// create the root program with protogram

var program = protogram.create({
    action: function(args, flags) {
        if (Object.keys(flags).length === 0) {
            help.action.call(this);
        }
    }
});


// set a wildcard command configuration on the program
// the settings added to this command will be applied to all sub-commands
// of the program

program.command('*', {
    includeRoot: true // also apply all these settings to the root
}).option('--help', help.set({ // set the help command name
    name: 'Protogram Example Program', // set the name the program that help will output
    version: pjson.version, // set the version of the program that help will output
    handleError: true // output help on error (ie. missing required arguments)
}));

program
    .option('--rebuild_command', {
        description: 'rebuild the original command',
        action: rebuildCommand
    })
    .option('--execute', {
        description: 'execute a command (ex. --execute [ ls -l ./ ])',
        required: 'command string',
        action: executeCommand
    })
    .option('--spawn', {
        description: 'spawn an evented command (captures stdout and stderr as streams, as well as an exit code) (ex. --execute [ ls -l ./ ])',
        required: 'command string',
        action: spawnCommand
    })
    .option('--subcontext', {
        description: 'test subcontexts',
        required: 'command string',
        action: testSubcontext
    });


// create a sub commmand called "run"

program.command('run', {
    required: 'command string',
    description: 'run a command (ex. [ ls -l ./ ])',
    action: function(args, flags) {
        executeCommand(args[0]);
    }
}).option('--new', {
    action: function(val) {
        console.log("NEW NEW NEW", val);
    }
});

function executeCommand(value) {
    var command = program.rebuildArgString(value);
    console.log("executing command", command);

    exec(command, function(error, stdout, stderr) {
        console.log("stdout:\n" + stdout);
        console.log("stderr:\n" + stderr);
        console.log("Error", error);
    });
}

function rebuildCommand(value) {
    var originalCommand = program.rebuildArgString(program.raw_arguments);
    console.log("Original command", originalCommand);
}

function spawnCommand(value) {
    var arr = program.rebuildArgArray(value);
    console.log("spawing from array", arr);

    var little_one = spawn(arr[0], arr.slice(1), {
        stdio: "inherit"
    });
}

function testSubcontext(value) {

    console.log("SUB CONTEXT RAW PARSED VALUE", JSON.stringify(value));

    var new_protogram = protogram.create();

    new_protogram.option('--good', {
        action: function(value) {
            console.log("GOOD WORKED", value);
        }
    });

    new_protogram.option('--help', help);

    new_protogram.parse(value);
}



program.parse(process.argv);
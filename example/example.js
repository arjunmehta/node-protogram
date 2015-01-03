var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var columnify = require('columnify');
var program = require('../main');

program.option('--help', {
        shortcut: '-h',
        description: 'display usage information',
        action: displayHelp
    })
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
    });

program.option('--somethingElse');

program.parse(process.argv);


function displayHelp(err, value) {

    var display = [],
        flag;

    console.log('\n  Minimarg Example CLI Program ' + 'v1.0.0');
    console.log('  Usage: node example/example.js [options]\n');

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

function executeCommand(err, value) {
    if (err) throw err;

    var command = program.buildExecString(value);
    console.log("executing command", command);

    exec(command, function(error, stdout, stderr) {
        console.log("stdout:\n" + stdout);
        console.log("stderr:\n" + stderr);
        console.log("Error", error);
    });
}

function rebuildCommand(err, value) {
    var originalCommand = program.buildExecString(program.raw_arguments);
    console.log("Original command", originalCommand);
}

function spawnCommand(err, value) {
    if (err) throw err;

    var arr = program.buildSpawnArray(value);
    console.log("spawing from array", arr);

    var little_one = spawn(arr[0], arr.slice(1), {
        stdio: "inherit"
    });
}

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var columnify = require('columnify');
var protogram = require('../main');
var help = require('protogram-help');


var pjson = require('../package.json');

console.log(JSON.stringify(process.argv));

protogram
    .option('--help', help)
    .option('--version', version)
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

protogram.option('--somethingElse');

protogram.command('run', {
    alias: 'exec',
    required: 'filename',
    description: '',
    action: function(args) {

    }
}).option('--new', {
    action: function(val) {
        console.log("NEW NEW NEW", val);
    }
});

protogram.parse(process.argv);


function executeCommand(err, value) {
    if (err) throw err;

    var command = protogram.buildExecString(value);
    console.log("executing command", command);

    exec(command, function(error, stdout, stderr) {
        console.log("stdout:\n" + stdout);
        console.log("stderr:\n" + stderr);
        console.log("Error", error);
    });
}

function rebuildCommand(err, value) {
    var originalCommand = protogram.buildExecString(protogram.raw_arguments);
    console.log("Original command", originalCommand);
}

function spawnCommand(err, value) {
    if (err) throw err;

    var arr = protogram.buildSpawnArray(value);
    console.log("spawing from array", arr);

    var little_one = spawn(arr[0], arr.slice(1), {
        stdio: "inherit"
    });
}

function testSubcontext(err, value) {
    if (err) throw err;

    console.log("SUB CONTEXT RAW PARSED VALUE", JSON.stringify(value));

    var new_protogram = protogram.createProgram();

    new_protogram.option('--good', {
        action: function(err, value) {
            console.log("GOOD WORKED", value);
        }
    });

    new_protogram.parse(value);
}

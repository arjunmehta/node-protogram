var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var columnify = require('columnify');
var prorogram = require('../main');
var help = require('prorogram-help');


var pjson = require('../package.json');

console.log(JSON.stringify(process.argv));

prorogram
    .option('--help', help)
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

prorogram.option('--somethingElse');

prorogram.command('run', {
    alias: 'exec',
    required: 'filename',
    description: '',
    action: function(err, args) {

    }
}).option('--new', {
    action: function(err, val) {
        console.log("NEW NEW NEW", val);
    }
});

prorogram.parse(process.argv);


function executeCommand(err, value) {
    if (err) throw err;

    var command = prorogram.buildExecString(value);
    console.log("executing command", command);

    exec(command, function(error, stdout, stderr) {
        console.log("stdout:\n" + stdout);
        console.log("stderr:\n" + stderr);
        console.log("Error", error);
    });
}

function rebuildCommand(err, value) {
    var originalCommand = prorogram.buildExecString(prorogram.raw_arguments);
    console.log("Original command", originalCommand);
}

function spawnCommand(err, value) {
    if (err) throw err;

    var arr = prorogram.buildSpawnArray(value);
    console.log("spawing from array", arr);

    var little_one = spawn(arr[0], arr.slice(1), {
        stdio: "inherit"
    });
}

function testSubcontext(err, value) {
    if (err) throw err;

    console.log("SUB CONTEXT RAW PARSED VALUE", JSON.stringify(value));

    var new_prorogram = prorogram.createProgram();

    new_prorogram.option('--good', {
        action: function(err, value) {
            console.log("GOOD WORKED", value);
        }
    });

    new_prorogram.parse(value);
}

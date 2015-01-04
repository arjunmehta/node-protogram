var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var columnify = require('columnify');
var program = require('../main');

var pjson = require('../package.json');

console.log(JSON.stringify(process.argv));

program.option('--help', {
        shortcut: '-h',
        description: 'display usage information'
    }, displayHelp)
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

program.option('--somethingElse');

program.command('run', {
    alias: 'exec',
    required: 'filename',
    description: '',
    action: function(err, args){

    }
}).option('--new', {
    action: function(err, val) {
        console.log("NEW NEW NEW", val);
    }
});

program.parse(process.argv);


function displayHelp(err, value) {

    var display = [],
        flag;

    console.log('\n  ' + pjson.name + ' v' + pjson.version);
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

function testSubcontext(err, value) {
    if (err) throw err;

    console.log("SUB CONTEXT RAW PARSED VALUE", JSON.stringify(value));

    var new_program = program.createProgram();

    new_program.option('--good', {
        action: function(err, value) {
            console.log("GOOD WORKED", value);
        }
    });

    new_program.parse(value);
}

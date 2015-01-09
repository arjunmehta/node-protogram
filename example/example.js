/*

Commands to try:

node example.js --version
node example.js -v

node example.js dir
node example.js dir -l

node example.js --spawn [ ls -l ]
node example.js -s [ ls -l ]

node example.js --execute [ ls -l ]
node example.js -e [ ls -l ]

node example.js "something" --rebuild_command
node example.js "something" -r

node example.js "something" --subcontext [ A 29787 "b C" -a -B 29872 ]
node example.js "something" -S [ A 29787 "b C" -a -B 29872 ]

node example.js "something" -S [ A --good ]

*/


var pjson = require('../package.json');

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;


// begin example


var protogram = require('../main');
var program = protogram.create();

program.command('*', {
    includeRoot: true,
    error: function(err, args){
        console.error(err.message);
        // console.log("here are your possible options", Object.keys(this.options));
        // console.log("and your possible commands", Object.keys(this.commands));
    }
}).option('--version', {
    action: function(value) {
        console.log("Protogram Example v" + pjson.version);
    }
});


program
    .option('--rebuild_command', {
        description: 'rebuild the original command',
        action: rebuildCommand
    })
    .option('--execute', {
        description: 'execute a command (ex. --execute [ ls -l ./ ])',
        required: 'command array',
        action: executeCommand
    })
    .option('--spawn', {
        description: 'spawn an evented command (captures stdout and stderr as streams, as well as an exit code) (ex. --execute [ ls -l ./ ])',
        required: 'command array',
        action: spawnCommand
    })
    .option('--subcontext', {
        description: 'test subcontexts',
        required: 'command string',
        action: testSubcontext
    });


program.command('dir', {
    description: 'run a command (ex. [ ls -l ./ ])',
    action: function(args, flags) {

        var arr = ['ls'];
        if (flags.list) arr.push('-l');
        spawnCommand({_: arr});

    }
}).option('--list', {
    action: function(val) {
        console.log("Directory as Vertical List");
    }
});


function executeCommand(value) {
    var command = program.rebuildArgString(value);
    console.log("executing command", command);

    exec(command, function(error, stdout, stderr) {
        console.log(stdout ? "stdout:\n" + stdout : '');
        console.log(stderr ? "stderr:\n" + stderr : '');
        console.log(error ? "Error:\n" + error : '');
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

    console.log("Sub Context:", JSON.stringify(value));

    var new_protogram = protogram.create();

    new_protogram.option('--good', {
        action: function(value) {
            console.log("Good Worked on Subcontext", value);
        }
    });

    new_protogram.option('--optionA', {
        action: function(value) {
            console.log("OptionA Worked on Subcontext", value);
        }
    });    

    new_protogram.parse(value);
}

program.parse(process.argv);

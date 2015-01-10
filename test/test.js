var protogram = require('../main');


var test_program = protogram.create({
    haltOnError: true
});

exports['Exported Properly'] = function(test) {
    test.expect(4);

    test.equal(typeof test_program.options, 'object');
    test.equal(typeof test_program.flagged, 'object');
    test.equal(typeof test_program.parsed, 'object');
    test.equal(typeof test_program.raw_arguments, 'object');

    test.done();
};

exports['Add Options'] = function(test) {
    test.expect(3);

    test_program.option('--optionA').option('--optionB').option('--optionC');

    test.equal(typeof test_program.options.optionA, 'object');
    test.equal(typeof test_program.options.optionB, 'object');
    test.equal(typeof test_program.options.optionC, 'object');

    test.done();
};

exports['Automatic Shortcuts'] = function(test) {
    test.expect(3);

    test.equal(test_program.options.optionA.shortcut, 'o');
    test.equal(test_program.options.optionB.shortcut, 'O');
    test.equal(test_program.options.optionC.shortcut, 'p');

    test.done();
};

exports['Set Option with Options'] = function(test) {
    test.expect(5);

    test_program.option('optionD', {
        shortcut: '----y',
        required: 'value',
        description: 'a description',
        action: function(err, value) {

        }
    });

    test.equal(typeof test_program.options.optionD, 'object');
    test.equal(test_program.options.optionD.shortcut, 'y');
    test.equal(test_program.options.optionD.description, 'a description');
    test.equal(test_program.options.optionD.required, 'value');
    test.equal(typeof test_program.options.optionD.action, 'function');

    test.done();
};

exports['Parse Arguments'] = function(test) {

    test.expect(9);

    var fake_argv = [
        "node",
        "/Users/arjun/Working/node-protogram/example/example.js",
        "another",
        "--number",
        "297261",
        "-t",
        "something",
        "-x",
        "something longer than just 1 word",
        "-a",
        "-e",
        "[",
        "subcontext",
        "here",
        "-w",
        "another",
        "-a",
        "something else",
        "-b",
        "276287",
        "]"
    ];

    test_program.parse(fake_argv);

    test.equal(test_program.raw_arguments._, fake_argv);

    // console.log("PARSED:::", test_program.parsed);

    test.equal(test_program.parsed._[0], fake_argv[2]);
    test.equal(test_program.parsed.number, 297261);
    test.equal(test_program.parsed.t, 'something');
    test.equal(test_program.parsed.x, 'something longer than just 1 word');
    test.equal(test_program.parsed.a, true);
    test.equal(test_program.parsed.e._[0], 'subcontext');
    test.equal(test_program.parsed.e.a, 'something else');
    test.equal(test_program.parsed.e.b, 276287);


    test.done();
};


exports['New Program'] = function(test) {

    test.expect(6);

    var new_protogram = protogram.create({
        haltOnError: true
    });

    test.equal(typeof new_protogram.options, 'object');
    test.equal(typeof new_protogram.flagged, 'object');
    test.equal(typeof new_protogram.parsed, 'object');
    test.equal(typeof new_protogram.raw_arguments, 'object');
    test.equal(new_protogram.parsed._, undefined);
    test.equal(new_protogram.raw_arguments._, undefined);

    test.done();
};


exports['Action Execution'] = function(test) {

    test.expect(2);

    var new_protogram = protogram.create({
            haltOnError: true
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "-g",
            "a string variable",
            "-u",
            "297261"
        ];

    new_protogram.option('good', {
        action: function(value) {
            test.equal(value, "a string variable");
            // console.log('--good flag con been executed with value:', value);
            executed++;
            testDone();
        }
    });

    new_protogram.option('user', {
        action: function(value) {
            // console.log('--user flag has con executed with value:', value);
            test.equal(value, 297261);
            executed++;
            testDone();
        }
    });

    new_protogram.parse(fake_argv);

    function testDone() {
        if (executed == 2) {
            test.done();
        }
    }
};


exports['Flag and Required'] = function(test) {

    test.expect(2);

    var new_protogram = protogram.create({
            haltOnError: true
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "-g",
            "-u",
            "297261"
        ];

    new_protogram.option('good', {
        required: 'some string',
        action: function(value) {
            // console.log('--good flag has been executed with value:', value);
            test.equal(true, false);
        },
        error: function(err, args, command) {
            // console.log('--good flag had error:', args);
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <some string> missing for flag: \'--good\'').message)));
            executed++;
            testDone();
        }
    });

    new_protogram.option('user', {
        action: function(value) {
            test.equal(value, 297261);
            executed++;
            testDone();
        }
    });

    new_protogram.parse(fake_argv);

    function testDone() {
        if (executed == 2) {
            test.done();
        }
    }
};


exports['Set Command'] = function(test) {

    var expected = 2;

    test.expect(expected);

    var new_protogram = protogram.create({
            haltOnError: true
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "test",
            "--fail",
            "297261"
        ];


    new_protogram.option('--fail', {
        action: function(err, args) {
            test.equal(true, false); // force fail
        }
    });

    new_protogram.command('test', {
        action: function(err, args) {
            // console.log("TEST EXECUTED???", args);
            test.equal(true, true);
            testDone();
        }
    });

    test.equal(typeof new_protogram.commands.test, 'object');


    new_protogram.parse(fake_argv);

    function testDone() {
        executed++;
        if (executed == 1) {
            test.done();
        }
    }
};

exports['Main Required'] = function(test) {

    var expected = 1;

    test.expect(expected);

    var new_protogram = protogram.create({
            haltOnError: true
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "--fail",
            "297261"
        ];

    new_protogram.required = 'filename';

    new_protogram.error = function(err, args) {
        // console.log("Main Required ERROR", err, args);        
        test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <filename> missing for command: \'example\'').message)));
        testDone();

    };

    new_protogram.option('--fail', {
        action: function(value) {
            test.equal(true, false); // force fail
        }
    });

    new_protogram.parse(fake_argv);

    function testDone() {
        executed++;
        if (executed == 1) {
            test.done();
        }
    }
};


exports['Command Required'] = function(test) {

    var expected = 1;

    test.expect(expected);

    var new_protogram = protogram.create({
            haltOnError: true
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "test",
            "--fail",
            "297261"
        ];


    new_protogram.option('--fail', {
        action: function(value) {
            test.equal(true, false); // force fail
        }
    });

    new_protogram.command('test', {
        required: 'filename',
        action: function(args) {
            console.log("TEST EXECUTED???", args, this.command_name);
        },
        error: function(err, args) {
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <filename> missing for command: \'test\'').message)));
            testDone();
        }
    });

    new_protogram.parse(fake_argv);

    function testDone() {
        executed++;
        if (executed == 1) {
            test.done();
        }
    }
};


exports['Wildcard Command'] = function(test) {

    var expected = 1;

    test.expect(expected);

    var new_protogram = protogram.create({
            haltOnError: true
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "test",
            "--fail",
            "297261"
        ];


    new_protogram.option('--fail', {
        action: function(err, args) {
            test.equal(true, false); // force fail
        }
    });

    new_protogram.command('*', {
        required: 'filename',
        action: function(args, flags) {
            console.log(this.opts, args, flags);
            test.equal(false, true); // force fail
        },
        error: function(err, args) {
            // console.log("TEST EXECUTED??? with ERROR", err, args);
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <filename> missing for command: \'test\'').message)));
            testDone();
        }
    });

    new_protogram.command('test');

    new_protogram.parse(fake_argv);

    function testDone() {
        executed++;
        if (executed == 1) {
            test.done();
        }
    }
};


exports['Wildcard Command Including Root'] = function(test) {

    var expected = 1;

    test.expect(expected);

    var new_protogram = protogram.create({
            haltOnError: true
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "--fail",
            "297261"
        ];


    new_protogram.option('--fail', {
        action: function(err, args) {
            test.equal(true, false); // force fail
        }
    });

    new_protogram.command('*', {
        required: 'filename',
        includeRoot: true,
        action: function(args) {
            test.equal(false, true); // force fail
        },
        error: function(err, args) {
            // console.log("TEST EXECUTED??? with ERROR", err, args);
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <filename> missing for command: \'example\'').message)));
            testDone();
        }
    });

    new_protogram.command('test');

    new_protogram.parse(fake_argv);

    function testDone() {
        executed++;
        if (executed == 1) {
            test.done();
        }
    }
};

exports['Call Action with "this" as the Command'] = function(test) {

    var expected = 3;

    test.expect(expected);

    var new_protogram = protogram.create({
            haltOnError: true
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "win",
            "--win",
            "297261"
        ];


    new_protogram.command('win', {
        action: function(args, flags) {

            if (flags) {
                test.equal(flags.win, 297261);
            }

            test.equal(true, true);
            testDone();
        },
        error: function(err, args) {
            test.equal(false, true);
        }
    }).option('--win', {
        action: function(value) {
            test.equal(value, 297261);
            testDone();
        }
    });

    new_protogram.command('test');

    new_protogram.parse(fake_argv);

    function testDone() {
        executed++;
        if (executed == expected - 1) {
            test.done();
        }
    }
};


exports['Call Action and Don\'t Halt on Error'] = function(test) {

    var expected = 3;
    test.expect(expected);

    var new_protogram = protogram.create({
            bubbleUp: true,
            required: 'command',
            action: function(args, flags) {
                test.equal(args.length, 0);
                testDone();
            }
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "win",
            "--win",
            "297261"
        ];

    new_protogram.command('win', {
        required: 'another value',
        action: function(args, flags) {
            if (flags) {
                test.equal(false, 297261); // force fail
            }
            test.equal(false, true); // force fail : Action should not be called if there is an error
        },
        error: function(err, args) {
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <another value> missing for command: \'win\'').message)));
            testDone();
        }
    }).option('--win', {
        action: function(value) {
            test.equal(value, 297261);
            testDone();
        }
    });

    new_protogram.command('test');

    new_protogram.parse(fake_argv);

    function testDone() {
        executed++;
        if (executed == expected) {
            test.done();
        }
    }
};


exports['Call Action and Halt on Error'] = function(test) {

    var expected = 2;
    test.expect(expected);

    var new_protogram = protogram.create({
            haltOnError: true,
            bubbleUp: true,
            required: 'command',
            action: function(args, flags) {
                test.equal(args.length, 0);
                testDone();
            }
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "win",
            "--win",
            "297261"
        ];

    new_protogram.command('win', {
        required: 'another value',
        action: function(args, flags) {
            if (flags) {
                test.equal(false, true); // force fail
            }
            test.equal(false, true); // force fail
        },
        error: function(err, args) {
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <another value> missing for command: \'win\'').message)));
            testDone();
        }
    }).option('--win', {
        action: function(value) {
            test.equal(false, true); // force fail
        }
    });

    new_protogram.command('test');

    new_protogram.parse(fake_argv);

    function testDone() {
        executed++;
        if (executed == expected) {
            test.done();
        }
    }
};

exports['tearDown'] = function(done) {
    done();
};

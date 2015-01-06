var prorogram = require('../main');

exports['Exported Properly'] = function(test) {
    test.expect(4);

    test.equal(typeof prorogram.options, 'object');
    test.equal(typeof prorogram.selected, 'object');
    test.equal(typeof prorogram.parsed, 'object');
    test.equal(typeof prorogram.raw_arguments, 'object');

    test.done();
};

exports['Add Options'] = function(test) {
    test.expect(3);

    prorogram.option('--optionA').option('--optionB').option('--optionC');

    test.equal(typeof prorogram.options.optionA, 'object');
    test.equal(typeof prorogram.options.optionB, 'object');
    test.equal(typeof prorogram.options.optionC, 'object');

    test.done();
};

exports['Automatic Shortcuts'] = function(test) {
    test.expect(3);

    test.equal(prorogram.options.optionA.shortcut, 'o');
    test.equal(prorogram.options.optionB.shortcut, 'p');
    test.equal(prorogram.options.optionC.shortcut, 't');

    test.done();
};

exports['Set Option with Options'] = function(test) {
    test.expect(5);

    prorogram.option('optionD', {
        shortcut: '----y',
        required: 'value',
        description: 'a description',
        action: function(err, value) {

        }
    });

    test.equal(typeof prorogram.options.optionD, 'object');
    test.equal(prorogram.options.optionD.shortcut, 'y');
    test.equal(prorogram.options.optionD.description, 'a description');
    test.equal(prorogram.options.optionD.required, 'value');
    test.equal(typeof prorogram.options.optionD.action, 'function');

    test.done();
};

exports['Parse Arguments'] = function(test) {

    test.expect(9);

    var fake_argv = [
        "node",
        "/Users/arjun/Working/node-prorogram/example/example.js",
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

    prorogram.parse(fake_argv);

    test.equal(prorogram.raw_arguments._, fake_argv);

    test.equal(prorogram.parsed._[2], fake_argv[2]);
    test.equal(prorogram.parsed.number, 297261);
    test.equal(prorogram.parsed.t, 'something');
    test.equal(prorogram.parsed.x, 'something longer than just 1 word');
    test.equal(prorogram.parsed.a, true);
    test.equal(prorogram.parsed.e._[0], 'subcontext');
    test.equal(prorogram.parsed.e.a, 'something else');
    test.equal(prorogram.parsed.e.b, 276287);


    test.done();
};


exports['New Program'] = function(test) {

    test.expect(6);

    var new_prorogram = prorogram.create();

    test.equal(typeof new_prorogram.options, 'object');
    test.equal(typeof new_prorogram.selected, 'object');
    test.equal(typeof new_prorogram.parsed, 'object');
    test.equal(typeof new_prorogram.raw_arguments, 'object');
    test.equal(new_prorogram.parsed._, undefined);
    test.equal(new_prorogram.raw_arguments._, undefined);

    test.done();
};


exports['Action Execution'] = function(test) {

    test.expect(2);

    var new_prorogram = prorogram.create(),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-prorogram/example/example.js",
            "-g",
            "a string variable",
            "-u",
            "297261"
        ];

    new_prorogram.option('good', {
        action: function(value) {
            test.equal(value, "a string variable");
            executed++;
            testDone();
        }
    });

    new_prorogram.option('user', {
        action: function(value) {
            test.equal(value, 297261);
            executed++;
            testDone();
        }
    });

    new_prorogram.parse(fake_argv);

    function testDone() {
        if (executed == 2) {
            test.done();
        }
    }
};


exports['Flag and Required'] = function(test) {

    test.expect(2);

    var new_prorogram = prorogram.create(),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-prorogram/example/example.js",
            "-g",
            "-u",
            "297261"
        ];

    new_prorogram.option('good', {
        required: 'some string',
        action: function(value) {},
        error: function(err) {
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <some string> missing for flag: \'--good\'').message)));
            executed++;
            testDone();
        }
    });

    new_prorogram.option('user', {
        action: function(value) {
            test.equal(value, 297261);
            executed++;
            testDone();
        }
    });

    new_prorogram.parse(fake_argv);

    function testDone() {
        if (executed == 2) {
            test.done();
        }
    }
};


exports['Set Command'] = function(test) {

    var expected = 2;

    test.expect(expected);

    var new_prorogram = prorogram.create(),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-prorogram/example/example.js",
            "test",
            "--fail",
            "297261"
        ];


    new_prorogram.option('--fail', {
        action: function(err, args) {
            test.equal(true, false); // force fail
        }
    });

    new_prorogram.command('test', {
        action: function(err, args) {
            // console.log("TEST EXECUTED???", args);
            test.equal(true, true);
            testDone();
        }
    });

    test.equal(typeof new_prorogram.commands.test, 'object');


    new_prorogram.parse(fake_argv);

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

    var new_prorogram = prorogram.create(),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-prorogram/example/example.js",
            "test",
            "--fail",
            "297261"
        ];


    new_prorogram.option('--fail', {
        action: function(err, args) {
            test.equal(true, false); // force fail
        }
    });

    new_prorogram.command('test', {
        required: 'filename',
        action: function(args) {
            // console.log("TEST EXECUTED???", err, args);
        },
        error: function(err, args) {
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <filename> missing for command: \'test\'').message)));
            testDone();
        }
    });

    new_prorogram.parse(fake_argv);

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

    var new_prorogram = prorogram.create(),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-prorogram/example/example.js",
            "test",
            "--fail",
            "297261"
        ];


    new_prorogram.option('--fail', {
        action: function(err, args) {
            test.equal(true, false); // force fail
        }
    });

    new_prorogram.command('*', {
        required: 'filename',
        action: function(args) {
            test.equal(false, true); // force fail
        },
        error: function(err, args) {
            // console.log("TEST EXECUTED??? with ERROR", err, args);
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <filename> missing for command: \'test\'').message)));
            testDone();
        }
    });

    new_prorogram.command('test');

    new_prorogram.parse(fake_argv);

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

    var new_prorogram = prorogram.create(),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-prorogram/example/example.js",
            "test",
            "--fail",
            "297261"
        ];


    new_prorogram.option('--fail', {
        action: function(err, args) {
            test.equal(true, false); // force fail
        }
    });

    new_prorogram.command('*', {
        required: 'filename',
        includeRoot: true,
        action: function(args) {
            test.equal(false, true); // force fail
        },
        error: function(err, args) {
            // console.log("TEST EXECUTED??? with ERROR", err, args);
            test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <filename> missing for command: \'test\'').message)));
            testDone();
        }
    });

    new_prorogram.command('test');

    new_prorogram.parse(fake_argv);

    function testDone() {
        executed++;
        if (executed == 1) {
            test.done();
        }
    }
};


exports['tearDown'] = function(done) {
    done();
};

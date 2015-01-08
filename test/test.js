var protogram = require('../main');

exports['Exported Properly'] = function(test) {
    test.expect(4);

    test.equal(typeof protogram.options, 'object');
    test.equal(typeof protogram.flagged, 'object');
    test.equal(typeof protogram.parsed, 'object');
    test.equal(typeof protogram.raw_arguments, 'object');

    test.done();
};

exports['Add Options'] = function(test) {
    test.expect(3);

    protogram.option('--optionA').option('--optionB').option('--optionC');

    test.equal(typeof protogram.options.optionA, 'object');
    test.equal(typeof protogram.options.optionB, 'object');
    test.equal(typeof protogram.options.optionC, 'object');

    test.done();
};

exports['Automatic Shortcuts'] = function(test) {
    test.expect(3);

    test.equal(protogram.options.optionA.shortcut, 'o');
    test.equal(protogram.options.optionB.shortcut, 'p');
    test.equal(protogram.options.optionC.shortcut, 't');

    test.done();
};

exports['Set Option with Options'] = function(test) {
    test.expect(5);

    protogram.option('optionD', {
        shortcut: '----y',
        required: 'value',
        description: 'a description',
        action: function(err, value) {

        }
    });

    test.equal(typeof protogram.options.optionD, 'object');
    test.equal(protogram.options.optionD.shortcut, 'y');
    test.equal(protogram.options.optionD.description, 'a description');
    test.equal(protogram.options.optionD.required, 'value');
    test.equal(typeof protogram.options.optionD.action, 'function');

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

    protogram.parse(fake_argv);

    test.equal(protogram.raw_arguments._, fake_argv);

    // console.log("PARSED:::", protogram.parsed);

    test.equal(protogram.parsed._[0], fake_argv[2]);
    test.equal(protogram.parsed.number, 297261);
    test.equal(protogram.parsed.t, 'something');
    test.equal(protogram.parsed.x, 'something longer than just 1 word');
    test.equal(protogram.parsed.a, true);
    test.equal(protogram.parsed.e._[0], 'subcontext');
    test.equal(protogram.parsed.e.a, 'something else');
    test.equal(protogram.parsed.e.b, 276287);


    test.done();
};


exports['New Program'] = function(test) {

    test.expect(6);

    var new_protogram = protogram.create({root: true});

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

    var new_protogram = protogram.create({root: true}),
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

    var new_protogram = protogram.create({root: true}),
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

    var new_protogram = protogram.create({root: true}),
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
            root: true
        }),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-protogram/example/example.js",
            "--fail",
            "297261"
        ];

    new_protogram.required = 'filename';

    new_protogram.error = function(err, args, command) {
        // console.log("Main Required ERROR", err, args);        
        test.equal(JSON.stringify(err.message), JSON.stringify((new Error('Required argument <filename> missing for command: \'example\'').message)));
        testDone();

    };

    new_protogram.option('--fail', {
        action: function(err, args) {
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

    var new_protogram = protogram.create({root: true}),
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

    var new_protogram = protogram.create({root: true}),
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
        action: function(args) {
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

    var new_protogram = protogram.create({root: true}),
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


exports['tearDown'] = function(done) {
    done();
};

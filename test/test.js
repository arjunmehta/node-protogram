var program = require('../main');

exports['Exported Properly'] = function(test) {
    test.expect(4);

    test.equal(typeof program.options, 'object');
    test.equal(typeof program.selected, 'object');
    test.equal(typeof program.parsed, 'object');
    test.equal(typeof program.raw_arguments, 'object');

    test.done();
};

exports['Add Options'] = function(test) {
    test.expect(3);

    program.option('--optionA').option('--optionB').option('--optionC');

    test.equal(typeof program.options.optionA, 'object');
    test.equal(typeof program.options.optionB, 'object');
    test.equal(typeof program.options.optionC, 'object');

    test.done();
};

exports['Automatic Shortcuts'] = function(test) {
    test.expect(3);

    test.equal(program.options.optionA.shortcut, 'o');
    test.equal(program.options.optionB.shortcut, 'p');
    test.equal(program.options.optionC.shortcut, 't');

    test.done();
};

exports['Set Option with Options'] = function(test) {
    test.expect(5);

    program.option('optionD', {
        shortcut: '----y',
        required: 'value',
        description: 'a description',
        action: function(err, value) {

        }
    });

    test.equal(typeof program.options.optionD, 'object');
    test.equal(program.options.optionD.shortcut, 'y');
    test.equal(program.options.optionD.description, 'a description');
    test.equal(program.options.optionD.required, 'value');
    test.equal(typeof program.options.optionD.action, 'function');

    test.done();
};

exports['Parse Arguments'] = function(test) {

    test.expect(9);

    var fake_argv = [
        "node",
        "/Users/arjun/Working/node-minimarg/example/example.js",
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

    program.parse(fake_argv);

    test.equal(program.raw_arguments._, fake_argv);

    test.equal(program.parsed._[0], fake_argv[2]);
    test.equal(program.parsed.number, 297261);
    test.equal(program.parsed.t, 'something');
    test.equal(program.parsed.x, 'something longer than just 1 word');
    test.equal(program.parsed.a, true);
    test.equal(program.parsed.e._[0], 'subcontext');
    test.equal(program.parsed.e.a, 'something else');
    test.equal(program.parsed.e.b, 276287);

    // console.log(program);

    test.done();
};


exports['New Program'] = function(test) {

    test.expect(6);

    var new_program = program.createProgram();

    test.equal(typeof new_program.options, 'object');
    test.equal(typeof new_program.selected, 'object');
    test.equal(typeof new_program.parsed, 'object');
    test.equal(typeof new_program.raw_arguments, 'object');
    test.equal(new_program.parsed._, undefined);
    test.equal(new_program.raw_arguments._, undefined);

    test.done();
};


exports['Action Execution'] = function(test) {

    test.expect(2);

    var new_program = program.createProgram(),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-minimarg/example/example.js",
            "-g",
            "a string variable",
            "-u",
            "297261"
        ];

    new_program.option('good', {
        action: function(err, value) {
            test.equal(value, "a string variable");
            executed++;
            testDone();
        }
    });

    new_program.option('user', {
        action: function(err, value) {
            test.equal(value, 297261);
            executed++;
            testDone();
        }
    });

    new_program.parse(fake_argv);

    // console.log(program);
    function testDone() {
        if (executed == 2) {
            test.done();
        }
    }
};


exports['Required'] = function(test) {

    test.expect(2);

    var another_new_program = program.createProgram(),
        executed = 0,
        fake_argv = [
            "node",
            "/Users/arjun/Working/node-minimarg/example/example.js",
            "-g",
            "-u",
            "297261"
        ];

    another_new_program.option('good', {
        required: 'some string',
        action: function(err, value) {
            if (err) {
                test.equal(JSON.stringify(err), JSON.stringify(new Error('Flag "good" requires a value: some string]')));
                executed++;
                testDone();
            }
        }
    });

    another_new_program.option('user', {
        action: function(err, value) {
            test.equal(value, 297261);
            executed++;
            testDone();
        }
    });

    another_new_program.parse(fake_argv);

    // console.log(program);
    function testDone() {
        if (executed == 2) {
            test.done();
        }
    }
};


exports['tearDown'] = function(done) {
    done();
};

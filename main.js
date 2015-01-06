var subarg = require('subarg');


function Prorogram(opts) {

    Object.defineProperty(this, 'opts', {
        enumerable: false,
        value: opts || {}
    });

    this.options = {};
    this.commands = {};

    this.raw_arguments = {};
    this.parsed = {};

    this.selected = {};
}

// Prototype Setter/Getter Properties

Object.defineProperty(Prorogram.prototype, "command_name", {
    enumerable: true,
    get: function() {
        return this.opts.command_name;
    }
});

Object.defineProperty(Prorogram.prototype, "parent_command", {
    enumerable: true,
    get: function() {
        return this.opts.parent_command;
    }
});

Object.defineProperty(Prorogram.prototype, "action", {
    enumerable: true,
    get: function() {
        return this.opts.action;
    },
    set: function(fn) {
        this.opts.action = fn;
    }
});

Object.defineProperty(Prorogram.prototype, "error", {
    enumerable: true,
    get: function() {
        return this.opts.error;
    },
    set: function(fn) {
        this.opts.error = fn;
    }
});

Object.defineProperty(Prorogram.prototype, "required", {
    enumerable: true,
    get: function() {
        return this.opts.required;
    },
    set: function(reqd) {
        this.opts.required = reqd;
    }
});

Object.defineProperty(Prorogram.prototype, "description", {
    enumerable: true,
    get: function() {
        return this.opts.description;
    },
    set: function(desc) {
        this.opts.description = desc;
    }
});


// Main API Methods

Prorogram.prototype.create = function create(opts) {
    return new Prorogram(opts);
};

Prorogram.prototype.option = function(flag_name, opts, fn) {

    opts = mergeOpts(opts, fn);

    if (typeof flag_name !== 'string') {
        throw new Error("Missing Option Flag Name");
    }

    opts.flag_name = flag_name = clearLeadingDashes(flag_name);
    opts.shortcut = createShortcut(opts.shortcut, flag_name, this.options);
    opts.parent_command = this;

    this.options[flag_name] = opts;

    if (typeof opts.added === 'function') {
        opts.added(this, this.options[flag_name]);
    }

    return this;
};

Prorogram.prototype.command = function(command_name, opts, fn) {

    opts = mergeOpts(opts, fn);

    if (typeof command_name !== 'string') {
        throw new Error("Missing Command Name");
    }

    opts.command_name = command_name;
    opts.parent_command = this;

    this.commands[command_name] = new Prorogram(opts);

    return this.commands[command_name];
};

Prorogram.prototype.parse = function(argv) {

    if (!Array.isArray(argv) && typeof argv === 'object') {
        argv = this.rebuildArgArray(argv);
    }

    this.parsed = subarg(argv);
    this.raw_arguments = {
        _: argv
    };

    if (!evaluateCommand(this, this.parsed, argv, this.commands)) {
        evaluateFlags(this, this.parsed, this.options);
    }
};


// Core Functional Evaluation Methods

function evaluateFlags(program, args, options) {

    var value = null,
        err = null,
        flag = null;

    for (var flag_name in options) {

        flag = options[flag_name];
        value = args[flag_name] || args[flag.shortcut];

        if (value) {
            if (flag.required && value === true) {
                err = new Error('Required argument <' + flag.required + '> missing for flag: \'--' + flag_name + '\'');
            } else {
                err = null;
            }

            program.selected[flag_name] = value;

            if (err !== null && typeof flag.error === 'function') {
                flag.error(err, remaining_args, program);
            } else if (typeof flag.action === 'function') {
                flag.action(err, value, program);
            }
        }
    }
}


function processUniversalCommand(global_command, program) {

    var recursive = global_command.opts.recursive,
        global_options = global_command.options,
        global_commands = global_command.commands,
        has_action = (global_command.action),
        has_error = (global_command.error);


    for (var command_name in program.commands) {
        addToCommand(program.commands[command_name],
            global_command,
            global_options,
            global_commands,
            has_action,
            has_error,
            recursive);
    }

    if (global_command.opts.includeRoot) {
        addToCommand(program,
            global_command,
            global_options,
            global_commands,
            has_action,
            has_error,
            false);
    }
}

function addToCommand(command, global_command, global_options, global_commands, recursive) {

    for (var global_flag_name in global_options) {
        if (command.options[global_flag_name] === undefined) {
            command.options[global_flag_name] = global_options[flag_name];
        }
    }

    for (var global_command_name in global_commands) {

        if (recursive) {
            addToCommand(command.commands[global_command_name],
                global_command,
                global_options,
                global_commands,
                has_action,
                has_error,
                recursive);
        }

        if (!command.action && global_command.action) {
            command.action = global_command.action;
        }

        if (!command.error && global_command.error) {
            command.error = global_command.error;
        }

        if (command.commands[global_command_name] === undefined) {
            command.commands[global_command_name] = global_commands[global_command_name];
        }
    }
}

function evaluateCommand(program, parse_args, argv, commands) {

    var possible_commands = parse_args._,
        command,
        possible,
        remaining_args,
        err;

    if (program.commands['*']) {
        processUniversalCommand(program.commands['*'], program);
    }

    for (var i = 0; i < possible_commands.length; i++) {

        possible = possible_commands[i];

        for (var command_name in commands) {

            if (possible === command_name || possible === commands[command_name].alias) {

                command = commands[command_name];

                if (command.required && possible_commands[i + 1] === undefined) {
                    err = new Error('Required argument <' + command.required + '> missing for command: \'' + command_name + '\'');
                } else {
                    err = null;
                }

                remaining_args = argv.slice(i);
                command.parse(remaining_args);

                if (err !== null && typeof command.error === 'function') {
                    command.error(err, remaining_args, command);
                } else if (typeof command.action === 'function') {
                    command.action(err, remaining_args, command);
                }

                return true;
            }
        }
    }
    return false;
}


// Extra Sauce API Methods

Prorogram.prototype.rebuildArgString = function(parsed_args) {
    return unparse(parsed_args).command_string;
};

Prorogram.prototype.rebuildArgArray = function(parsed_args) {
    return unparse(parsed_args);
};


function createShortcut(shortcut, flag_name, options) {

    var exists;

    if (!shortcut) {
        for (var i = 0; i < flag_name.length; i++) {
            exists = false;
            shortcut = flag_name[i];
            for (var flag in options) {
                if (options[flag].shortcut === shortcut) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                break;
            }
        }
    } else {
        shortcut = clearLeadingDashes(shortcut);
    }
    return shortcut;
}

function clearLeadingDashes(str) {
    for (var i = 0; i < str.length; i++) {
        if (str[i] !== '-')
            break;
    }
    return str.slice(i);
}

function mergeOpts(opts, fn) {
    opts = opts || {};

    if (typeof opts === 'function' && fn === undefined) {
        fn = opts;
        opts = {};
    }
    if (typeof fn === 'function' && typeof opts.action !== 'function') {
        opts.action = fn;
    }

    return opts;
}


module.exports = exports = new Prorogram({
    root: true
});

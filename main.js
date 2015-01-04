var subarg = require('subarg');


function Prorogram(opts) {
    this.opts = opts || {};

    this.options = {};
    this.commands = {};

    this.raw_arguments = {};
    this.parsed = {};

    this.selected = {};
}

Object.defineProperty(Prorogram.prototype, "action", {
    enumerable: false,
    get: function() {
        return this.options.action;
    },
    set: function(fn) {
        this.options.action = fn;
    }
});

Prorogram.prototype.create = function create(opts) {
    return new Prorogram(opts);
};


// Main API Methods

Prorogram.prototype.option = function(flag_name, opts, fn) {

    opts = mergeOpts(opts, fn);

    if (typeof flag_name !== 'string') {
        throw new Error("Hey prorogram developer: You must specify at least a flag name when setting an option for your program");
    }

    opts.flag_name = flag_name = clearLeadingDashes(flag_name);
    opts.shortcut = createShortcut(opts.shortcut, flag_name, this.options);
    opts.description = opts.description || '';

    this.options[flag_name] = opts;

    return this;
};

Prorogram.prototype.command = function(command_name, opts, fn) {

    opts = mergeOpts(opts, fn);

    if (typeof command_name !== 'string') {
        throw new Error("Hey prorogram developer: You must specify at least a command name when setting a command for your program");
    }

    opts.command_name = command_name;
    opts.description = opts.description || '';

    this.commands[command_name] = this.createProrogram(opts);

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

    if (!evalCmd(this, this.parsed, argv, this.commands)) {
        evalFlags(this, this.parsed, this.options);
    }
};


function evalFlags(program, args, options) {

    var value = null,
        err = null,
        flag = null;

    for (var flag_name in options) {

        flag = options[flag_name];
        value = args[flag_name] || args[flag.shortcut];

        if (value) {
            if (flag.required && value === true) {
                err = new Error('Flag "' + flag_name + '" requires a value: ' + flag.required);
            } else {
                err = null;
            }

            program.selected[flag_name] = value;

            if (typeof flag.action === 'function') {
                flag.action(err, value);
            }
        }
    }
}


function evalCmd(program, parse_args, argv, commands) {

    var possible_commands = parse_args._,
        command, possible;

    for (var i = 0; i < possible_commands.length; i++) {
        possible = possible_commands[i];

        for (var command_name in commands) {
            if (possible === command_name || possible === commands[command_name].alias) {

                command = commands[command_name];
                command.parse(argv.slice(i));

                if (typeof command.action === 'function') {
                    command.action(err, value);
                }
                return true;
            }
        }
    }

    return false;
}


// Extra Sauce API Methods

Prorogram.prototype.rebuildArgString = function(parsed_args) {
    return this.unparse(parsed_args, 'string');
};

Prorogram.prototype.rebuildArgArray = function(parsed_args) {
    return this.unparse(parsed_args, 'array');
};


Prorogram.prototype.renderFlagDetails = function(flag_name) {

    var flag = this.options[flag_name],
        str = '';

    str += flag.shortcut ? '-' + flag.shortcut + ', ' : '    ';
    str += '--' + flag_name;
    str += ' ' + (flag.required ? '<' + flag.required + '> ' : (flag.optional ? '[' + flag.optional + '] ' : ' '));

    return str;
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

module.exports = exports = new Prorogram();

var path = require('path');
var subarg = require('subarg');

function create(opts) {
    opts = opts || {};
    opts.root = true;
    return new Protogram(opts);
}

function Protogram(opts) {

    opts = opts || {};

    Object.defineProperty(this, 'opts', {
        enumerable: false,
        value: opts
    });

    this.options = {};
    this.commands = {};

    this.raw_arguments = {};
    this.parsed = {};

    this.flagged = {};
}


// Prototype Setter/Getter Properties

Object.defineProperty(Protogram.prototype, "command_name", {
    enumerable: true,
    get: function() {
        return this.opts.command_name;
    }
});

Object.defineProperty(Protogram.prototype, "parent_command", {
    enumerable: true,
    get: function() {
        return this.opts.parent_command;
    }
});

Object.defineProperty(Protogram.prototype, "action", {
    enumerable: true,
    get: function() {
        return this.opts.action;
    },
    set: function(fn) {
        this.opts.action = fn;
    }
});

Object.defineProperty(Protogram.prototype, "error", {
    enumerable: true,
    get: function() {
        return this.opts.error;
    },
    set: function(fn) {
        this.opts.error = fn;
    }
});

Object.defineProperty(Protogram.prototype, "required", {
    enumerable: true,
    get: function() {
        return this.opts.required;
    },
    set: function(reqd) {
        this.opts.required = reqd;
    }
});

Object.defineProperty(Protogram.prototype, "description", {
    enumerable: true,
    get: function() {
        return this.opts.description;
    },
    set: function(desc) {
        this.opts.description = desc;
    }
});


// Core API Methods

Protogram.prototype.option = function(flag_name, opts, fn) {

    if (typeof flag_name !== 'string') {
        throw new Error("Missing Option Flag Name");
    }

    opts = mergeOpts(opts, fn);
    opts.flag_name = flag_name = clearLeadingDashes(flag_name);
    opts.shortcut = createShortcut(opts.shortcut, flag_name, this.options);
    opts.parent_command = this;

    this.options[flag_name] = opts;

    if (typeof opts.added === 'function') {
        opts.added.call(this, this.options[flag_name]);
    }

    return this;
};

Protogram.prototype.command = function(command_name, opts, fn) {

    if (typeof command_name !== 'string') {
        throw new Error("Missing Command Name");
    }

    var command;
    opts = mergeOpts(opts, fn);
    opts.command_name = command_name;

    if (command_name === '*') {
        command = new Protogram(opts);
        this.wildcard = command;
    } else {
        opts.parent_command = this;
        command = new Protogram(opts);
        this.commands[command_name] = command;
    }

    return command;
};

Protogram.prototype.parse = function(argv) {

    if (!Array.isArray(argv) && typeof argv === 'object') {
        argv = this.rebuildArgArray(argv);
    }

    if (this.opts.root) {
        this.opts.command_name = path.basename(argv[1], '.js');
    }

    this.parsed = subarg(argv);
    this.raw_arguments = {
        _: argv
    };
    this.evaluate(this.parsed);
};

Protogram.prototype.evaluate = function(parsed) {

    var possible_commands = parsed._,
        err = null,
        terminal = true,
        args = [],
        flags = {},
        command;

    if (this.opts.root) {
        possible_commands.splice(0, 2);
    }

    args = possible_commands.slice(0);

    this.applyWildCard();

    err = evalRequiredError((this.required && possible_commands.length === 0), this.required, 'command', this.command_name);

    if (err !== null) {
        if (typeof this.error === 'function') {
            this.error(err, parsed);
        }
        return;
    }

    for (var i = 0; i < possible_commands.length; i++) {
        command = this.commands[possible_commands[i]];
        if (command) {
            args = parsed._.splice(0, i + 1);
            args.pop();
            terminal = false;
            command.evaluate(parsed);
            break;
        }
    }

    if (terminal === true) {
        flags = this.evaluateFlags(parsed);
    }

    if (typeof this.action === 'function') {
        this.action(args, flags);
    }
};

Protogram.prototype.evaluateFlags = function(parsed) {

    var value = null,
        err = null,
        flag = null,
        options = this.options;

    for (var flag_name in options) {

        flag = options[flag_name];
        value = parsed[flag.shortcut] || parsed[flag_name];

        if (value) {
            this.flagged[flag_name] = value;

            err = evalRequiredError((flag.required && value === true), flag.required, 'flag', '--' + flag_name);

            if (err !== null) {
                if (typeof this.error === 'function') {
                    this.error(err, parsed);
                }
                if (typeof flag.error === 'function') {
                    flag.error.call(this, err, parsed);
                }
                continue;
            }

            if (typeof flag.action === 'function') {
                flag.action.call(this, value);
            }
        }
    }

    return this.flagged;
};

Protogram.prototype.applyWildCard = function() {

    var wildcard = this.wildcard;

    if (!wildcard) return;

    // if recursive add wildcard to sub commands BEFORE the wildcard commands are added to prevent infinite recursion

    if (wildcard.recursive || this.opts.root) {
        for (var command_name in this.commands) {
            this.commands[command_name].wildcard = wildcard;
        }
    }

    if (!this.opts.root || (this.opts.root && wildcard.opts.includeRoot)) {
        mergeProperties(this.commands, wildcard.commands);
        mergeProperties(this.options, wildcard.options);
        mergeProperties(this.opts, wildcard.opts);
    }
};


// Extra Sauce API Methods

Protogram.prototype.rebuildArgString = function(parsed_args) {
    return unparse(parsed_args).command_string;
};

Protogram.prototype.rebuildArgArray = function(parsed_args) {
    return unparse(parsed_args);
};


// Core Helper Methods

function evalRequiredError(condition, required, type, name) {
    if (condition) {
        return new Error('Required argument <' + required + '> missing for ' + type + ': \'' + name + '\'');
    }
    return null;
}

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

function mergeProperties(objectA, objectB) {
    for (var prop in objectB) {
        if (!objectA[prop]) {
            objectA[prop] = objectB[prop];
        }
    }
}


// module.exports = exports = new Protogram({
//     root: true
// });

module.exports = exports = {
    create: create,
    Protogram: Protogram
};
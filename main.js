var subarg = require('subarg');

function Program() {
    this.options = {};
    this.raw_arguments = {};
    this.raw_parsed = {};
    this.parsed = {};
}

Program.prototype.createProgram = Program.prototype.newProgram = function() {
    return new Program();
};

// Main API Methods

Program.prototype.option = function(flag_name, options) {

    options = options || {};

    if (typeof flag_name !== 'string') {
        throw new Error("Hey minimarg developer: You must specify at least a flag name when setting an option for your program");
    }

    options.flag_name = flag_name = clearLeadingDashes(flag_name);
    options.shortcut = createShortcut(options.shortcut, flag_name, this.options);
    options.description = options.description || '';

    this.options[flag_name] = options;

    return this;
};

Program.prototype.parse = function(argv) {

    if (!Array.isArray(argv) && typeof argv === 'object') {
        argv = this.buildSpawnArray(argv);
    }

    var value = null,
        args = subarg(argv),
        err = null,
        flag = null;

    this.raw_arguments = {
        _: argv
    };

    this.raw_parsed = args;

    for (var flag_name in this.options) {

        flag = this.options[flag_name];
        value = args[flag_name] || args[flag.shortcut];

        if (value) {
            if (flag.required && value === true) {
                err = new Error('Flag "' + flag_name + '" requires a value: ' + flag.required);
            } else {
                err = null;
            }


            this.parsed[flag_name] = value;


            if (typeof flag.action === 'function') {
                flag.action(err, value);
            }
        }
    }
};


// Extra Sauce API Methods

Program.prototype.buildExecString = function(subContext) {
    return this.buildCommand(subContext, 'string');
};

Program.prototype.buildSpawnArray = function(subContext) {
    return this.buildCommand(subContext, 'array');
};

Program.prototype.buildCommand = function(subContext, type) {

    var op,
        obj;
        
    if (type === 'array') {
        obj = [];
        op = concatArray;
    } else {
        obj = '';
        op = concatString;
    }

    for (var option in subContext) {
        if (option !== '_') {
            if (option.length === 1) {
                obj = op(obj, '-' + option);
            } else {
                obj = op(obj, '--' + option);
            }
        }

        if (subContext[option] === 'true') {
            continue;
        } else {
            if (Array.isArray(subContext[option])) {
                for (var i = 0; i < subContext[option].length; i++) {
                    obj = op(obj, subContext[option][i]);
                }
            } else if (typeof subContext[option] === 'string') {
                obj = op(obj, (type === 'array') ? '' + subContext[option] : '"' + subContext[option] + '"');
            } else if (typeof subContext[option] === 'number') {
                obj = op(obj, '' + subContext[option]);
            } else if (typeof subContext[option] === 'object') {
                obj = op(obj, '[ ' + this.flattenSubcontext(subContext[option]) + ' ]');
            }
        }
    }

    return obj;
};

Program.prototype.renderFlagDetails = function(flag_name) {

    var flag = this.options[flag_name],
        str = '';

    str += flag.shortcut ? '-' + flag.shortcut + ', ' : '    ';
    str += '--' + flag_name;
    str += ' ' + (flag.required ? '<' + flag.required + '> ' : (flag.optional ? '[' + flag.optional + '] ' : ' '));

    return str;
};

function concatString(str, addition) {
    return str += addition + ' ';
}

function concatArray(arr, addition) {
    arr.push(addition);
    return arr;
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

module.exports = exports = new Program();

var subarg = require('subarg');

function Program() {
    this.options = {};
    this.raw_arguments = {};
    this.parsed = {};
    this.selected = {};
}

Program.prototype.option = function(settings) {

    var flag = settings.flag;

    if (!flag) {
        return new Error("You must specify at least a flag name when setting an option");
    }

    settings.flag = clearLeadingDashes(flag);
    settings.shortcut = createShortcut(settings.shortcut, flag);

    this.options[flag] = settings;

    return this;
};

function createShortcut(shortcut, flag) {
    if (!shortcut) {
        shortcut = flag[0];
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

Program.prototype.parse = function(argv) {

    var value = null;
    var args = subarg(argv);

    this.raw_arguments = argv;
    this.parsed = args;

    for (var option in this.options) {

        value = args[option] || args[this.options[option].shortcut];

        if (value) {

            used_flag = (args[option]) ? '--' + args[option] : '-' + args[this.options[option].shortcut];

            this.selected[option] = value;

            if (typeof this.options[option].action === 'function') {
                this.options[option].action(value);
            }
        }
    }
};

Program.prototype.flatten = function(flag) {
    return this.flattenSubcontext(this.selected[flag]);
};


Program.prototype.flattenSubcontext = function(subContext) {

    var str = '';

    for (var option in subContext) {
        if (option !== '_') {
            if (option.length === 1) {
                str += '-' + option + ' ';
            } else {
                str += '--' + option + ' ';
            }
        }

        if (subContext[option] === 'true') {
            continue;
        } else {
            if (Array.isArray(subContext[option])) {
                for (var i = 0; i < subContext[option].length; i++) {
                    str += subContext[option][i] + ' ';
                }
            } else if (typeof subContext[option] === 'string') {
                str += '"' + subContext[option] + '" ';
            } else if (typeof subContext[option] === 'number') {
                str += '' + subContext[option] + ' ';
            } else if (typeof subContext[option] === 'object') {
                str += '[ ' + this.flattenSubcontext(subContext[option]) + ' ] ';
            }
        }
    }

    return str;
};


module.exports = exports = new Program();

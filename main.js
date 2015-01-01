var subarg = require('subarg');

function Program() {
    this.options = {};
    this.raw_arguments = {};
    this.parsed = {};
    this.selected = {};
}

Program.prototype.option = function(flag, shortcut, description, fn) {

    if (flag.substr(0, 2) === '--') {
        flag = flag.slice(2);
    }

    this.options[flag] = {
        shortcut: shortcut.slice(1),
        description: description,
        action: fn,
        program: this,
        value: null,
        raw_value: null
    };

    return this;
};

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
            this.options[option].action(value);
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

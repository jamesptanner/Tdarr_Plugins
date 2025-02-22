"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Remove Stream By Property',
    description: 'Remove Stream By Property',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Codec Type To Check',
            name: 'codecTypeToCheck',
            type: 'string',
            defaultValue: 'codec_type',
            inputUI: {
                type: 'dropdown',
                options: [
                    'any',
                    'video',
                    'audio',
                    'subtitle'
                ],
            },
            tooltip: "\n        Specifiy the codec stream type to process\n        ",
        },
        {
            label: 'Property To Check',
            name: 'propertyToCheck',
            type: 'string',
            defaultValue: 'codec_name',
            inputUI: {
                type: 'text',
            },
            tooltip: "\n        Enter one stream property to check.\n        \n        \\nExample:\\n\n        codec_name\n\n        \\nExample:\\n\n        tags.language\n        ",
        },
        {
            label: 'Values To Remove',
            name: 'valuesToRemove',
            type: 'string',
            defaultValue: 'aac',
            inputUI: {
                type: 'text',
            },
            tooltip: "\n        Enter values of the property above to remove. For example, if removing by codec_name, could enter ac3,aac:\n        \n        \\nExample:\\n\n        ac3,aac\n        ",
        },
        {
            label: 'Condition',
            name: 'condition',
            type: 'string',
            defaultValue: 'includes',
            inputUI: {
                type: 'dropdown',
                options: [
                    'includes',
                    'not_includes',
                ],
            },
            tooltip: "\n      Specify whether to remove streams that include or do not include the values above.\n      ",
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    var propertyToCheck = String(args.inputs.propertyToCheck).trim();
    var valuesToRemove = String(args.inputs.valuesToRemove).trim().split(',');
    var condition = String(args.inputs.condition);
    var codecTypeToCheck = String(args.inputs.codecTypeToCheck);
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        var _a;
        if (codecTypeToCheck === 'any' || stream.codec_type === codecTypeToCheck) {
            var target = '';
            if (propertyToCheck.includes('.')) {
                var parts = propertyToCheck.split('.');
                target = (_a = stream[parts[0]]) === null || _a === void 0 ? void 0 : _a[parts[1]];
            }
            else {
                target = stream[propertyToCheck];
            }
            if (target) {
                var prop = String(target).toLowerCase();
                var removeStream = (condition !== 'includes'); //not_includes = true, includes = false
                for (var i = 0; i < valuesToRemove.length; i += 1) {
                    var val = valuesToRemove[i].toLowerCase();
                    if (condition === 'includes' && prop.includes(val)) {
                        args.jobLog("inc, ".concat(prop, " == ").concat(val, ", remove\n"));
                        removeStream = true;
                    }
                    else if (condition === 'not_includes' && prop.includes(val)) {
                        args.jobLog("!inc, ".concat(prop, " == ").concat(val, ", keep\n"));
                        removeStream = false;
                    }
                }
                if (removeStream) {
                    args.jobLog("Removing stream index ".concat(stream.index, " because ").concat(propertyToCheck, " of ").concat(prop, " ").concat(condition, " ").concat(valuesToRemove, "\n"));
                    stream.removed = true;
                }
                else {
                    args.jobLog("Keeping stream index ".concat(stream.index, " because ").concat(propertyToCheck, " of ").concat(prop, " ").concat(condition, " ").concat(valuesToRemove, "\n"));
                }
            }
        }
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;

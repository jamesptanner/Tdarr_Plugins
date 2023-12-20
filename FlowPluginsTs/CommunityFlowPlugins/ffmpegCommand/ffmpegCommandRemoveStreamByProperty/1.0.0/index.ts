import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
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
      tooltip:
        `
        Specifiy the codec stream type to process
        `,
    },
    {
      label: 'Property To Check',
      name: 'propertyToCheck',
      type: 'string',
      defaultValue: 'codec_name',
      inputUI: {
        type: 'text',
      },
      tooltip:
        `
        Enter one stream property to check.
        
        \\nExample:\\n
        codec_name

        \\nExample:\\n
        tags.language
        `,
    },
    {
      label: 'Values To Remove',
      name: 'valuesToRemove',
      type: 'string',
      defaultValue: 'aac',
      inputUI: {
        type: 'text',
      },
      tooltip:
        `
        Enter values of the property above to remove. For example, if removing by codec_name, could enter ac3,aac:
        
        \\nExample:\\n
        ac3,aac
        `,
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
      tooltip: `
      Specify whether to remove streams that include or do not include the values above.
      `,
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Continue to next plugin',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const propertyToCheck = String(args.inputs.propertyToCheck).trim();
  const valuesToRemove = String(args.inputs.valuesToRemove).trim().split(',');
  const condition = String(args.inputs.condition);
  const codecTypeToCheck = String(args.inputs.codecTypeToCheck);

  args.variables.ffmpegCommand.streams.forEach((stream) => {
    if (codecTypeToCheck === 'any' || stream.codec_type=== codecTypeToCheck){
      let target = '';
      if (propertyToCheck.includes('.')) {
        const parts = propertyToCheck.split('.');
        target = stream[parts[0]]?.[parts[1]];
      } else {
        target = stream[propertyToCheck];
      }

      if (target) {
        const prop = String(target).toLowerCase();
        let removeStream = (condition !== 'includes'); //not_includes = true, includes = false
        for (let i = 0; i < valuesToRemove.length; i += 1) {
          const val = valuesToRemove[i].toLowerCase();

          if (condition === 'includes' && prop.includes(val)) {
            args.jobLog(`inc, ${prop} == ${val}, remove\n`);
            removeStream = true;
          } else if (condition === 'not_includes' && prop.includes(val)) {
            args.jobLog(`!inc, ${prop} == ${val}, keep\n`);
            removeStream = false;
          }
        }      
        if (removeStream){
          args.jobLog(`Removing stream index ${stream.index} because ${propertyToCheck} of ${prop} ${condition} ${valuesToRemove}\n`);
          stream.removed = true;
        }
        else {        
          args.jobLog(`Keeping stream index ${stream.index} because ${propertyToCheck} of ${prop} ${condition} ${valuesToRemove}\n`);
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
export {
  details,
  plugin,
};

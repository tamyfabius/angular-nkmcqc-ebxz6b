// Define interfaces to improve type safety and readability
interface ChannelParameter {
  port?: string;
  ports?: string[];
  protocol?: string;
  code?: string;
  type?: string;
  description?: string;
}

interface ChannelGroupAction {
  action: string;
  channelId: string;
  typeId: string;
  parameters: string;
}

/**
 * Process channel group data into a formatted array.
 * @param data The raw input data to process.
 * @returns A formatted array of channel group actions.
 */
buildChannelGroupData(data: any): ChannelGroupAction[] {
  // Initialize the result array
  const result: ChannelGroupAction[] = [];

  // Helper function to process parameters
  const extractParameters = (parameters: ChannelParameter) => {
    return Object.entries(parameters)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(' ')}`;
        }
        return `${key}: ${value}`;
      })
      .join('\n');
  };

  // Helper function to build an object for the result array
  const buildChannelGroupObject = (
    action: string,
    channelId: string,
    typeId: string,
    parameters: string
  ): ChannelGroupAction => ({
    action,
    channelId,
    typeId,
    parameters,
  });

  // Process the data
  Object.entries(data).forEach(([action, channelData]) => {
    if (Array.isArray(channelData)) {
      // Handle added, removed, or reordered channel groups
      const channelGroups = channelData.join('"\n"');
      result.push(buildChannelGroupObject(action, channelGroups, 'channelGroup', ''));
    } else {
      // Handle modified channels or channel groups
      Object.entries(channelData).forEach(([channelId, { modified }]) => {
        if (modified.members) {
          // Handle modified channel groups
          Object.entries(modified.members).forEach(([memberAction, members]) => {
            if (typeof members === 'string') {
              // Handle modified channel list
              result.push(buildChannelGroupObject(memberAction, channelId, 'channelGroup', members));
            } else {
              // Handle modified parameters
              const parameters = extractParameters(members as ChannelParameter);
              result.push(buildChannelGroupObject(memberAction, channelId, 'channelGroup', parameters));
            }
          });
        } else if (modified.channel) {
          // Handle modified individual channels
          const parameters = extractParameters(modified.channel);
          result.push(buildChannelGroupObject('modified', channelId, 'channel', parameters));
        }
      });
    }
  });

  return result;
}

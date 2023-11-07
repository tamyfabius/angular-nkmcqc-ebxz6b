/**
   * @function buildChannelGroupData
   */
buildChannelGroupData(data: any): Array<{
  action: string;
  channelId: string;
  typeId: string;
  parameters: string;
}> {
  /*
  ChannelGroup data format:

    - ChannelGroup :
    "channel_group_id": {
      "modified": {
        "members": {
          "added": [
            "channel_id"

    - Channel :
    "channel_id": {
      "modified": {
        "channel": {
          "description": "description_id",
          "ports": [
            "port_number",
          ],
          "protocol": "protocol_id"

  Formatting in a table: 4 columns
  --------------------------------------------------------------------------------------------------------------------------------------------------
  | action | type (channel_group / channel) | channel_group_id / channel_id |  list of members / channel parameters (ports, protocol, description) |
  --------------------------------------------------------------------------------------------------------------------------------------------------
  */
  let channelGroupsAdded = '';
  let channelGroupsRemoved = '';
  let channelGroupsReordered = '';
  let parametersList = '';
  let channelList = '';
  const result: Array<{
    action: string;
    channelId: string;
    typeId: string;
    parameters: string;
  }> = [];

  // route of the 1st action
  // eslint-disable-next-line guard-for-in
  for (const action1 in data) {
    if (data[action1] instanceof Array) {
      // channel groups are added or removed or reordered
      // all channel groups with the same action are in the same row
      // eslint-disable-next-line guard-for-in
      for (const channel in data[action1]) {
        switch (action1) {
          case 'added':
            channelGroupsAdded += '"' + data[action1][channel] + '"\n';
            break;
          case 'removed':
            channelGroupsRemoved += '"' + data[action1][channel] + '"\n';
            break;
          case 'reordered':
            channelGroupsReordered += '"' + data[action1][channel] + '"\n';
            break;
          default:
            console.error(`${action1}: 1st action error`);
            break;
        }
      }
      // COLUMN 1 : action1
      // COLUMN 2 : 'channelGroup'
      // COLUMN 3 : channelGroupsAdded OR channelGroupsRemoved OR channelGroupsReordered
      if (channelGroupsAdded !== '') {
        result.push(
          this.buildChannelGroupObject(
            action1,
            channelGroupsAdded,
            'channelGroup',
            ''
          )
        );
        channelGroupsAdded = '';
      }
      if (channelGroupsRemoved !== '') {
        result.push(
          this.buildChannelGroupObject(
            action1,
            channelGroupsRemoved,
            'channelGroup',
            ''
          )
        );
        channelGroupsRemoved = '';
      }
      if (channelGroupsReordered !== '') {
        result.push(
          this.buildChannelGroupObject(
            action1,
            channelGroupsReordered,
            'channelGroup',
            ''
          )
        );
        channelGroupsReordered = '';
      }
    } else if (typeof data[action1] === 'object') {
      //channels or channel groups are modified
      // route of the channels Id
      // eslint-disable-next-line guard-for-in
      for (const channelsId in data[action1]) {
        // route of the channel type
        // eslint-disable-next-line guard-for-in
        for (const typeId in data[action1][channelsId].modified) {
          switch (typeId) {
            // a channel group is modified
            case 'members':
              // route of the 2nd action
              // eslint-disable-next-line guard-for-in
              for (const action2 in data[action1][channelsId].modified
                .members) {
                // eslint-disable-next-line guard-for-in
                for (const element in data[action1][channelsId].modified
                  .members[action2]) {
                  // channels are modified
                  if (
                    typeof data[action1][channelsId].modified.members[
                      action2
                    ][element] === 'string'
                  ) {
                    channelList +=
                      '"' +
                      data[action1][channelsId].modified.members[action2][
                        element
                      ] +
                      '"\n';
                    // parameters are modified (description, ports, protocol...)
                  } else {
                    if (
                      data[action1][channelsId].modified.members[action2][
                        element
                      ].port !== '' &&
                      data[action1][channelsId].modified.members[action2][
                        element
                      ].port !== undefined
                    ) {
                      parametersList += `port: ${data[action1][channelsId].modified.members[action2][element].port}\n`;
                    }
                    if (
                      data[action1][channelsId].modified.members[action2][
                        element
                      ].ports !== undefined
                    ) {
                      parametersList += `ports : `;
                      // eslint-disable-next-line guard-for-in
                      for (const ports in data[action1][channelsId].modified
                        .members[action2][element].ports) {
                        parametersList += `${data[action1][channelsId].modified.members[action2][element].ports[ports]} `;
                      }
                      parametersList += `\n`;
                    }
                    if (
                      data[action1][channelsId].modified.members[action2][
                        element
                      ].protocol !== '' &&
                      data[action1][channelsId].modified.members[action2][
                        element
                      ].protocol !== undefined
                    ) {
                      parametersList += `protocol: ${data[action1][channelsId].modified.members[action2][element].protocol}\n`;
                    }
                    if (
                      data[action1][channelsId].modified.members[action2][
                        element
                      ].code !== undefined
                    ) {
                      parametersList += `code: ${data[action1][channelsId].modified.members[action2][element].code}\n`;
                    }
                    if (
                      data[action1][channelsId].modified.members[action2][
                        element
                      ].type !== undefined
                    ) {
                      parametersList += `type: ${data[action1][channelsId].modified.members[action2][element].type}\n`;
                    }
                    if (
                      data[action1][channelsId].modified.members[action2][
                        element
                      ].description !== '' &&
                      data[action1][channelsId].modified.members[action2][
                        element
                      ].description !== undefined
                    ) {
                      parametersList += `description: ${data[action1][channelsId].modified.members[action2][element].description}\n`;
                    }
                    if (
                      data[action1][channelsId].modified.description !== '' &&
                      data[action1][channelsId].modified.description !==
                        undefined
                    ) {
                      parametersList += `channel description: ${data[action1][channelsId].modified.description}\n`;
                    }
                    if (
                      data[action1][channelsId].modified.type !== '' &&
                      data[action1][channelsId].modified.type !== undefined
                    ) {
                      parametersList += `channel type: ${data[action1][channelsId].modified.type}\n`;
                    }
                  }
                }
                // COLUMN 1 : action2
                // COLUMN 2 : channelsId
                // COLUMN 3 : 'channelGroup'
                // COLUMN 4 : channelList
                // channels are modified
                if (channelList !== '') {
                  result.push(
                    this.buildChannelGroupObject(
                      action2,
                      channelsId,
                      'channelGroup',
                      channelList
                    )
                  );
                  channelList = '';
                }
                // COLUMN 1 : action2
                // COLUMN 2 : channelsId
                // COLUMN 3 : 'channelGroup'
                // COLUMN 4 : parametersList
                // parameters are modified (description, ports, protocol...)
                if (parametersList !== '') {
                  result.push(
                    this.buildChannelGroupObject(
                      action2,
                      channelsId,
                      'channelGroup',
                      parametersList
                    )
                  );
                  parametersList = '';
                }
              }
              break;
            // a channel is modified
            case 'channel':
              if (
                data[action1][channelsId].modified.channel.port !== '' &&
                data[action1][channelsId].modified.channel.port !== undefined
              ) {
                parametersList += `port: ${data[action1][channelsId].modified.channel.port}\n`;
              }
              if (
                data[action1][channelsId].modified.channel.ports !== undefined
              ) {
                parametersList += `ports : `;
                // eslint-disable-next-line guard-for-in
                for (const ports in data[action1][channelsId].modified.channel
                  .ports) {
                  parametersList += `${data[action1][channelsId].modified.channel.ports[ports]} `;
                }
                parametersList += `\n`;
              }
              if (
                data[action1][channelsId].modified.channel.protocol !== '' &&
                data[action1][channelsId].modified.channel.protocol !==
                  undefined
              ) {
                parametersList += `protocol: ${data[action1][channelsId].modified.channel.protocol}\n`;
              }
              if (
                data[action1][channelsId].modified.channel.code !== undefined
              ) {
                parametersList += `code: ${data[action1][channelsId].modified.channel.code}\n`;
              }
              if (
                data[action1][channelsId].modified.channel.type !== undefined
              ) {
                parametersList += `type: ${data[action1][channelsId].modified.channel.type}\n`;
              }
              if (
                data[action1][channelsId].modified.channel.description !==
                  '' &&
                data[action1][channelsId].modified.channel.description !==
                  undefined
              ) {
                parametersList += `description: ${data[action1][channelsId].modified.channel.description}\n`;
              }
              if (
                data[action1][channelsId].modified.description !== '' &&
                data[action1][channelsId].modified.description !== undefined
              ) {
                parametersList += `channel description: ${data[action1][channelsId].modified.description}\n`;
              }
              if (
                data[action1][channelsId].modified.type !== '' &&
                data[action1][channelsId].modified.type !== undefined
              ) {
                parametersList += `channel type: ${data[action1][channelsId].modified.type}\n`;
              }
              // COLUMN 1 : 'modified'
              // COLUMN 2 : channelsId
              // COLUMN 3 : 'channel'
              // COLUMN 4 : parametersList
              result.push(
                this.buildChannelGroupObject(
                  'modified',
                  channelsId,
                  'channel',
                  parametersList
                )
              );
              parametersList = '';
              break;
            default:
              // channel description and channel type are added to the row in 'channel' case
              if (typeId !== 'description' && typeId !== 'type') {
                console.error(`${typeId}: type error`);
              } else {
                // modification on a parameter channel without infos about the channel
                if (
                  data[action1][channelsId].modified.description !== '' &&
                  data[action1][channelsId].modified.description !== undefined
                ) {
                  parametersList += `channel description: ${data[action1][channelsId].modified.description}\n`;
                }
                if (
                  data[action1][channelsId].modified.type !== '' &&
                  data[action1][channelsId].modified.type !== undefined
                ) {
                  parametersList += `channel type: ${data[action1][channelsId].modified.type}\n`;
                }
                // COLUMN 1 : 'modified'
                // COLUMN 2 : channelsId
                // COLUMN 3 : unknown
                // COLUMN 4 : parametersList
                result.push(
                  this.buildChannelGroupObject(
                    'modified',
                    channelsId,
                    '',
                    parametersList
                  )
                );
                parametersList = '';
              }
              break;
          }
        }
      }
    } else {
      console.error(
        `error: ${data[action1] instanceof Array} is not a boolean`
      );
    }
  }
  return result;
}

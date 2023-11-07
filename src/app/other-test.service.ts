buildWorkloadGroupData(data: any): Array<{
  action: string;
  workloadId: string;
  typeId: string;
  member: string;
}> {
  /*
  WorkloadGroup data format:

    - Changing the type of a workload
    "workloadId": {
        "modified": {
          "type": ""

    - Static :
    "workloadId": {
      "modified": {
        "members": {
          "action": [ // added, removed, reordered
            ""

    - Dynamic :
    "workloadId": {
      "modified": {
        "dynamic_members": {
          "action": [ // added, removed, reordered
            {
              "operator": ""
              "members": [
                {
                  "key": "",
                  "operator": "",
                  "value": ""
                },
              ],
            }
            {
              "key": "",
              "operator": "",
              "value": ""
            }
          ],

    - Complex :
    "workloadId": {
      "modified": {
        "group_members": {
          "action": [ // added, removed, reordered
            ""

  Formatting in a table: 4 columns
  ------------------------------------------------------------------------------------------------------------------------
  | action | workloadId | typeId (static/dynamic/complex) | member (json after "workloadId": { "modified": {"group_type":) |
  ------------------------------------------------------------------------------------------------------------------------
  */
  let workloadAdded = '';
  let workloadRemoved = '';
  let workloadReordered = '';
  let typeWorkload = '';
  let memberWorkload = '';
  const result: Array<{
    action: string;
    workloadId: string;
    typeId: string;
    member: string;
  }> = [];

  // route of the 1st action
  // eslint-disable-next-line guard-for-in
  for (const action1 in data) {
    if (data[action1] instanceof Array) {
      // workload groups are added or removed or reordered
      // all workload groups with the same action are in the same row
      // eslint-disable-next-line guard-for-in
      for (const workload in data[action1]) {
        switch (action1) {
          case 'added':
            workloadAdded += '"' + data[action1][workload] + '"\n';
            break;
          case 'removed':
            workloadRemoved += '"' + data[action1][workload] + '"\n';
            break;
          case 'reordered':
            workloadReordered += '"' + data[action1][workload] + '"\n';
            break;
          default:
            console.error(`${action1}: 1st action error`);
            break;
        }
      }
      // COLUMN 1 : action1
      // COLUMN 2 : workloadAdded OR workloadRemoved OR workloadReordered
      if (workloadAdded !== '') {
        result.push(
          this.buildWorkloadGroupObject(action1, workloadAdded, '', '')
        );
        workloadAdded = '';
      }
      if (workloadRemoved !== '') {
        result.push(
          this.buildWorkloadGroupObject(action1, workloadRemoved, '', '')
        );
        workloadRemoved = '';
      }
      if (workloadReordered !== '') {
        result.push(
          this.buildWorkloadGroupObject(action1, workloadReordered, '', '')
        );
        workloadReordered = '';
      }
    } else if (typeof data[action1] === 'object') {
      //workload groups are modified
      // route of the workload Id
      // eslint-disable-next-line guard-for-in
      for (const workloadId in data[action1]) {
        // route of the workload type
        // eslint-disable-next-line guard-for-in
        for (const typeId in data[action1][workloadId].modified) {
          // define type of workload
          switch (typeId) {
            case 'members':
              typeWorkload = 'static';
              break;
            case 'dynamic_members':
              typeWorkload = 'dynamic';
              break;
            case 'group_members':
              typeWorkload = 'complex';
              break;
            default:
              if (typeId !== 'description' && typeId !== 'type') {
                console.error(`${typeId} is not a type of workload`);
              }
              break;
          }
        }
        // define member to display
        if (
          data[action1][workloadId].modified.description !== undefined ||
          data[action1][workloadId].modified.description !== '' ||
          data[action1][workloadId].modified.type !== undefined ||
          data[action1][workloadId].modified.type !== ''
        ) {
          memberWorkload = JSON.stringify(
            data[action1][workloadId].modified,
            undefined,
            '\t'
          );
        } else if (data[action1][workloadId].modified.members !== undefined) {
          memberWorkload = JSON.stringify(
            data[action1][workloadId].modified.members,
            undefined,
            '\t'
          );
        } else if (
          data[action1][workloadId].modified.dynamic_members !== undefined
        ) {
          memberWorkload = JSON.stringify(
            data[action1][workloadId].modified.dynamic_members,
            undefined,
            '\t'
          );
        } else if (
          data[action1][workloadId].modified.group_members !== undefined
        ) {
          memberWorkload = JSON.stringify(
            data[action1][workloadId].modified.group_members,
            undefined,
            '\t'
          );
        }
        // COLUMN 1 : action1
        // COLUMN 2 : workloadId
        // COLUMN 3 : typeWorkload
        // COLUMN 4 : memberWorkload
        result.push(
          this.buildWorkloadGroupObject(
            action1,
            workloadId,
            typeWorkload,
            memberWorkload.slice(1, memberWorkload.length - 2)
          )
        );
        typeWorkload = '';
        memberWorkload = '';
      }
    } else {
      console.error(
        `error: ${data[action1] instanceof Array} is not a boolean`
      );
    }
  }
  return result;
}
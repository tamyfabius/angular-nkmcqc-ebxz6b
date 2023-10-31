import { inject, Injectable } from '@angular/core';
import { CompilationInspectionFacade } from '../application/compilation-inspection.facade';
import {
  PolicyComparisonFormModel,
  PolicyComparisonModel,
} from '../entities/policy-comporison-form.model';
import { buildRxformGroup } from '@skynes/shared/utils/util-common';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { CompilationStoredPolicyFacade } from './compilation-stored-policy.facade';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { StoredPolicyModel } from '../entities/stored-policy.model';

@Injectable()
export class PolicyComparisonFacade {
  readonly #compilationInspectionFacade = inject(CompilationInspectionFacade);
  readonly #compilationStoredPolicyFacade = inject(
    CompilationStoredPolicyFacade
  );
  firewalls$ = this.#compilationInspectionFacade.getAllFirewalls();

  /**
   * Comparison data - Array
   */
  dataSource$ = new BehaviorSubject<
    Array<{
      action: string;
      sectionId: string;
      ruleTag: string;
      sources: string;
      destinations: string;
      channels: any;
      scope: string;
      other: string;
    }>
  >([]);

  buildPolicyComparisonForm(
    comparisonFrom: PolicyComparisonModel = new PolicyComparisonModel(),
    comparisonTo: PolicyComparisonModel = new PolicyComparisonModel()
  ): RxFormGroup {
    const initData = new PolicyComparisonFormModel();
    initData.comparisonFrom = comparisonFrom;
    initData.comparisonTo = comparisonTo;
    return buildRxformGroup(PolicyComparisonFormModel, initData);
  }

  /**
   * @function getStoredPolicies
   */
  getStoredPolicies(firewallId: string): Observable<StoredPolicyModel[]> {
    return this.#compilationStoredPolicyFacade
      .getStoredPolicyList(firewallId)
      .pipe(map((res) => res.values));
  }

  /**
   * @function
   * @param targetId
   * @param objectArray
   */
  findClosestLowerObject(targetId: number, objectArray: any[]): any | null {
    let closestLowerObject: any | null = null;
    let minDistance = Infinity;

    for (const obj of objectArray) {
      const distance = targetId - obj.id;
      if (distance > 0 && distance < minDistance) {
        minDistance = distance;
        closestLowerObject = obj;
      }
    }
    return closestLowerObject;
  }

  /**
   * @function policyComparisonForm
   * @param policyComparisonForm
   */
  policyComparison(
    policyComparisonForm: PolicyComparisonFormModel
  ): Observable<any> {
    return this.#compilationStoredPolicyFacade.compilationStoredPlociesComparision(
      policyComparisonForm.comparisonFrom.storedPolicyId,
      policyComparisonForm.comparisonTo.storedPolicyId
    );
  }

  processGroups(groupType: string, typeOfKeysGroup: any, data: any): any {
    let res: any = {
      channelGroup: [],
      securityRuleGroup: [],
      workloadGroup: [],
    };
    Object.keys(typeOfKeysGroup).forEach((k, i) => {
      if (typeOfKeysGroup[k] === 'string[]') {
        if (groupType === 'ChannelGroup') {
          const objTempChannelGroup = {
            action: k,
            channelId: data['ChannelGroup'][k],
            typeId: 'channelGroup',
            parameters: [],
          };
          res = {
            ...res,
            channelGroup: [...res.channelGroup, objTempChannelGroup],
          };
        }
        if (groupType === 'SecurityRuleGroup') {
          const objTempSecurityRuleGroup = {
            action: k,
            sectionId: '',
            ruleTag: '',
            sources: '',
            destinations: '',
            channels: '',
            scope: '',
            other: '',
          };
          res = {
            ...res,
            securityRuleGroup: [
              ...res.securityRuleGroup,
              objTempSecurityRuleGroup,
            ],
          };
        }
        if (groupType === 'WorkloadGroup') {
          const objTempWorkloadGroup = {
            action: k,
            workloadId: data['WorkloadGroup'][k],
            typeId: 'Static',
            member: [],
          };
          res = {
            ...res,
            workloadGroup: [...res.workloadGroup, objTempWorkloadGroup],
          };
        }
      } else if (typeOfKeysGroup[k] === 'object') {
        if (groupType === 'ChannelGroup') {
          const channelGroupObj = data[groupType][k];
          console.log('channelGroupObj:', channelGroupObj);

          Object.keys(channelGroupObj).forEach((subKey) => {
            const lastKeysAndValues = this.getLastKeysAndValues(
              channelGroupObj[subKey]
            );
            Object.keys(lastKeysAndValues).forEach((lk) => {
              const objTemp = {
                action: lk,
                channelId: subKey,
                typeId: 'channelGroup',
                parameters: lastKeysAndValues[lk],
              };
              res = {
                ...res,
                channelGroup: [...res.channelGroup, objTemp],
              };
            });
          });
        }
        if (groupType === 'SecurityRuleGroup') {
          const securityRuleGroupObj = data[groupType][k];
          Object.keys(securityRuleGroupObj).forEach((subKey) => {});
        }
        if (groupType === 'WorkloadGroup') {
          const workloadGroupObj = data[groupType][k];
          Object.keys(workloadGroupObj).forEach((subKey) => {
            const memberObj = this.findObjectInNestedObject(
              workloadGroupObj[subKey],
              'members'
            );
            const groupMembersObj = this.findObjectInNestedObject(
              workloadGroupObj[subKey],
              'group_members'
            );
            const dynamicMembersObj = this.findObjectInNestedObject(
              workloadGroupObj[subKey],
              'dynamic_members'
            );
            const typeObj = this.findObjectInNestedObject(
              workloadGroupObj[subKey],
              'type'
            );
            if (memberObj) {
              const objTempWorkloadGroup = {
                action: k,
                workloadId: subKey,
                typeId: memberObj ? 'static' : '',
                member: memberObj ? memberObj : [],
              };
              res = {
                ...res,
                workloadGroup: [...res.workloadGroup, objTempWorkloadGroup],
              };
            }
            if (groupMembersObj) {
              const objTempWorkloadGroup = {
                action: k,
                workloadId: subKey,
                typeId: groupMembersObj ? 'complex' : '',
                member: groupMembersObj ? groupMembersObj : [],
              };
              res = {
                ...res,
                workloadGroup: [...res.workloadGroup, objTempWorkloadGroup],
              };
            }
            if (dynamicMembersObj) {
              const objTempWorkloadGroup = {
                action: k,
                workloadId: subKey,
                typeId: dynamicMembersObj ? 'dynamic' : '',
                member: dynamicMembersObj ? dynamicMembersObj : [],
              };
              res = {
                ...res,
                workloadGroup: [...res.workloadGroup, objTempWorkloadGroup],
              };
            }
            if (typeObj) {
              const objTempWorkloadGroup = {
                action: k,
                workloadId: subKey,
                typeId: '',
                member: typeObj ? typeObj : [],
              };
              res = {
                ...res,
                workloadGroup: [...res.workloadGroup, objTempWorkloadGroup],
              };
            }
          });
        }
      }
    });
    return res;
  }

  getLastKeysAndValues(obj: any): { [key: string]: any } {
    const results: { [key: string]: any } = {};

    function recursiveFindLastkeyAndValue(innerObj: any): void {
      if (typeof innerObj === 'object' && !Array.isArray(innerObj)) {
        const keys = Object.keys(innerObj);
        if (keys.length) {
          const lastKey = keys[keys.length - 1];
          if (
            typeof innerObj[lastKey] === 'object' &&
            !Array.isArray(innerObj[lastKey])
          ) {
            recursiveFindLastkeyAndValue(innerObj[lastKey]);
          } else {
            results[lastKey] = innerObj[lastKey];
          }
        }
      }
    }

    recursiveFindLastkeyAndValue(obj);
    return results;
  }

  findObjectInNestedObject(obj: any, keyName: string): any {
    if (!obj || typeof obj !== 'object') {
      return null;
    }

    if (Object.getOwnPropertyDescriptor(obj, keyName)) {
      return obj;
    }

    for (const key of Object.keys(obj)) {
      const result = this.findObjectInNestedObject(obj[key], keyName);
      if (result !== null) {
        return result;
      }
    }

    return null;
  }

  /**
   * Add a SecurityRuleGroup row in the data table
   * @memberof TableComparisonComponent
   */
  public addSecurityRuleGroupElement(
    action: string,
    sectionId: string,
    ruleTag: string,
    sources: string,
    destinations: string,
    channels: any,
    scope: string,
    other: string
  ): void {
    const securityRuleGroup = {
      action,
      sectionId,
      ruleTag,
      sources,
      destinations,
      channels,
      scope,
      other,
    };
    const arrTemp = [...this.dataSource$.value, securityRuleGroup];
    this.dataSource$.next(arrTemp);
  }

  /**
   * Build data table for SecurityRuleGroup
   * @memberof TableComparisonComponent
   */
  public buildSecurityRuleGroupData(data: any): void {
    /*
    SecurityRuleGroup data format:

      "sectionId": {
        "modified": {
          "description": ""
          "members": {
            "modified": {
              "rule tag": {
                "modified": {
                  "logged": boolean
                  "disabled": boolean
                  description: ""
                  "parameter": { // source, destination, channels, scope, scopes
                    "action":  [ // added, removed, reordered
                      "parameter details"


      "sectionId": {
        "modified": {
          "description": ""
          "members": {
            "action": [ // added, removed, reordered
              "rule tag"

    Formatting in a table: 8 columns
    ---------------------------------------------------------------------------------------------------------------------
    | action | sectionId | rule tag | sources | destinations | channels | scope | other (description, logged, disabled) |
    ---------------------------------------------------------------------------------------------------------------------
    */
    this.dataSource$.next([]);
    let securityRuleAdded = '';
    let securityRuleRemoved = '';
    let securityRuleReordered = '';
    let otherList = '';
    let sourcesString = '';
    let destinationsString = '';
    let channelsString = '';
    let scopeString = '';
    let res: Array<{
      action: string;
      sectionId: string;
      ruleTag: string;
      sources: string;
      destinations: string;
      channels: any;
      scope: string;
      other: string;
    }> = [];

    // route of the 1st action
    for (const action1 in data) {
      switch (data[action1] instanceof Array) {
        // securityrule sections groups are added or removed or reordered
        case true:
          //all securityrules sections with the same action are in the same row
          for (const securityRule in data[action1]) {
            switch (action1) {
              case 'added':
                securityRuleAdded += '"' + data[action1][securityRule] + '"\n';
                break;
              case 'removed':
                securityRuleRemoved +=
                  '"' + data[action1][securityRule] + '"\n';
                break;
              case 'reordered':
                securityRuleReordered +=
                  '"' + data[action1][securityRule] + '"\n';
                break;
              default:
                console.error(`${action1}: 1st action error`);
                break;
            }
          }
          // COLUMN 1 : action1
          // COLUMN 2 : securityRuleAdded OR securityRuleRemoved OR securityRuleReordered
          if (securityRuleAdded !== '') {
            const objTemp = {
              action1,
              securityRuleAdded,
              '',
              '',
              '',
              '',
              '',
              ''
            };
            res.push(objTemp);
            /*this.addSecurityRuleGroupElement(
              action1,
              securityRuleAdded,
              '',
              '',
              '',
              '',
              '',
              ''
            );
            securityRuleAdded = '';*/
          }
          if (securityRuleRemoved !== '') {
            this.addSecurityRuleGroupElement(
              action1,
              securityRuleRemoved,
              '',
              '',
              '',
              '',
              '',
              ''
            );
            securityRuleRemoved = '';
          }
          if (securityRuleReordered !== '') {
            this.addSecurityRuleGroupElement(
              action1,
              securityRuleReordered,
              '',
              '',
              '',
              '',
              '',
              ''
            );
            securityRuleReordered = '';
          }
          break;
        // securityrule sections groups are modified
        case false:
          // route of the section id
          for (const sectionId in data.modified) {
            if (
              data.modified[sectionId].modified.description !== undefined &&
              data.modified[sectionId].modified.description !== ''
            ) {
              otherList += `section description: ${data.modified[sectionId].modified.description}\n`;
            }
            // route of the 2nd action
            for (const action2 in data.modified[sectionId].modified.members) {
              switch (
                data.modified[sectionId].modified.members[action2] instanceof
                Array
              ) {
                // rule tag are added or removed or reordered
                case true:
                  //all ruletags with the same action are in the same row
                  for (const ruletag in data.modified[sectionId].modified.members[action2]) {
                    switch (action2) {
                      case 'added':
                        securityRuleAdded +=
                          '"' +
                          data.modified[sectionId].modified.members[action2][
                            ruletag
                          ] +
                          '"\n';
                        break;
                      case 'removed':
                        securityRuleRemoved +=
                          '"' +
                          data.modified[sectionId].modified.members[action2][
                            ruletag
                          ] +
                          '"\n';
                        break;
                      case 'reordered':
                        securityRuleReordered +=
                          '"' +
                          data.modified[sectionId].modified.members[action2][
                            ruletag
                          ] +
                          '"\n';
                        break;
                      default:
                        console.error(`${action2}: 2nd action error`);
                        break;
                    }
                  }
                  // COLUMN 1 : action2
                  // COLUMN 2 : sectionId
                  // COLUMN 3 : securityRuleAdded or securityRuleRemoved or securityRuleReordered
                  if (securityRuleAdded !== '') {
                    res = {
                      action2,
                      sectionId,
                      securityRuleAdded,
                      '',
                      '',
                      '',
                      '',
                      otherList
                    };
                    this.addSecurityRuleGroupElement(
                      action2,
                      sectionId,
                      securityRuleAdded,
                      '',
                      '',
                      '',
                      '',
                      otherList
                    );
                    securityRuleAdded = '';
                  }
                  if (securityRuleRemoved !== '') {
                    this.addSecurityRuleGroupElement(
                      action2,
                      sectionId,
                      securityRuleRemoved,
                      '',
                      '',
                      '',
                      '',
                      otherList
                    );
                    securityRuleRemoved = '';
                  }
                  if (securityRuleReordered !== '') {
                    this.addSecurityRuleGroupElement(
                      action2,
                      sectionId,
                      securityRuleReordered,
                      '',
                      '',
                      '',
                      '',
                      otherList
                    );
                    securityRuleReordered = '';
                  }
                  otherList = '';
                  break;

                // rule tag are modified
                case false:
                  // route of the rule tags
                  for (const ruletag in data.modified[sectionId].modified
                    .members.modified) {
                    // route of the parameters
                    for (const parameter in data.modified[sectionId].modified
                      .members.modified[ruletag].modified) {
                      switch (parameter) {
                        case 'sources':
                          // route of the 3rd action
                          for (const action3 in data.modified[sectionId]
                            .modified.members.modified[ruletag].modified[
                            parameter
                          ]) {
                            sourcesString += `${action3}:\n`;
                            for (const parameterDetails in data.modified[
                              sectionId
                            ].modified.members.modified[ruletag].modified[
                              parameter
                            ][action3]) {
                              sourcesString += `${data.modified[sectionId].modified.members.modified[ruletag].modified[parameter][action3][parameterDetails]}\n`;
                            }
                          }
                          break;
                        case 'destinations':
                          // route of the 3rd action
                          for (const action3 in data.modified[sectionId]
                            .modified.members.modified[ruletag].modified[
                            parameter
                          ]) {
                            destinationsString += `${action3}:\n`;
                            for (const parameterDetails in data.modified[
                              sectionId
                            ].modified.members.modified[ruletag].modified[
                              parameter
                            ][action3]) {
                              destinationsString += `${data.modified[sectionId].modified.members.modified[ruletag].modified[parameter][action3][parameterDetails]}\n`;
                            }
                          }
                          break;
                        case 'channels':
                          // route of the 3rd action
                          for (const action3 in data.modified[sectionId]
                            .modified.members.modified[ruletag].modified[
                            parameter
                          ]) {
                            channelsString += `${action3}:\n`;
                            for (const parameterDetails in data.modified[
                              sectionId
                            ].modified.members.modified[ruletag].modified[
                              parameter
                            ][action3]) {
                              if (
                                typeof data.modified[sectionId].modified.members
                                  .modified[ruletag].modified[parameter][
                                  action3
                                ][parameterDetails] === 'string'
                              ) {
                                channelsString += `${data.modified[sectionId].modified.members.modified[ruletag].modified[parameter][action3][parameterDetails]}\n`;
                              } else if (
                                typeof data.modified[sectionId].modified.members
                                  .modified[ruletag].modified[parameter][
                                  action3
                                ][parameterDetails] === 'object'
                              ) {
                                channelsString += `${JSON.stringify(
                                  data.modified[sectionId].modified.members
                                    .modified[ruletag].modified[parameter][
                                    action3
                                  ][parameterDetails]
                                )}\n`;
                              } else {
                                console.error(
                                  `typing error: ${typeof data.modified[
                                    sectionId
                                  ].modified.members.modified[ruletag].modified[
                                    parameter
                                  ][action3][
                                    parameterDetails
                                  ]} is not a valid type`
                                );
                              }
                            }
                          }
                          break;
                        case 'scope':
                        case 'scopes':
                          // route of the 3rd action
                          for (const action3 in data.modified[sectionId]
                            .modified.members.modified[ruletag].modified[
                            parameter
                          ]) {
                            scopeString += `${action3}:\n`;
                            scopeString;
                            for (const parameterDetails in data.modified[
                              sectionId
                            ].modified.members.modified[ruletag].modified[
                              parameter
                            ][action3]) {
                              scopeString += `${data.modified[sectionId].modified.members.modified[ruletag].modified[parameter][action3][parameterDetails]}\n`;
                            }
                          }
                          break;
                        case 'description':
                        case 'disabled':
                        case 'logged':
                          if (
                            data.modified[sectionId].modified.members.modified[
                              ruletag
                            ].modified.description !== '' &&
                            data.modified[sectionId].modified.members.modified[
                              ruletag
                            ].modified.description !== undefined
                          ) {
                            otherList += `rule description: ${data.modified[sectionId].modified.members.modified[ruletag].modified.description}\n`;
                          }
                          if (
                            data.modified[sectionId].modified.members.modified[
                              ruletag
                            ].modified.disabled !== '' &&
                            data.modified[sectionId].modified.members.modified[
                              ruletag
                            ].modified.disabled !== undefined
                          ) {
                            otherList += `disabled: ${data.modified[sectionId].modified.members.modified[ruletag].modified.disabled}\n`;
                          }
                          if (
                            data.modified[sectionId].modified.members.modified[
                              ruletag
                            ].modified.logged !== '' &&
                            data.modified[sectionId].modified.members.modified[
                              ruletag
                            ].modified.logged !== undefined
                          ) {
                            otherList += `logged: ${data.modified[sectionId].modified.members.modified[ruletag].modified.logged}\n`;
                          }
                          break;
                        default:
                          console.error(
                            `error: ${parameter} is not a valid parameter`
                          );
                          break;
                      }
                    }
                    // COLUMN 1 : action2
                    // COLUMN 2 : sectionId
                    // COLUMN 3 : ruletag
                    // COLUMN 4 : sourcesString
                    // COLUMN 5 : destinationsString
                    // COLUMN 6 : channelsString
                    // COLUMN 7 : scopeString
                    // COLUMN 8 : otherList
                    this.addSecurityRuleGroupElement(
                      action2,
                      sectionId,
                      ruletag,
                      sourcesString,
                      destinationsString,
                      channelsString,
                      scopeString,
                      otherList
                    );
                    sourcesString = '';
                    destinationsString = '';
                    channelsString = '';
                    scopeString = '';
                    otherList = '';
                  }
                  break;
                default:
                  console.error(
                    `error: ${
                      data.modified[sectionId].modified.members
                        .action2 instanceof Array
                    } is not a boolean`
                  );
                  break;
              }
            }
          }
          break;
        default:
          console.error(
            `error: ${data[action1] instanceof Array} is not a boolean`
          );
          break;
      }
    }
  }
}

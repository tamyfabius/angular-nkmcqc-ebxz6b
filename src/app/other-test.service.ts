import { ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import {
  PolicyComparisonFacade,
  PolicyComparisonFormModel,
  PolicyComparisonModel,
  StoredPolicyModel,
} from '@skynes/firewalls/domain';
import { concatMap, map, Observable } from 'rxjs';
import { RxFormGroup } from '@rxweb/reactive-form-validators';

export const policyComparisonResolver: ResolveFn<any> = (route, state) => {
  const routerState = inject(Router)?.getCurrentNavigation()?.extras?.state;
  const policyComparisonFacade = inject(PolicyComparisonFacade);
  const storedPolicyId = routerState ? (routerState['id'] as string) : null;
  const firewallId = routerState ? (routerState['firewallId'] as string) : null;
  const firewalls$ = policyComparisonFacade.firewalls$;
  const policyComparisonFrom: PolicyComparisonModel =
    new PolicyComparisonModel();
  const policyComparisonTo: PolicyComparisonModel = new PolicyComparisonModel();
  const policyComparisonFormObj: PolicyComparisonFormModel =
    new PolicyComparisonFormModel();

  let data$!: Observable<any>;
  if (storedPolicyId) {
    data$ = policyComparisonFacade.getStoredPolicies(firewallId as string).pipe(
      concatMap((storedPolicies) =>
        firewalls$.pipe(
          map((firewalls) => {
            let policyComparisonForm!: RxFormGroup;
            const storedPolicy = policyComparisonFacade.findClosestLowerObject(
              Number(storedPolicyId),
              storedPolicies
            ) as StoredPolicyModel;
            if (storedPolicy.firewall_id && storedPolicy.id) {
              policyComparisonFormObj.comparisonFrom.firewallId =
                firewallId as string;
              policyComparisonFormObj.comparisonFrom.storedPolicyId =
                storedPolicyId as string;
              policyComparisonFormObj.comparisonTo.firewallId =
                storedPolicy.firewall_id as string;
              policyComparisonFormObj.comparisonTo.storedPolicyId =
                storedPolicy.id as unknown as string;

              policyComparisonFrom.firewallId = firewallId as string;
              policyComparisonFrom.storedPolicyId = storedPolicyId as string;
              policyComparisonTo.firewallId =
                storedPolicy.firewall_id as string;
              policyComparisonTo.storedPolicyId =
                storedPolicy.id as unknown as string;
            }
            if (
              policyComparisonFormObj.comparisonFrom.storedPolicyId &&
              policyComparisonFormObj.comparisonTo.storedPolicyId
            ) {
              policyComparisonForm =
                policyComparisonFacade.buildPolicyComparisonForm(
                  policyComparisonFormObj
                );
            }
            return {
              firewalls,
              storedPolicies,
              policyComparisonForm,
            };
          })
        )
      )
    );
  }
  return storedPolicyId && firewallId ? data$ : null;
};

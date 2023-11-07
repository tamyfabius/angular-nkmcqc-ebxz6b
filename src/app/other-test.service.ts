export class PolicyComparisonComponent implements OnInit {
  readonly #policyComparisonFacade = inject(PolicyComparisonFacade);
  firewalls: FirewallModel[] = [];
  storedPolicies: StoredPolicyModel[] = [];
  policyComparisonForm!: RxFormGroup;
  cols: IColumn[] = this.#policyComparisonFacade.initColumns();
  chanelGroupList$ = new BehaviorSubject<any[]>([]);
  securityRuleGroupList$ = new BehaviorSubject<any[]>([]);
  workloadGroupList$ = new BehaviorSubject<any[]>([]);
  loadingPolicsyComparisonResult$ = new BehaviorSubject<boolean>(false);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data['data'];
    if (data) {
      this.firewalls = data.firewalls;
      this.storedPolicies = data.storedPolicies;
      this.policyComparisonForm = data.policyComparisonForm;
    }
  }

  /**
   * @function onPolicyComparison
   */
  onPolicyComparison(): void {
    this.loadingPolicsyComparisonResult$.next(true);
    this.#policyComparisonFacade
      .policyComparison(
        this.policyComparisonForm.modelInstance as PolicyComparisonFormModel
      )
      .pipe(finalize(() => this.loadingPolicsyComparisonResult$.next(false)))
      .subscribe((res) => {
        this.chanelGroupList$.next(
          this.#policyComparisonFacade.buildChannelGroupData(
            res['ChannelGroup']
          )
        );
        this.securityRuleGroupList$.next(
          this.#policyComparisonFacade.buildSecurityRuleGroupData(
            res['SecurityRuleGroup']
          )
        );
        this.workloadGroupList$.next(
          this.#policyComparisonFacade.buildWorkloadGroupData(
            res['WorkloadGroup']
          )
        );
      });
  }

  /**
   * @function onTabViewChange
   * @param event
   */
  onTabViewChange(event: TabViewChangeEvent): void {
    const { index } = event;
    this.cols = this.#policyComparisonFacade.buildColumns(index);
  }
}
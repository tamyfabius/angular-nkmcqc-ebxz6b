// Angular Core
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PermissionService, UserService } from '@skynes/shared/utils/util-auth';

// Libs
import {
  setGlobalConfigRxweb,
  setItemInLocalStorage,
} from '@skynes/shared/utils/util-common';
import { LayoutService } from '@sakai-layout-v2';
import { MenuItem } from 'primeng/api';
import { forkJoin, Subscription } from 'rxjs';
import { AuthDofService } from '../services/auth-dof.service';
import {
  PermissionManagerService,
  PermissionTypeEnum,
} from '@skynes/shared/utils/util-permission-manage';
import { TranslateService } from '@ngx-translate/core';
import { DofTicketActionRequiredFacade } from '@skynes/dof/domain';
import { DofNotificationContentComponent } from '@skynes/dof/firewall-rules-request';

@Component({
  selector: 'dof-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'portail-dof-v0';

  private _sub = new Subscription();

  constructor(
    private _authService: AuthDofService,
    private _dofTicketActionRequiredFacade: DofTicketActionRequiredFacade,
    private _userService: UserService,
    private _layoutService: LayoutService,
    private _permissionService: PermissionService,
    private _permissionManagerService: PermissionManagerService,
    private _translate: TranslateService
  ) {
    const browserLang = _translate.getBrowserLang();
    _translate.use(browserLang?.match('/en|fr/') ? browserLang : 'fr');
  }

  /**
   * @function _configRxWeb
   * @private
   * @description set global config Rxweb
   */
  private static _configRxWeb(): void {
    setGlobalConfigRxweb();
  }

  ngOnInit(): void {
    AppComponent._configRxWeb();
    this._initLoadData();
    this._configLayout();
  }

  ngOnDestroy(): void {
    this._sub.unsubscribe();
  }

  /**
   * @function _configLayout
   * @private
   * @description set config layout
   */
  private _configLayout(): void {
    const env = this._layoutService.config.env;
    let logoDofin = '';
    if (env === 'production') {
      logoDofin = 'assets/images/logo-dofin-prod.svg';
    } else if (env === 'bench') {
      logoDofin = 'assets/images/logo-dofin-bench.svg';
    } else {
      logoDofin = 'assets/images/logo-dofin-dev.svg';
    }
    const logoBPCE = 'assets/images/logo-bpce-it.png';
    const logos = {
      logoDofin,
      logoBPCE,
    };
    this._layoutService.initConfigLayout(this._getMenuItems(), logos);
  }

  /**
   * @function _buildMenu
   * @private
   * @return {MenuItem[]}
   * @description build menu items
   */
  private _getMenuItems(): MenuItem[] {
    return this._authService.isAuthenticated() &&
      this._permissionService.hasPermission()
      ? [
          {
            label: '',
            items: [
              {
                label: 'Dashboard',
                icon: 'dofin-icon dofin-icon-admin-view',
                iconClass: 'layout-menuitem-icon',
                routerLink: ['/dof/dashboard'],
                visible:
                  this._permissionService.hasPermission() &&
                  this._permissionManagerService.isGranted(
                    PermissionTypeEnum.READ,
                    'permission'
                  ),
              },
              {
                label: 'KPI',
                icon: 'pi pi-percentage',
                iconClass: 'layout-menuitem-icon',
                routerLink: ['/dof/kpis'],
                visible:
                  this._permissionService.hasPermission() &&
                  this._permissionManagerService.isGranted(
                    PermissionTypeEnum.READ,
                    'kpis'
                  ),
              },
            ],
          },
          {
            label: 'Firewall Request',
            items: [
              {
                label: 'Create New Request',
                icon: 'dofin-icon dofin-icon-file-add',
                routerLink: ['/dof/firewall-rules-request'],
                iconClass: 'layout-menuitem-icon',
                visible:
                  this._permissionService.hasPermission() &&
                  this._permissionManagerService.isGranted(
                    PermissionTypeEnum.CREATE,
                    'dofticket'
                  ),
              },
              {
                label: 'My Team Requests',
                icon: 'dofin-icon dofin-icon-users',
                routerLink: ['/dof/firewall-rules-request/request-list'],
                iconClass: 'layout-menuitem-icon',
                visible:
                  this._permissionService.hasPermission() &&
                  this._permissionManagerService.isGranted(
                    PermissionTypeEnum.READ,
                    'dofticket'
                  ),
              },
              {
                label: 'Admin view',
                icon: 'dofin-icon dofin-icon-bookmark-star',
                routerLink: ['/dof/firewall-rules-request/admin-view'],
                iconClass: 'layout-menuitem-icon',
                visible:
                  this._permissionService.hasPermission() &&
                  this._permissionManagerService.isGranted(
                    PermissionTypeEnum.READ,
                    'dofticket'
                  ),
              },
            ],
            visible:
              this._permissionService.hasPermission() &&
              this._permissionManagerService.isGranted(
                PermissionTypeEnum.READ,
                'dofticket'
              ),
          },
        ]
      : [];
  }

  private _initLoadData(): void {
    const fk = forkJoin([
      this._userService.getSkynesUsersMe(),
      this._dofTicketActionRequiredFacade.getDofTicketActionRequired(),
    ]);
    this._sub.add(
      fk.subscribe(([skynesUserData, actionRequiredData]) => {
        setItemInLocalStorage('skynesUsersMe', JSON.stringify(skynesUserData));
        this._permissionService.setPermission(skynesUserData.user_permissions);
        const notificationInput = {
          actionRequiredList: actionRequiredData,
        };
        this._layoutService.setNotificationConfig(
          DofNotificationContentComponent,
          actionRequiredData,
          notificationInput
        );
      })
    );
  }
}

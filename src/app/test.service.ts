import { Injectable } from '@angular/core';
import { http, RxHttp, xhrFilter, XhrC ontext} from '@rxweb/http';
import { HeaderFilter } from './header-filter';

@http({
  hostKey: 'testAPi',
  path: 'api-sports',
})
@Injectable({
  providedIn: 'root',
})
export class TestService extends RxHttp {
  markAsDirty: boolean;
  constructor() {
    super();
  }

  getByCustomUrl() {
    // const url= `${this.path}?type=customUrl`
    console.log('path -->', this.badRequest);
    return this.get({ queryParams: { type: 'customUrl' } });
  }
}

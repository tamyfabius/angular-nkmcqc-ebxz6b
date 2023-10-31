import { Injectable } from '@angular/core';
import { http, RxHttp, xhrFilter, HttpClientConfig } from '@rxweb/http';
import { HeaderFilter } from './header-filter';

@xhrFilter([{ model: HeaderFilter }])
@http({
  path: 'api/Products',
})
@Injectable({
  providedIn: 'root',
})
export class ProductService extends RxHttp {
  markAsDirty: boolean;
  constructor() {
    super();
  }
}

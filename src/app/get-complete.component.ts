import { Component } from '@angular/core';
import { ProductService } from './product.service';
import { TestService } from './test.service';

@Component({
  selector: 'app-get-complete',
  templateUrl: './get-complete.component.html',
})
export class GetCompleteComponent {
  constructor(
    private productService: ProductService,
    private testService: TestService
  ) {}
  result: any;
  result2: any;
  GetProducts() {
    this.result = this.productService.get({ path: 'api/Products' });
    this.GetTestResult();
  }

  GetTestResult() {
    this.result2 = this.testService.getByCustomUrl();
  }
}

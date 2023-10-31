import {
  AbstractRequestFilter,
  HttpResponse,
  ResponseFilter,
  XhrContext
} from "@rxweb/http";

export class HeaderFilter extends AbstractRequestFilter
  implements ResponseFilter {
  onRequest = (context: XhrContext) => {
    context.request.headers["Content-Type"] = "application/json";
    this.onRequestExecuting(context);
  };
  onResponse = (response: HttpResponse) => {
    return response;
  };
}

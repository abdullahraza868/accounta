export abstract class AbpBaseClient {
  protected async transformResult(
    url: string,
    response: Response,
    processor: (response: Response) => Promise<any>
  ): Promise<any> {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      const json = text ? JSON.parse(text) : null;

      // ✅ ABP-specific response unwrapping
      if (json && json.__abp === true) {
        if (!json.success) {
          throw new Error(json.error?.message || "ABP API error");
        }
        return json.result;
      }

      // Otherwise return the raw JSON
      return json;
    }

    // Default NSwag processing if not JSON
    return processor(response);
  }

  protected transformOptions(options: RequestInit): Promise<RequestInit> {
    options.credentials = "include";
    options.headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    };
    return Promise.resolve(options);
  }
}

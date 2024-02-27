import { createApiClient, MiddlewareConfig } from '@erpgap/odoo-sdk-api-client/server';

class ApolloClientConnection {
  private static _instance: any;

  private constructor() {}

  static getInstance(config: MiddlewareConfig): any {
    if (this._instance) {
      return this._instance;
    }

    this._instance = createApiClient(config);
    return this._instance;
  }
}

export default ApolloClientConnection;

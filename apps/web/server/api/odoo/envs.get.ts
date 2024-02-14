import { ApolloError } from '@apollo/client';
import { Endpoints } from '@erpgap/odoo-sdk-api-client';

export default defineEventHandler(async (event) => {
  return process.env;
});


import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    process.on('unhandledRejection', (reason: any) => {
      if (reason && (reason.name === 'AggregateError' || Array.isArray(reason?.errors))) {
        strapi.log.error('❌ AggregateError detected during operation:');
        if (Array.isArray(reason.errors)) {
          reason.errors.forEach((err: any, idx: number) => {
            strapi.log.error(`  --> Cause ${idx + 1}: ${err?.message || err}`);
          });
        }
      }
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};

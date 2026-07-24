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

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const publicRole = await strapi
        .db.query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (!publicRole) return;

      const actionsToEnable = [
        'api::blog-post.blog-post.find',
        'api::blog-post.blog-post.findOne',
        'api::category.category.find',
        'api::category.category.findOne',
        'api::contact-info.contact-info.find',
        'api::contact-info.contact-info.findOne',
        'api::contact-submission.contact-submission.create',
        'api::councilor.councilor.find',
        'api::councilor.councilor.findOne',
        'api::donation.donation.create',
        'api::event.event.find',
        'api::event.event.findOne',
        'api::event-registration.event-registration.create',
        'api::time-line-entry.time-line-entry.find',
        'api::time-line-entry.time-line-entry.findOne',
        'api::vendor-registration.vendor-registration.create',
        'api::volunteer-registration.volunteer-registration.create',
      ];

      const existingPermissions = await strapi
        .db.query('plugin::users-permissions.permission')
        .findMany({
          where: {
            role: publicRole.id,
            action: { $in: actionsToEnable },
          },
        });

      const existingActions = new Set(existingPermissions.map((p: any) => p.action));
      const newPermissions = actionsToEnable
        .filter((action) => !existingActions.has(action))
        .map((action) => ({ action, role: publicRole.id }));

      if (newPermissions.length > 0) {
        await strapi
          .db.query('plugin::users-permissions.permission')
          .createMany({ data: newPermissions });
        strapi.log.info(`✅ Auto-granted ${newPermissions.length} Public API permissions.`);
      }
    } catch (err: any) {
      strapi.log.error('Failed to auto-grant public permissions:', err.message);
    }
  },
};


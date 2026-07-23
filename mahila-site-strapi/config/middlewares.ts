import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: (ctx: any) => {
        const reqOrigin = ctx.request.header.origin;
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          'https://mahilaactionvsk-ops.github.io',
          process.env.FRONTEND_URL,
          process.env.CORS_ORIGIN,
        ].filter(Boolean) as string[];

        if (!reqOrigin || allowedOrigins.includes(reqOrigin) || allowedOrigins.includes('*')) {
          return reqOrigin || '*';
        }
        return reqOrigin;
      },
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;


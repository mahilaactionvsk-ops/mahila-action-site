import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'global::private-network-access',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'https://mahilaactionvsk-ops.github.io',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
      ],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
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
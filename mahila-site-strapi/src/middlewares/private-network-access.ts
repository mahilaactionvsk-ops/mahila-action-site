export default (_config: unknown, { strapi }: { strapi: unknown }) => {
    return async (ctx: any, next: () => Promise<void>) => {
        if (ctx.request.get('Access-Control-Request-Private-Network') === 'true') {
            ctx.set('Access-Control-Allow-Private-Network', 'true');
        }
        await next();
    };
};
import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from './logger.js';

const setupProxy = (app, routes) => {
  routes.forEach(({ path, target, rewrite }) => {
    // Log proxying activity
    logger.info(`Proxying ${path} -> ${target}`);
    
    app.use(path, createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: rewrite || {},
      onError: (err, req, res) => {
        // Log error
        logger.error(`Proxy error on ${path}: ${err.message}`);
        res.status(504).json({ error: 'Gateway Timeout' });
      }
    }));
  });
};

export default setupProxy;

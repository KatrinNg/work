//for dev apis,
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(
        '/vis',
        createProxyMiddleware({
             target: 'http://localhost:8081',
            // target: 'http://837bd06ee5c8.ngrok.io',
//            target: "https://sit.ha-vis.com/",
            changeOrigin: true,
        })
    );
};

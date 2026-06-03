import path from 'path'

module.exports = {
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  typedRoutes: true,  
  output: "standalone",
  experimental: {
    proxyClientMaxBodySize: '20mb',
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },  
}

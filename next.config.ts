import path from 'path'

module.exports = {
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  typedRoutes: true,  
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },  
}

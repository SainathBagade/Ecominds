const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@components': path.resolve(__dirname, 'src/Components'),
      '@pages': path.resolve(__dirname, 'src/Pages'),
      '@context': path.resolve(__dirname, 'src/Context'),
      '@hooks': path.resolve(__dirname, 'src/Hooks'),
      '@services': path.resolve(__dirname, 'src/Services'),
      '@utils': path.resolve(__dirname, 'src/Utils'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@styles': path.resolve(__dirname, 'src/Styles'),
      '@assets': path.resolve(__dirname, 'src/Assets'),
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
  },
};


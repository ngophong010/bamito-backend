// .sequelizerc.cjs
const path = require("path");

// This file provides the configuration for the Sequelize CLI tool.
// It MUST point to the COMPILED JavaScript output, not the TypeScript source.

module.exports = {
  // Point to the compiled config file in your build output directory.
  'config': path.resolve('build/config', 'config.js'),

  // Point to the compiled models in your build output directory.
  'models-path': path.resolve('build', 'models'),

  // Migrations and seeders are often plain JS, so they might be copied directly.
  // If you compile them, point to the build directory as well.
  // If you keep them as .js in /src, this path is okay, but it's better to be consistent.
  'migrations-path': path.resolve('src', 'migrations'),
  'seeders-path': path.resolve('src', 'seeders'),
};

import { Sequelize } from "sequelize"; // ENHANCEMENT 2: Import from the correct library
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import sequelize from '../config/connectDB.js';

// This is a more scalable pattern. It defines an object where each key
// is a string and each value is a Sequelize Model.
export interface Models {
  [key: string]: any;
}

const models: Models = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all files from the current directory, excluding this index file
const files = fs.readdirSync(__dirname)
  .filter(file => 
    file.indexOf(".") !== 0 && 
    file !== "index.ts" && 
    (file.endsWith(".js") || file.endsWith(".ts")) && 
    !file.endsWith('.map')
  );

// Dynamically import and initialize all models
for (const file of files) {
  // Use a dynamic import, which is the modern ESM way
  const modelModule = await import(path.join(__dirname, file).replace(/\\/g, '/'));
  const modelInitializer = modelModule.default;
  
  const model = modelInitializer(sequelize);
  
  models[model.name] = model;
}

Object.values(models).forEach((model) => {
  // `model` is now the correct variable, representing each model instance in the loop.
  if (model.associate) {
    model.associate(models);
  }
});


// Export the configured Sequelize instance and the fully-formed models object
export { sequelize };
export default models;

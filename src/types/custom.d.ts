// This tells TypeScript that we are augmenting the existing 'Express' namespace.
declare namespace Express {
  // We are adding a new property 'file' to the 'Request' interface.
  export interface Request {
    // 'file' is optional because not every request will have a file upload.
    // The type `Multer.File` comes from the Multer library itself,
    // providing full type safety for file properties like .path, .filename, etc.
    file?: Multer.File;
  }
}
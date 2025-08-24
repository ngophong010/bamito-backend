interface JwtPayload {
  id: number;
  role: string;
}

declare namespace Express {
  export interface Request {
    file?: Multer.File;
    user?: JwtPayload; // Add the user property
  }
}
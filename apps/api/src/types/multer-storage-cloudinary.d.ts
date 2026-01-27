declare module "multer-storage-cloudinary" {
  import type { StorageEngine } from "multer";
  import type { v2 as CloudinaryV2 } from "cloudinary";

  type Params =
    | Record<string, unknown>
    | ((req: unknown, file: unknown) => Promise<Record<string, unknown>> | Record<string, unknown>);

  interface Options {
    cloudinary: typeof CloudinaryV2;
    params?: Params;
  }

  /**
   * Minimal type declaration for Cloudinary Storage used by Multer.
   * Returns a Multer StorageEngine.
   */
  export default function CloudinaryStorage(options: Options): StorageEngine;
}

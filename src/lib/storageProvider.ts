import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  R2_ACCESS_KEY_ID,
  R2_ACCOUNT_ID,
  R2_BUCKET_NAME,
  R2_SECRET_ACCESS_KEY,
  R2_SIGNED_URL_EXPIRY_TIME,
} from "../constants/env";
import type { AnyType } from "../types/types";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export const uploadFile = async (file: AnyType) => {
  try {
    const filename = `${Date.now()}-${file.originalname}`;
    const params = {
      Bucket: R2_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
    };

    const command = new PutObjectCommand(params);
    const uploadInfo = await r2.send(command);

    return { status: true, error: null, data: { ...uploadInfo, filename } };
  } catch (error) {
    return { status: false, error, data: null };
  }
};

export const genSignedDownloadUrl = async (fileName: string) => {
  try {
    const params = {
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
    };

    const command = new GetObjectCommand(params);

    const signedUrl = await getSignedUrl(r2, command, {
      expiresIn: R2_SIGNED_URL_EXPIRY_TIME,
    }); //in second
    
    return { status: true, error: null, url: signedUrl };
  } catch (error) {
    return { status: false, error, data: null };
  }
};

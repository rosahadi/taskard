import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import AppError from './appError';
import catchAsync from './catchAsync';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary configuration
const verifyCloudinaryConfig = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new AppError('Cloudinary configuration is missing', 500);
  }
};

// Memory storage for multer
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new AppError('Not an image! Please upload only images.', 400));
    return;
  }
  cb(null, true);
};

// Define multer configuration with size limits
const imageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
});

// Function to upload buffer to Cloudinary
const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  try {
    verifyCloudinaryConfig();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            reject(
              new AppError(`Cloudinary upload failed: ${error.message}`, 500)
            );
          } else if (!result?.secure_url) {
            reject(
              new AppError(
                'Cloudinary upload failed - no secure URL received',
                500
              )
            );
          } else {
            resolve(result.secure_url);
          }
        }
      );

      const readableStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });

      readableStream.pipe(uploadStream);
    });
  } catch {
    throw new AppError('Cloudinary upload failed', 500);
  }
};

// Middleware for handling image uploads
const handleImageUpload = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      return next();
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'blog-images');
    req.body.image = imageUrl;
    next();
  }
);

// Error handling middleware
const uploadErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        status: 'error',
        message: `File size exceeds limit`,
      });
      return;
    }
  }

  const statusCode = (err as AppError).statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'An unexpected error occurred during upload',
  });
};

// Create upload middleware for images
const createImageUploadMiddleware = (fieldName: string) => {
  return imageUpload.single(fieldName);
};

export { createImageUploadMiddleware, handleImageUpload, uploadErrorHandler };

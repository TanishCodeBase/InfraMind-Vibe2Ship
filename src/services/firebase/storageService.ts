import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type StorageReference,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { STORAGE_PATHS, UPLOAD_LIMITS } from "@/lib/constants";
import { generateStoragePath, getFileExtension } from "@/lib/helpers";
import type { UploadResponse } from "@/types/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadProgressCallback {
  (progress: number): void;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateImageFile(file: File): void {
  const accepted = UPLOAD_LIMITS.ACCEPTED_IMAGE_TYPES as readonly string[];
  if (!accepted.includes(file.type)) {
    throw new Error(
      `Invalid image type "${file.type}". Accepted: ${UPLOAD_LIMITS.ACCEPTED_IMAGE_TYPES.join(", ")}`
    );
  }
  const maxBytes = UPLOAD_LIMITS.IMAGE_MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: ${UPLOAD_LIMITS.IMAGE_MAX_SIZE_MB} MB`
    );
  }
}

function validateVideoFile(file: File): void {
  const accepted = UPLOAD_LIMITS.ACCEPTED_VIDEO_TYPES as readonly string[];
  if (!accepted.includes(file.type)) {
    throw new Error(
      `Invalid video type "${file.type}". Accepted: ${UPLOAD_LIMITS.ACCEPTED_VIDEO_TYPES.join(", ")}`
    );
  }
  const maxBytes = UPLOAD_LIMITS.VIDEO_MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `Video too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: ${UPLOAD_LIMITS.VIDEO_MAX_SIZE_MB} MB`
    );
  }
}

// ─── Core upload helper ───────────────────────────────────────────────────────

async function uploadFile(
  storageRef: StorageReference,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    task.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => {
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          resolve({
            downloadURL,
            storagePath: storageRef.fullPath,
            contentType: file.type,
            sizeBytes: file.size,
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Upload a single issue image.
 * Returns download URL and storage metadata.
 */
export async function uploadIssueImage(
  file: File,
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResponse> {
  validateImageFile(file);
  const path = generateStoragePath(STORAGE_PATHS.ISSUE_IMAGES, userId, file.name);
  const storageRef = ref(storage, path);
  return uploadFile(storageRef, file, onProgress);
}

/**
 * Upload multiple issue images (up to MAX_IMAGES_PER_ISSUE).
 * Progress is reported per-file as an array of numbers.
 */
export async function uploadIssueImages(
  files: File[],
  userId: string,
  onProgress?: (progresses: number[]) => void
): Promise<UploadResponse[]> {
  if (files.length > UPLOAD_LIMITS.MAX_IMAGES_PER_ISSUE) {
    throw new Error(
      `Too many images (${files.length}). Max: ${UPLOAD_LIMITS.MAX_IMAGES_PER_ISSUE}`
    );
  }
  files.forEach(validateImageFile);

  const progresses = new Array<number>(files.length).fill(0);

  const results = await Promise.all(
    files.map((file, i) =>
      uploadFile(
        ref(storage, generateStoragePath(STORAGE_PATHS.ISSUE_IMAGES, userId, file.name)),
        file,
        (p) => {
          progresses[i] = p;
          onProgress?.([...progresses]);
        }
      )
    )
  );

  return results;
}

/**
 * Upload an issue video.
 */
export async function uploadIssueVideo(
  file: File,
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResponse> {
  validateVideoFile(file);
  const path = generateStoragePath(STORAGE_PATHS.ISSUE_VIDEOS, userId, file.name);
  const storageRef = ref(storage, path);
  return uploadFile(storageRef, file, onProgress);
}

/**
 * Upload a user avatar.
 */
export async function uploadUserAvatar(
  file: File,
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResponse> {
  validateImageFile(file);
  const ext = getFileExtension(file.name);
  const storageRef = ref(storage, `${STORAGE_PATHS.USER_AVATARS}/${userId}/avatar.${ext}`);
  return uploadFile(storageRef, file, onProgress);
}

/**
 * Delete a file from Firebase Storage by its full storage path.
 */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

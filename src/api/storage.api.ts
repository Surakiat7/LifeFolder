import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { STORAGE_BUCKET } from '../utils/constants';
import { generateStoragePath, readFileAsBase64 } from '../utils/file';
import { SelectedFile } from '../utils/types';

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  userId: string,
  file: SelectedFile,
  itemId?: string
): Promise<{ path: string; url: string } | null> => {
  try {
    const filePath = generateStoragePath(userId, file.name, itemId);
    
    // Read file as base64
    const base64 = await readFileAsBase64(file.uri);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, decode(base64), {
        contentType: file.mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (
  userId: string,
  files: SelectedFile[],
  itemId?: string
): Promise<{ path: string; url: string; fileName: string; fileSize: number; mimeType: string }[]> => {
  try {
    const results = await Promise.all(
      files.map(async (file) => {
        const result = await uploadFile(userId, file, itemId);
        if (result) {
          return {
            ...result,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.mimeType,
          };
        }
        return null;
      })
    );

    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Delete multiple files
 */
export const deleteFiles = async (filePaths: string[]): Promise<void> => {
  try {
    if (filePaths.length === 0) return;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting files:', error);
    throw error;
  }
};

/**
 * Get a signed URL for a file (for private buckets)
 */
export const getSignedUrl = async (
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
};

/**
 * Get public URL for a file
 */
export const getPublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Download a file
 */
export const downloadFile = async (filePath: string): Promise<Blob | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
};

/**
 * List files in a folder
 */
export const listFiles = async (
  folderPath: string
): Promise<{ name: string; id: string; created_at: string }[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folderPath);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

/**
 * Move/rename a file
 */
export const moveFile = async (
  fromPath: string,
  toPath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .move(fromPath, toPath);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
};

/**
 * Copy a file
 */
export const copyFile = async (
  fromPath: string,
  toPath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .copy(fromPath, toPath);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
};

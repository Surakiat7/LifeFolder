import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { SelectedFile, FileType } from './types';
import { FILE_TYPE_ICONS, MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from './constants';

/**
 * Pick a document from the device
 */
export const pickDocument = async (): Promise<SelectedFile | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    
    return {
      uri: asset.uri,
      name: asset.name,
      type: getFileType(asset.mimeType || ''),
      size: asset.size || 0,
      mimeType: asset.mimeType || 'application/octet-stream',
    };
  } catch (error) {
    console.error('Error picking document:', error);
    throw error;
  }
};

/**
 * Pick an image from the library
 */
export const pickImage = async (): Promise<SelectedFile | null> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      throw new Error('Permission to access media library was denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.uri.split('/').pop() || 'image.jpg';
    
    // Get file info for size
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    
    return {
      uri: asset.uri,
      name: fileName,
      type: 'image',
      size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      mimeType: asset.mimeType || 'image/jpeg',
    };
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

/**
 * Pick multiple images from the library
 */
export const pickMultipleImages = async (): Promise<SelectedFile[]> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      throw new Error('Permission to access media library was denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    const files: SelectedFile[] = await Promise.all(
      result.assets.map(async (asset) => {
        const fileName = asset.uri.split('/').pop() || 'image.jpg';
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        
        return {
          uri: asset.uri,
          name: fileName,
          type: 'image' as FileType,
          size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
          mimeType: asset.mimeType || 'image/jpeg',
        };
      })
    );

    return files;
  } catch (error) {
    console.error('Error picking images:', error);
    throw error;
  }
};

/**
 * Take a photo with the camera
 */
export const takePhoto = async (): Promise<SelectedFile | null> => {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      throw new Error('Permission to access camera was denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = `photo_${Date.now()}.jpg`;
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    
    return {
      uri: asset.uri,
      name: fileName,
      type: 'image',
      size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      mimeType: 'image/jpeg',
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    throw error;
  }
};

/**
 * Read file as base64
 */
export const readFileAsBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error reading file as base64:', error);
    throw error;
  }
};

/**
 * Read file as array buffer (for upload)
 */
export const readFileAsArrayBuffer = async (uri: string): Promise<ArrayBuffer> => {
  try {
    const base64 = await readFileAsBase64(uri);
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  } catch (error) {
    console.error('Error reading file as array buffer:', error);
    throw error;
  }
};

/**
 * Get file type category from MIME type
 */
export const getFileType = (mimeType: string): FileType => {
  if (SUPPORTED_FILE_TYPES.images.includes(mimeType as any)) {
    return 'image';
  }
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  if (SUPPORTED_FILE_TYPES.documents.includes(mimeType as any)) {
    return 'doc';
  }
  if (SUPPORTED_FILE_TYPES.videos.includes(mimeType as any)) {
    return 'video';
  }
  return 'other';
};

/**
 * Get icon name for file type
 */
export const getFileIcon = (mimeType: string): string => {
  return FILE_TYPE_ICONS[mimeType] || FILE_TYPE_ICONS.default;
};

/**
 * Validate file size
 */
export const validateFileSize = (size: number): boolean => {
  return size <= MAX_FILE_SIZE;
};

/**
 * Generate unique file path for storage
 */
export const generateStoragePath = (
  userId: string,
  fileName: string,
  itemId?: string
): string => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  if (itemId) {
    return `${userId}/${itemId}/${timestamp}_${cleanFileName}`;
  }
  
  return `${userId}/${timestamp}_${cleanFileName}`;
};

/**
 * Get file info
 */
export const getFileInfo = async (uri: string): Promise<{ exists: boolean; size: number } | null> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    
    if (info.exists && 'size' in info) {
      return {
        exists: true,
        size: info.size,
      };
    }
    
    return { exists: false, size: 0 };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

/**
 * Delete a local file
 */
export const deleteLocalFile = async (uri: string): Promise<void> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting local file:', error);
  }
};

/**
 * Download file to local storage
 */
export const downloadFile = async (
  url: string,
  fileName: string
): Promise<string | null> => {
  try {
    const downloadDir = `${FileSystem.documentDirectory}downloads/`;
    
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(downloadDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    }
    
    const localUri = `${downloadDir}${fileName}`;
    
    const downloadResult = await FileSystem.downloadAsync(url, localUri);
    
    if (downloadResult.status === 200) {
      return downloadResult.uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
};

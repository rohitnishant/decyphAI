
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a File object to a data URI string.
 * @param file The File object to convert.
 * @returns A promise that resolves with the data URI string.
 */
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URI.'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}


/**
 * Converts a data URI string to a Blob object.
 * @param dataURI The data URI string to convert.
 * @returns A Blob object.
 * @throws Error if the data URI format is invalid.
 */
export function dataUriToBlob(dataURI: string): Blob {
    // Validate the basic format
    if (!dataURI || !dataURI.includes(',')) {
        throw new Error('Invalid data URI format.');
    }

    // Convert base64/URLEncoded data component to raw binary data held in a string
    let byteString: string;
    const uriParts = dataURI.split(',');
    const mimeString = uriParts[0].split(':')[1].split(';')[0];
    const dataPart = uriParts[1];

    if (uriParts[0].includes('base64')) {
        // Handle potential characters like '+' being replaced by ' ' in URL encoding
        const base64 = dataPart.replace(/ /g, '+');
        byteString = atob(base64);
    } else {
        byteString = decodeURIComponent(dataPart);
    }

    // Write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

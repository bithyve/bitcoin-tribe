import logger from 'src/utils/logger';

export const hexToBase64 = (hexString: string): {base64: string, fileType: string} => {

    const input = hexString.replace(/[^A-Fa-f0-9]/g, '');
    if (input.length % 2) {
        logger.error('Cleaned hex string length is odd.');
        return;
    }
    const binary = [];
    for (let i = 0; i < input.length / 2; i++) {
        const h = input.substr(i * 2, 2);
        binary[i] = parseInt(h, 16);
    }
    const byteArray = Uint8Array.from(binary);
    const base64 = Buffer.from(byteArray).toString('base64');
    return {
        base64,
        fileType: determineFileType(hexString),
    };
};

function determineFileType(hexString) {
    const input = hexString.replace(/[^A-Fa-f0-9]/g, ''); // Clean non-hex chars
    const header = input.slice(0, 16).toUpperCase(); // Get the first 8 bytes
    const magicNumbers = {
        '89504E47': 'image/png',
        'FFD8FF': 'image/jpeg',
        '47494638': 'image/gif',
        '424D': 'image/bmp',
        '25504446': 'application/pdf',
        '504B0304': 'application/zip',
    };

    for (const [magic, type] of Object.entries(magicNumbers)) {
        if (header.startsWith(magic)) {
            return type; // Return the MIME type
        }
    }
    return 'unknown';
}

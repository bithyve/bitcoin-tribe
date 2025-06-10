export const hexToBase64 = (
    hexString: string,
): { base64: string; fileType: string } | null => {
    const isValidHex = /^[0-9a-fA-F]+$/.test(hexString) && hexString.length % 2 === 0;
    if (!isValidHex) {
        return null;
    }
    const binary = [] as number[];
    for (let i = 0; i < hexString.length / 2; i++) {
        const h = hexString.substr(i * 2, 2);
        const parsed = parseInt(h, 16);
        if (Number.isNaN(parsed)) {
            return null;
        }
        binary[i] = parsed;
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

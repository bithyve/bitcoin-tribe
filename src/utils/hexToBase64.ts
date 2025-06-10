export const hexToBase64 = (
  hexString: string,
): { base64: string; fileType: string } => {
  const sanitized = hexString.replace(/^0x/i, '').replace(/\s+/g, '');

  if (!/^[a-fA-F0-9]+$/.test(sanitized) || sanitized.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }

  const binary: number[] = [];
  for (let i = 0; i < sanitized.length / 2; i++) {
    const h = sanitized.substr(i * 2, 2);
    binary[i] = parseInt(h, 16);
  }

  const byteArray = Uint8Array.from(binary);
  const base64 = Buffer.from(byteArray).toString('base64');
  return {
    base64,
    fileType: determineFileType(sanitized),
  };
};

function determineFileType(hexString: string): string {
  const input = hexString.replace(/[^A-Fa-f0-9]/g, ''); // Clean non-hex chars
  const header = input.slice(0, 16).toUpperCase(); // Get the first 8 bytes
  const magicNumbers: Record<string, string> = {
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

export const hexToBase64 = (hexString: string, mime: string): string => {

    const input = hexString.replace(/[^A-Fa-f0-9]/g, '');
    if (input.length % 2) {
        console.log('Cleaned hex string length is odd.');
        return;
    }
    const binary = [];
    for (let i = 0; i < input.length / 2; i++) {
        const h = input.substr(i * 2, 2);
        binary[i] = parseInt(h, 16);
    }
    const byteArray = Uint8Array.from(binary);
    const base64String = Buffer.from(byteArray).toString('base64');
    return `data:${mime};base64,${base64String}`;
};

// Utility function to convert an ArrayBuffer to a hex string
function bufferToHex(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    return Array.from(byteArray)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

// Utility function to convert a hex string to an ArrayBuffer
function hexToBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes.buffer;
}

// Hash the string to produce a key of correct length
async function createKeyFromString(keyString: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(keyString);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    return crypto.subtle.importKey(
        'raw',
        hashBuffer,
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypt function
export interface EncryptedData {
    iv: string;
    cipherText: string;
    tag: string;
}

async function encryptData(plainText: string, keyString: string): Promise<EncryptedData> {
    try {
        const key = await createKeyFromString(keyString);

        const encoder = new TextEncoder();
        const data = encoder.encode(plainText);

        const iv = crypto.getRandomValues(new Uint8Array(12));

        const cipherText = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            data
        );

        const tag = cipherText.slice(-16); // Authentication tag
        const encryptedBytes = cipherText.slice(0, -16); // Cipher text without tag

        return {
            iv: bufferToHex(iv),
            cipherText: bufferToHex(encryptedBytes),
            tag: bufferToHex(tag),
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Encryption failed: ${error.message}`);
        } else {
            throw new Error('Encryption failed: Unknown error');
        }
    }
}

// Decrypt function
async function decryptData(encryptedData: EncryptedData, keyString: string): Promise<string> {
    try {
        const key = await createKeyFromString(keyString);

        const iv = hexToBuffer(encryptedData.iv);
        const cipherText = hexToBuffer(encryptedData.cipherText);
        const tag = hexToBuffer(encryptedData.tag);

        const cipherTextWithTag = new Uint8Array([...new Uint8Array(cipherText), ...new Uint8Array(tag)]);

        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
                tagLength: 128,
            },
            key,
            cipherTextWithTag
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Decryption failed: ${error.message}`);
        } else {
            throw new Error('Decryption failed: Unknown error');
        }
    }
}

export { encryptData, decryptData };
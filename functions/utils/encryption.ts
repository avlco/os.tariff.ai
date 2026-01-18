// 📁 File: functions/utils/encryption.ts
// [מערכת הניהול - os.tariff.ai]

/**
 * מנוע הצפנה AES-256-GCM
 * מספק הצפנה חזקה (Military Grade) עם אימות נתונים.
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 12 bytes recommended for GCM

// המרת מחרוזת למערך בתים
const enc = new TextEncoder();
const dec = new TextDecoder();

/**
 * מביא את המפתח הסודי ממשתני הסביבה ומכין אותו לשימוש קריפטוגרפי
 */
async function getCryptoKey(): Promise<CryptoKey> {
    const secret = Deno.env.get('ENCRYPTION_MASTER_KEY');
    
    if (!secret || secret.length < 32) {
        throw new Error('Critical Security Error: ENCRYPTION_MASTER_KEY is missing or too short (must be 32+ chars)');
    }

    // הופך את הסיסמה למפתח קריפטוגרפי
    // אנו משתמשים ב-digest כדי להבטיח אורך קבוע של 256 ביט
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: enc.encode('salt-tariff-ai-static'), // מלח סטטי קבוע
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * המרת ArrayBuffer למחרוזת Hex
 */
function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * המרת מחרוזת Hex ל-Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

/**
 * מצפין טקסט.
 * פורמט הפלט: "IV_IN_HEX:CIPHERTEXT_IN_HEX"
 */
export async function encrypt(text: string): Promise<string> {
    if (!text) return text;

    try {
        const key = await getCryptoKey();
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        const encodedText = enc.encode(text);

        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: ALGORITHM, iv: iv },
            key,
            encodedText
        );

        const ivHex = bufferToHex(iv.buffer);
        const encryptedHex = bufferToHex(encryptedBuffer);

        return `${ivHex}:${encryptedHex}`;
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Encryption failed');
    }
}

/**
 * מפענח טקסט.
 * כולל מנגנון Fallback: אם הטקסט לא בפורמט מוצפן, מחזיר אותו כמו שהוא.
 */
export async function decrypt(text: string): Promise<string> {
    if (!text) return text;

    // בדיקה: האם הטקסט בפורמט המוצפן שלנו? (IV:CONTENT)
    // אם לא, כנראה מדובר במידע ישן שטרם הוצפן - נחזיר אותו כמו שהוא
    if (!text.includes(':') || text.length < 32) {
        return text; 
    }

    try {
        const [ivHex, encryptedHex] = text.split(':');
        
        // בדיקות תקינות בסיסיות
        if (ivHex.length !== IV_LENGTH * 2 || !encryptedHex) {
            return text; // Fallback לטקסט רגיל אם הפורמט שגוי
        }

        const key = await getCryptoKey();
        const iv = hexToBytes(ivHex);
        const encryptedBytes = hexToBytes(encryptedHex);

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: ALGORITHM, iv: iv },
            key,
            encryptedBytes
        );

        return dec.decode(decryptedBuffer);
    } catch (error) {
        console.warn('Decryption failed (returning original text):', error);
        // במקרה של כישלון פענוח (למשל מפתח לא נכון או פורמט שגוי), 
        // נחזיר את המקור כדי לא לשבור את הממשק, אבל נרשום לוג אזהרה.
        return text;
    }
}

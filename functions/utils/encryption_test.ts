// 📁 File: functions/utils/encryption_test.ts
// [מערכת הניהול - os.tariff.ai]

import { assertEquals, assertNotEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { encrypt, decrypt } from "./encryption.ts";

// הגדרת מפתח דמי לצורך הטסט (כי אין לנו Env בטסט מקומי)
Deno.env.set('ENCRYPTION_MASTER_KEY', 't7^gL9@vX#2mP$qR5&kZ8*dN4!wY1%bJ');

Deno.test("Encryption Engine Tests", async (t) => {
  
  const sensitiveData = "Customer Credit Card: 4580-1234-5678-9012";

  await t.step("Should encrypt data to a different string", async () => {
    const encrypted = await encrypt(sensitiveData);
    console.log("Encrypted:", encrypted);
    
    assertNotEquals(encrypted, sensitiveData); // חייב להיות שונה
    assertNotEquals(encrypted.length, 0);
    assertEquals(encrypted.includes(':'), true); // חייב לכלול מפריד
  });

  await t.step("Should decrypt data back to original", async () => {
    const encrypted = await encrypt(sensitiveData);
    const decrypted = await decrypt(encrypted);
    
    console.log("Original:", sensitiveData);
    console.log("Decrypted:", decrypted);
    
    assertEquals(decrypted, sensitiveData);
  });

  await t.step("Fallback: Should return plain text if not encrypted", async () => {
    const plainText = "Just a normal description";
    const result = await decrypt(plainText);
    
    assertEquals(result, plainText);
  });
});

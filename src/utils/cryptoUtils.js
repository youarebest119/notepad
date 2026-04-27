import CryptoJS from 'crypto-js'

/**
 * Encrypts a string using a PIN as the key.
 * @param {string} text - The text to encrypt.
 * @param {string} pin - The PIN to use for encryption.
 * @returns {string} The encrypted string.
 */
export const encryptNote = (text, pin) => {
  try {
    return CryptoJS.AES.encrypt(text, pin).toString()
  } catch (error) {
    console.error('Encryption failed:', error)
    return null
  }
}

/**
 * Decrypts a string using a PIN as the key.
 * @param {string} ciphertext - The encrypted string.
 * @param {string} pin - The PIN to use for decryption.
 * @returns {string|null} The decrypted string or null if decryption fails.
 */
export const decryptNote = (ciphertext, pin) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, pin)
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8)
    if (!decryptedText) throw new Error('Invalid PIN or corrupted data')
    return decryptedText
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}

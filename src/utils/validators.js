/**
 * validators.js
 * ----------------------------------------------------------------
 * Form validation helpers for FutureHealth. Used by SimulationForm
 * and ProfilePage to validate user inputs before submission.
 * ----------------------------------------------------------------
 */

/**
 * Validates an age value.
 * @param {number|string} age
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateAge(age) {
  const num = Number(age)
  if (!age && age !== 0) return { valid: false, message: 'Usia wajib diisi.' }
  if (Number.isNaN(num)) return { valid: false, message: 'Usia harus berupa angka.' }
  if (num < 10 || num > 120) return { valid: false, message: 'Usia harus antara 10–120 tahun.' }
  return { valid: true }
}

/**
 * Validates a height value (in cm).
 * @param {number|string} height
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateHeight(height) {
  const num = Number(height)
  if (!height && height !== 0) return { valid: false, message: 'Tinggi badan wajib diisi.' }
  if (Number.isNaN(num)) return { valid: false, message: 'Tinggi badan harus berupa angka.' }
  if (num < 50 || num > 300) return { valid: false, message: 'Tinggi badan harus antara 50–300 cm.' }
  return { valid: true }
}

/**
 * Validates a weight value (in kg).
 * @param {number|string} weight
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateWeight(weight) {
  const num = Number(weight)
  if (!weight && weight !== 0) return { valid: false, message: 'Berat badan wajib diisi.' }
  if (Number.isNaN(num)) return { valid: false, message: 'Berat badan harus berupa angka.' }
  if (num < 10 || num > 500) return { valid: false, message: 'Berat badan harus antara 10–500 kg.' }
  return { valid: true }
}

/**
 * Validates an email address.
 * @param {string} email
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, message: 'Email wajib diisi.' }
  const trimmed = email.trim()
  if (trimmed.length === 0) return { valid: false, message: 'Email wajib diisi.' }
  // Basic email pattern check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(trimmed)) return { valid: false, message: 'Format email tidak valid.' }
  return { valid: true }
}

/**
 * Validates a password.
 * @param {string} password
 * @param {number} [minLength=6]
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') return { valid: false, message: 'Kata sandi wajib diisi.' }
  if (password.length < minLength) return { valid: false, message: `Kata sandi minimal ${minLength} karakter.` }
  return { valid: true }
}

/**
 * Validates that a required string field is not empty.
 * @param {string} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { valid: false, message: `${fieldName} wajib diisi.` }
  }
  return { valid: true }
}

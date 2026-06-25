/**
 * useAuth.js
 * ----------------------------------------------------------------
 * Re-export of the useAuth hook from AuthContext.
 *
 * Per the dependency map, hooks/ should contain a useAuth.js file.
 * The actual implementation lives in context/AuthContext.jsx where
 * it is co-located with AuthProvider. This file provides the
 * expected import path for consumers who prefer:
 *
 *   import { useAuth } from '../hooks/useAuth.js'
 *
 * over:
 *
 *   import { useAuth } from '../context/AuthContext.jsx'
 *
 * Both paths resolve to the same function.
 * ----------------------------------------------------------------
 */

export { useAuth } from '../context/AuthContext.jsx'

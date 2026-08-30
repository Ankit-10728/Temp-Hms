// Centralized payload normalization & validation helpers

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function toNumberOrUndefined(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseDateOrUndefined(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function requireFields(obj, fields) {
  const missing = [];
  for (const f of fields) {
    const val = obj?.[f];
    if (val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim() === '')) {
      missing.push(f);
    }
  }
  return missing;
}

/**
 * Normalizes nested-or-flat payloads.
 * - preferredNestedKey: e.g. 'owner'
 * - flatFallback: the request.body if nested object empty
 */
function pickNestedOrFlat({ body, nestedKey, fallbackKeys }) {
  const nested = body?.[nestedKey];
  const nestedHasAny = nested && typeof nested === 'object' && Object.keys(nested).length > 0;

  if (nestedHasAny) return nested;

  // fallback to flat only if at least one expected key exists
  const fallbackHasAny = (fallbackKeys || []).some((k) => body?.[k] !== undefined);
  if (fallbackHasAny) return body;

  return nested || {};
}

function normalizeBooleanArray(arr) {
  if (!Array.isArray(arr)) return undefined;
  return arr;
}

module.exports = {
  isNonEmptyString,
  toNumberOrUndefined,
  parseDateOrUndefined,
  requireFields,
  pickNestedOrFlat,
  normalizeBooleanArray
};


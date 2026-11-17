// Computes chi-square upper-tail p-values for the seat-fairness test.

// ln Γ(q), Lanczos approximation
function logGamma(q) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = q, tmp = q + 5.5, ser = 1.000000000190015;
  tmp -= (q + 0.5) * Math.log(tmp);
  for (const c of g) ser += c / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / q);
}

// P(X ≥ x) for X ~ chi-square(k): 1 − regularized lower gamma P(k/2, x/2), series form
export function chiSquareP(x, k) {
  const a = k / 2, z = x / 2;
  if (z <= 0) return 1;
  let sum = 0, term = 1 / a;
  for (let n = 1; n < 500 && term > 1e-12 * sum; n++) { sum += term; term *= z / (a + n); }
  return Math.max(0, 1 - sum * Math.exp(-z + a * Math.log(z) - logGamma(a)));
}

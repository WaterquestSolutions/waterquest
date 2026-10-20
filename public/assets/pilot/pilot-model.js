export function compareBudget(values) {
  const keys = ['cost','grant','tax','baseline','proposed'];
  if (keys.some(k => values[k] === '' || values[k] == null)) throw new Error('Enter all five amounts, using 0 for support that does not apply.');
  const v = Object.fromEntries(keys.map(k => [k, Number(values[k])]));
  if (keys.some(k => !Number.isFinite(v[k]) || v[k] < 0 || v[k] > 1e9) || v.cost <= 0) throw new Error('Use valid non-negative amounts and an installed cost greater than zero (maximum CAD $1 billion per field).');
  if (v.grant + v.tax > v.cost) throw new Error('Combined support cannot exceed the installed project cost in this comparison. Check your confirmed amounts.');
  const savings = v.baseline - v.proposed;
  const remaining = v.cost - v.grant - v.tax;
  return { ...v, savings, remaining, basePayback: savings > 0 ? v.cost / savings : null, supportedPayback: savings > 0 ? remaining / savings : null };
}
export function matchesFunding(region, applicants, selectedRegion, selectedApplicant) {
  return (selectedRegion === 'all' || region === 'Canada' || region === selectedRegion) && (selectedApplicant === 'all' || applicants.split(' ').includes(selectedApplicant));
}

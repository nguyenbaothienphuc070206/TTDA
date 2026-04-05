export function calculateCalories(weight, height, age) {
  const w = Number(weight) || 0;
  const h = Number(height) || 0;
  const a = Number(age) || 0;

  const bmr = 10 * w + 6.25 * h - 5 * a + 5;
  return Math.round(bmr * 1.4);
}

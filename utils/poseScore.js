export function calculateScore(userPose, idealPose) {
  const user = Array.isArray(userPose) ? userPose : [];
  const ideal = Array.isArray(idealPose) ? idealPose : [];
  const len = Math.min(user.length, ideal.length);
  if (!len) return 0;

  let error = 0;
  for (let i = 0; i < len; i += 1) {
    error += Math.abs(Number(user[i]) - Number(ideal[i]));
  }

  const normalized = Math.max(0, 100 - (error * 100) / len);
  return Math.round(Math.min(100, normalized));
}

export const tryToConvertToArrayHelper = (x) => {
  if (Array.isArray(x)) return x;
  if (!x) return [];

  try {
    const parsed = JSON.parse(x);
    if (Array.isArray(parsed)) return parsed;
    else return [];
  } catch (e) {
    return [];
  }
};

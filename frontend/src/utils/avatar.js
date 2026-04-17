export const getAvatarUrl = (seed) => {
  const safeSeed = seed || 'User';
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(safeSeed)}&background=%23edf2ff`;
};

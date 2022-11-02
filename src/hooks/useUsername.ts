export const useUsername = () => {
  const USERNAME_KEY = "username";

  const query = new URLSearchParams(window.location.search);
  const username = query.get(USERNAME_KEY);

  return { username };
};

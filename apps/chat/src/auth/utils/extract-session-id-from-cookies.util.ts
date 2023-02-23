export const extractSessionIdFromCookies = (cookies: string) => {
  if (!cookies) {
    return null;
  }

  const cookieArray = cookies.replace(/\s/g, '').split(';');
  const sessionIdCookie = cookieArray.find((str) => str.includes('SESSION_ID'));

  if (!sessionIdCookie) {
    return null;
  }

  return sessionIdCookie.replace('SESSION_ID=', '');
};

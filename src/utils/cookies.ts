export const getCookieByName = (cookies: string, cookieName: string): string | undefined => {
  const foundCookie = cookies
    .split(';')
    .find((cookie) => cookie.includes(cookieName))
    ?.split('=')[1];

  return foundCookie;
};

export const useUserInfo = () => {
  const userInfo = useCookie<any>("user_info");

  const setUserInfo = (userData: any) => {
    userInfo.value = userData;
  };

  const getUserInfo = (): any => {
    return userInfo.value;
  };

  const clearUserInfo = () => {
    userInfo.value = null;
  };

  return {
    userInfo: readonly(userInfo),
    setUserInfo,
    getUserInfo,
    clearUserInfo,
  };
};

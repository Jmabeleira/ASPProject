
  export function getCurrentUser() {
    const user = localStorage.getItem("currentUser");
    console.log("Current user from cache:", user);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  export function setCurrentUser(user: any) {
    const userInStorage = localStorage.getItem("currentUser");
    if(userInStorage){
      const parsedUser = JSON.parse(userInStorage);
      if (parsedUser && parsedUser.email === user.email) {
        //console.log("User already exists in cache:", parsedUser);
        return;
      }
    }
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("userId", user.id);
    localStorage.setItem("companyId", user.companyId);
    localStorage.setItem("areaId", user.areaId);
    localStorage.setItem("isSubscribed",user.isSubscribed);
  }


  export function clearCurrentUser() {
    localStorage.removeItem("currentUser");
  }

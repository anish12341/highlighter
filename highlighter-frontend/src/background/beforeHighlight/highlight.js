const userLoggedIn = () => {
  return new Promise (
    async(resolve, reject) => {
      // chrome.storage.sync.clear();
      chrome.storage.sync.get('user', (data) => {
        console.log('Value currently is ', data);    
        if (!data.user) {
          console.log('Returning false');
          return resolve({isLoggedIn: false, userData: null});
        }
        console.log('Returning true');    
        return resolve({isLoggedIn: true, userData: data.user});
      })
    }
  );
};

module.exports = {userLoggedIn};
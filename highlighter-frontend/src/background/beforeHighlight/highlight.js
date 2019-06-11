const highlightPost = () => {
  
}

const userLoggedIn = () => {
  return new Promise (
    async(resolve, reject) => {
      // chrome.storage.sync.clear();
      chrome.storage.sync.get('user', (data) => {
        console.log('Value currently is ', data);    
        if (!data.user) {
          console.log('Returning false');      
          return resolve(false);
        }
        console.log('Returning true');    
        return resolve(true);
      })
    }
  );
};

module.exports = {userLoggedIn};
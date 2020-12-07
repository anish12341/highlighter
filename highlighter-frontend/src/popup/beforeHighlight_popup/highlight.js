// A module within popup functionality
const host = 'http://127.0.0.1:3000';

/**
 * Method to open login screen from backend
 * TODO: generalize the host (http://127.0.0.1:3000/)
 */
const openLogin = () => {
  // chrome.extension.getBackgroundPage().console.log('Loging button is clicked after!');
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url: `${host}/users/login`, active: true}, (tabs) => {
      // chrome.extension.getBackgroundPage().console.log('New tab created!!', tabsMain[0].id);
    })
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}

/**
 * Method to open signup screen from backend
 * TODO: generalize the host (http://127.0.0.1:3000/)
 */
const openSignup = () => {
  // chrome.extension.getBackgroundPage().console.log('Signup button is clicked after!');
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url: `${host}/users/signup`, active: true}, (tabs) => {
      // chrome.extension.getBackgroundPage().console.log('New tab created!!', tabsMain[0].id);
    })
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}

/**
 * Method to logout which clears chrome.storage which stores user information when user
 * is logged in
 */
const logout = async () => {
  console.log('Logout button is clicked after!');
  await registerLoginSignup();
  chrome.storage.sync.clear();
}

/**
 * Logic to change display property
 */
const hideShowLogin = (type, elementObject) => {
  elementObject.afterLogin.style.display = type === 'logout' ? 'none' : 'block';
  elementObject.beforeLogin.style.display = type === 'logout' ? 'block' : 'none';
}

/**
 * Method to register events on Login signup button after pressing logout button
 */
const registerLoginSignup = () => {
  return new Promise(
    async (resolve, reject) => {
      try {
        setCurrentTab();
        let loginButton = document.getElementById('login_button_popup');
        let signupButton = document.getElementById('signup_button');
        // Set event on login button
        loginButton.onclick = async (element) => {
          openLogin();
        };
        
        // Set event on signup button
        signupButton.onclick = (element) => {
          openSignup();
        };
      } catch (error) {
        return reject(error);
      }
      return resolve();
    }
  )
}

/**
 * Method to set current tab so that it can remember where to land after login/signup
 */
const setCurrentTab = () => {
  var query = { active: true, currentWindow: true };
  chrome.tabs.query(query, async (currentTab) => {
    if (currentTab.length > 0) {
      await chrome.storage.sync.set({leavingFrom: currentTab[0].id});
    }
  });
};

/**
 * Method to take users to collaboration space page
 */
const openSpaces = ({ usertoken = "", userid }) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url: `${host}/spaces/${userid}?usertoken=${usertoken}`, active: true}, (tabs) => {
      // chrome.extension.getBackgroundPage().console.log('New tab created!!', tabsMain[0].id);
    })
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}

const populateSpaces = ({ data: spaces }, globalCurrentSpace) => { 
  console.log("Global Current Space: ", globalCurrentSpace);
  const spacesSelection = $("#spaces_selection");
  if (globalCurrentSpace === -1) {
    spacesSelection.append(`<option value="-1" selected>My Space</option>`);
  } else {
    spacesSelection.append(`<option value="-1">My Space</option>`);
  }
  spaces.map(eachSpace => {
    const optionElement = document.createElement("option");
    optionElement.value = eachSpace.space_id;
    optionElement.selected = eachSpace.space_id === globalCurrentSpace ? true : false;
    optionElement.innerHTML = eachSpace.space_name;
    spacesSelection.append(optionElement);
  });
}


module.exports = {
  openLogin,
  openSignup,
  logout,
  hideShowLogin,
  registerLoginSignup,
  setCurrentTab,
  openSpaces,
  populateSpaces
};
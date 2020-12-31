(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
var host = 'http://127.0.0.1:3000';

/**
 * General method to handle error 
 */
const handleError = () => {
  return new Promise (
    async (resolve, reject) => {
      console.log('Faced an error');
      let loaderDiv = document.getElementById('loader_div');
      let scrollingUL = document.getElementById('highlight_list');
      if (loaderDiv != undefined) {
        loaderDiv.style.display = 'none';
      }
      if (scrollingUL != undefined) {
        scrollingUL.style.display = 'none';
      }
      document.getElementById('no_highlight_p').innerHTML = "Sorry, We ran into an error! :(";
      document.getElementById('no_highlight_div').style.display = 'flex';
      return resolve();
    }
  )
}

/**
 * Method to open tab from highlights
 */
const urlFromHighlight = (url) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url, active: true}, (tabs) => {
    });
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}

/**
 * Method to interact with back-end through APIs
 */

const useAPI = (objective = '', method = '', url = '', data = {}, accesstoken = '') => {
  return new Promise (
    async (resolve, reject) => {
      let paylod = {};
      if (objective == 'fetchHighlights' || objective == 'fetchSpaces') {
        if (method == 'GET') {
          let query = Object.keys(data)
             .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
             .join('&');
          url = url + query;
          console.log("Query: ", query);
          paylod = {
            method,
            headers: {
              'Content-Type': 'application/json',
              'authorization': `bearer ${accesstoken}`
            }
          }
        }
      } else if (objective == 'deleteHighlight') {
        if (method == 'DELETE') {
          paylod = {
            method,
            headers: {
              'Content-Type': 'application/json',
              'authorization': `bearer ${accesstoken}`
            },
            body: JSON.stringify(data)
          }
        }
      }
      fetch(url, paylod)
      .then(async (response) => {
        let resJson = await response.json();
        console.log('highlight status: ', resJson);
        if (resJson.status) {
          return resolve(resJson);
        } else {
          return reject();
        }
      })
      .catch(async (error) => {
        return reject(error);
      });
    }
  );
};

const deleteHighlight = () => {
  return new Promise (
    async (resolve, reject) => {

    }
  )
};

const copySelectedHtml = ({ parentUL, selectedHtmlElement }) => {
  parentUL.appendChild(selectedHtmlElement);
  selectedHtmlElement.select();
  document.execCommand("copy");
  parentUL.removeChild(selectedHtmlElement);
  $("#copy_toast_div").fadeIn(1800);
  $("#copy_toast_div").fadeOut(1800);

  // selectedHtmlElement.select();
  // // selectedHtmlElement.setSelectionRange(0, 99999);
  // document.execCommand('copy');
  console.log("Copied!!");
}

module.exports = {urlFromHighlight, useAPI, handleError, copySelectedHtml};
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
// This file is used to access the chrome extension popup
// All the html elements being accessed here are from popup.html
// chrome.extension.getBackgroundPage() can be used to get access of current page's console log
// Ex: chrome.extension.getBackgroundPage().console.log()
const beforeHighlight_popup = require('./beforeHighlight_popup/highlight.js');
const afterHighlight_popup = require('./afterHighlight_popup/highlight.js');
const beforeHighlight_background = require('../background/beforeHighlight/highlight.js');
var userDetails, scrollingUL, loaderDiv;
var anchorHighlight;
var host = 'http://127.0.0.1:3000';
var to_include = 0;
let globalCurrentSpace = -1;
let isScrolled = false;

/**
 * Method to map scrolling with pagination on get highlights API
 */
const scrolled = async () => {
    // //visible height + pixel scrolled = total height
    // await chrome.extension.getBackgroundPage().console.log('Scrolling');
    // await chrome.extension.getBackgroundPage().console.log(o.offsetHeight, o.scrollTop, o.scrollHeight);
    // if(o.offsetHeight + o.scrollTop == o.scrollHeight)
    // {
    //     await chrome.extension.getBackgroundPage().console.log('I am at the ends');
    //     alert("End");
    // }
    
}

/**
 * General method to handle error 
 */
const handleError = () => {
  return new Promise (
    async (resolve, reject) => {
      console.log('Faced an error');
      if (loaderDiv != undefined) {
        loaderDiv.style.display = 'none';
      }
      if (scrollingUL != undefined) {
        scrollingUL.style.display = 'none';
      }
      document.getElementById('no_highlight_p').innerHTML = "Sorry, We ran into an error! :(";
      document.getElementById('no_highlight_div').style.display = 'flex';
      return resolve();
    }
  )
}

/**
 * This mehtod is used to populate extension popup with user's highlights
 */

const populateHighlights =  (
  userInfo, 
  mainUL, 
  currentSpace = globalCurrentSpace, 
  searchInput = '', 
  fromScroll = false
) => {
  return new Promise (
    async (resolve, reject) => {
      chrome.storage.sync.get(['page'], async (data) => {
        // await chrome.extension.getBackgroundPage().console.log('Populating: ', to_include);
        try {
          var page = data.page;
          if (page == undefined) {
            page = 1;
            await chrome.storage.sync.set( {page: 1} , () => {});          
          }
          console.log('My page:: ', page);

          chrome.storage.sync.get('openPopup', async (data) => {
            try {
              var state = data.openPopup;
              console.log('My state:: ', state);
              let highlights = await afterHighlight_popup.useAPI('fetchHighlights'
                          ,'GET', `${host}/highlights?`, {
                            userid: userInfo.userData.id, 
                            type: 'popup',
                            page, 
                            to_include,
                            current_space: currentSpace,
                            search_input: searchInput
                          }, userInfo.userData.accesstoken); 
              if (highlights.data.length == 0 && page == 1) {
                loaderDiv.style.display = 'none';
                document.getElementById('no_highlight_div').style.display = 'flex';
              } else if (highlights.data.length > 0){
                await chrome.storage.sync.set( {page: page+1} , () => {});
                console.log('My highlights:: ', highlights);

                highlights.data.forEach(eachHighlight => {
                  let mainAnchor = document.createElement('a');
                  mainAnchor.classList.add('no_decoration');
                  mainAnchor.href = eachHighlight.url;
                  mainAnchor.onclick = () => {afterHighlight_popup.urlFromHighlight(eachHighlight.url)};

                  let UL = document.createElement('ul');
                  UL.classList.add('each_highlight');

                  let li0 = document.createElement('li');
                  li0.innerHTML = eachHighlight.highlight_name;

                  let li1 = document.createElement('li');
                  li1.innerHTML = eachHighlight.selected_html;
                  
                  let hiddenInput = document.createElement('input');
                  // hiddenInput.type = 'hidden';
                  hiddenInput.value = eachHighlight.selected_html;

                  let anchor = document.createElement('a');
                  anchor.href = eachHighlight.url;
                  anchor.innerHTML = eachHighlight.url_title;
                  anchor.onclick = () => {afterHighlight_popup.urlFromHighlight(eachHighlight.url)};

                  let li2 = document.createElement('li');

                  li2.appendChild(anchor);
                  UL.appendChild(li0);
                  UL.appendChild(li1);
                  UL.appendChild(li2);
                  [...UL.children].forEach((each) => {
                    each.style.backgroundColor = eachHighlight.highlight_color;
                  });

                  mainAnchor.appendChild(UL);
                  mainUL.appendChild(mainAnchor);
                 
                  let iElement = document.createElement('i');
                  iElement.classList.add('delete_sign');
                  iElement.classList.add('fas');
                  iElement.classList.add('fa-trash-alt');
                  iElement.onclick = () => {modalOperation(mainAnchor, iElement, eachHighlight.id, userInfo)};
                  mainUL.appendChild(iElement);

                  let copyElement = document.createElement('i');
                  copyElement.title = 'Copy Highlight!';
                  copyElement.classList.add('copy-sign');
                  copyElement.classList.add('fa');
                  copyElement.classList.add('fa-clipboard');
                  copyElement.onclick = () => {
                    afterHighlight_popup.copySelectedHtml({ 
                      parentUL: UL,
                      selectedHtmlElement: hiddenInput
                    })};
                  mainUL.appendChild(copyElement);
                });
                // mainUL.style.display = 'inline-block';
                if (!fromScroll) {
                  if (mainUL.style.display != 'none') {
                    mainUL.style.display = 'none';
                  }
                  $(mainUL).fadeIn(500);
                }
                mainUL.style.display = 'inline-block';
                loaderDiv.style.display = 'none';
              }
              return resolve();
            } catch(error) {
              console.log("Error::: ", error);
              await handleError();
              return reject(error);
            }
          });
        }
        catch(error) {
          console.log("Error::: ", error);
          await handleError();
        }
      });
    }
  )
}

const populateSpacesMain = (userInfo) => {
  return new Promise(
    async (resolve, reject) => {
      try {
        let spaces = await afterHighlight_popup.useAPI('fetchSpaces'
        ,'GET', `${host}/spaces/all/api?`, {
          userid: userInfo.userData.id,
        }, userInfo.userData.accesstoken);
        beforeHighlight_popup.populateSpaces(spaces, globalCurrentSpace);
        return resolve();
      } catch(error) {
        console.log("Error: ", error);
        await handleError();
        return reject(error);
      }
    }
  );
}

const changingHighlightList = () => {
  const highlighList = $("#highlight_list");
  const loaderDiv = $("#loader_div");
  highlighList.unbind('scroll');
  highlighList.empty();
  loaderDiv.show();
}

const registerSelectOptionChange = ({ userDetails, scrollingUL }) => {
  console.log(userDetails);
  const spacesSelection = $("#spaces_selection");
  spacesSelection.change(async function() {
    globalCurrentSpace = $(this).val();
    await chrome.storage.sync.set({ currentSpace: $(this).val() });
    changingHighlightList();
    await setOpenPage();
    await populateHighlights(userDetails, scrollingUL);
    bindHighlightListScroll({});
  })
}

/**
 * Method to set that popup was open
 */
const setOpenPage = () => {
  return new Promise (
    async (resolve, reject) => {
      await chrome.storage.sync.set({ openPopup: true });
      await chrome.storage.sync.set({ page: 1 });
      return resolve();
    }
  )
}

const bindHighlightListScroll = ({ searchInputText = '' }) => {
  $('#highlight_list').bind('scroll', async () => {
    if($('#highlight_list').scrollTop() + $('#highlight_list').innerHeight()>=($('#highlight_list')[0].scrollHeight-0.4))
    {
      if (userDetails != undefined && scrollingUL != undefined) {
        await populateHighlights(userDetails, scrollingUL, globalCurrentSpace, searchInputText, true);
      }
    }
  })
}

$(document).ready(async () => {
  bindHighlightListScroll({});
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    afterHighlight_popup.to_include = 0;
    await setOpenPage();
    let beforeLogin = document.getElementById('before_login');
    let afterLogin = document.getElementById('after_login');  

    // A method to check whether user is logged in or not
    let isUserLoggedIn = await beforeHighlight_background.userLoggedIn();
    
    if (isUserLoggedIn.isLoggedIn) {
      try {
        beforeHighlight_popup.setCurrentTab();
        scrolled();
        // Make loader visible
        loaderDiv = document.getElementById('loader_div');
        loaderDiv.style.display = 'inline-block';
        scrollingUL = document.getElementById('highlight_list');
        scrollingUL.style.display = 'none';

        // Make "afterLogin" part visible from popup.html if user is already logged in
        afterLogin.style.display = 'block';

        
        // scrollingUL.onscroll = scrolled(scrollingUL);
        const logoutButton = document.getElementById('logout_button');
        const spacesButton = document.getElementById('spaces_button');

        // Set user details
        userDetails = isUserLoggedIn;

        // Set event on logout button
        logoutButton.onclick = (element) => {
          beforeHighlight_popup.logout();
          beforeHighlight_popup.hideShowLogin('logout', {beforeLogin, afterLogin});
        };

        // Open /spaces for particular user when spaces button is clicked
        spacesButton.onclick = () => {
          if (userDetails.isLoggedIn) {
            beforeHighlight_popup.openSpaces({ userid: userDetails.userData.id, usertoken: userDetails.userData.accesstoken });
          }
        }
        // Populate highlights for user
        chrome.storage.sync.get('currentSpace', async (data) => {
          globalCurrentSpace = data.currentSpace || -1;
          console.log(globalCurrentSpace);
          await populateHighlights(isUserLoggedIn,scrollingUL);
          await populateSpacesMain(userDetails);
          registerSelectOptionChange({ userDetails, scrollingUL });
        });

        // Register onchange event listener with search input tag
        const searchInput = $('#search_input');
        searchInput.keypress(async function(e) {
          const keycode = (e.keyCode ? e.keyCode : e.which);
          if(keycode == '13'){
            const searchInputText = $(this).val();
            changingHighlightList();
            await setOpenPage();
            await populateHighlights(userDetails, scrollingUL, undefined, searchInputText);
            bindHighlightListScroll({ searchInputText });
          }
        });

        const closeSearchSign = $('#close_search_sign');
        closeSearchSign.on('click', async function(e) {
          $(searchInput).val('');
          $(searchInput).blur();
          changingHighlightList();
          await setOpenPage();
          await populateHighlights(userDetails, scrollingUL);
          bindHighlightListScroll({});
        });
      } catch(error) {
        console.log(error);
        await handleError();
      }
    } else {
      try {
        await chrome.extension.getBackgroundPage().console.log('I am NOT already logged IN', beforeLogin.style.display);    
      
        // Make "beforeLogin" part visible from popup.html if user is NOT logged in
        beforeLogin.style.display = 'block';

        await beforeHighlight_popup.registerLoginSignup();
      } catch(error) {
        console.log(error);
        await handleError();
      }
    }
  } catch(error) {
    // await chrome.extension.getBackgroundPage().console.log('Faced an error on top level');
  }
});

const modalOperation = (mainAnchor, iElement, highlighterid,userInfo) => {
  // Get the modal
  var modal = document.getElementById('myModal');

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName('close')[0];

  var yes_delete = document.getElementById('yes_delete');
  var no_delete = document.getElementById('no_delete');

  // When the user clicks the delete button, open the modal 
  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
  span.onclick = () => {
    modal.style.display = 'none';
  };

  yes_delete.onclick = async () => {
    try {
      to_include += 1;
      await chrome.extension.getBackgroundPage().console.log('Yes clicked: ', to_include);
      await afterHighlight_popup.useAPI('deleteHighlight'
                          ,'DELETE', `${host}/highlights/`, {highlighterid, userid: userInfo.userData.id}, userInfo.userData.accesstoken);
      // Convert delete sign i element to jquery object to use remove object!
      var jqueryObj = $(iElement);
      jqueryObj.remove();

      mainAnchor.innerHTML = '';
      modal.style.display = 'none';
    } catch(error) {
      console.log(error);
      await handleError();
    }
  };

  no_delete.onclick = () => {
    modal.style.display = 'none';
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
};

module.exports = {handleError};
},{"../background/beforeHighlight/highlight.js":1,"./afterHighlight_popup/highlight.js":2,"./beforeHighlight_popup/highlight.js":3}]},{},[4]);

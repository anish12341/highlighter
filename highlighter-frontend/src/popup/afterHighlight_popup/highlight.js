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

  module.exports = {urlFromHighlight};
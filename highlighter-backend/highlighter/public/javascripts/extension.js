const passToExtension = async (userData) => {
  console.log('I am in extension file', userData);
  chrome.runtime.sendMessage('mdffcdfacogbaacgmjhnidlmogmkejdj',{'message':'userData','data': userData});
}
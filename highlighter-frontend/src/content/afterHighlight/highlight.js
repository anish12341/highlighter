// Get element from xPath stored before
const getElementByXpath = (path) => {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

/**
 * This method does the work of actually highlighting selected text and changing it's color
 */
const highlight = (path, selectedText) => {
  let element = getElementByXpath(path);
  let innerContent = element.innerHTML;
  innerContent = innerContent.replace(/\n/g, "");
  innerContent = innerContent.replace(/\s\s/g,' ');
  selectedText = selectedText.replace(/\n/g, "");
  selectedText = selectedText.replace(/\s\s/g,' ');
  let index = innerContent.indexOf(selectedText);
  console.log('Index::', index);
  if (index >= 0) {
    innerContent = innerContent.substring(0,index) + "<span style='background-color: yellow;'>" + innerContent.substring(index,index+selectedText.length) + "</span>" + innerContent.substring(index + selectedText.length);
    element.innerHTML = innerContent;
  }
}

module.exports = {highlight};

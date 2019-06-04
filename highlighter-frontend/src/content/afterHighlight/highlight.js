// Get element from xPath stored before
const getElementByXpath = (path) => {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

const highlight = (path, selectedText) => {
  // let elementArray = document.getElementsByTagName('p');
  let element = getElementByXpath(path);
  console.log('Current element::', element, element.textContent);
  let innerContent = element.innerHTML;
  innerContent = innerContent.replace(/\n/g, "");
  innerContent = innerContent.replace(/\s\s/g,' ');
  // console.log('Whole P::', eachElement);
  selectedText = selectedText.replace(/\n/g, "");
  selectedText = selectedText.replace(/\s\s/g,' ');
  let index = innerContent.indexOf(selectedText);
  console.log('Index::', index);
  if (index >= 0) {
    // console.log('Matched::', eachElement);      
    innerContent = innerContent.substring(0,index) + "<span style='background-color: yellow;'>" + innerContent.substring(index,index+selectedText.length) + "</span>" + innerContent.substring(index + selectedText.length);
    element.innerHTML = innerContent;
  }
}

module.exports = {highlight};

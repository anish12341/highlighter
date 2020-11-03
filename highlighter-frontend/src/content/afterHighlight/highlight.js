// Get element from xPath stored before
const getElementByXpath = (path) => {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

/**
 * Transfer the whole HTML using temporary div element
 */
const transferHTML = (element) => {
  let tempEle = element.cloneNode(true);
  let tempDiv = document.createElement('div');
  tempDiv.appendChild(tempEle);
  // console.log("Temp dev: ", tinnerHTML);
  return tempDiv.innerHTML;
};

/**
 * Register onclick for remaining highlights in the target after deleting
 */
const reregisterOnClick = (parentNode) => {
  parentNode.childNodes.forEach(each => {
    if (each.dataset && each.dataset.highlight) {
      each.onclick = () => {highlightClicked(each)};
    }
  })
}

/**
 * Delete span element after deleting highlight
 */
const eliminateSpan = (spanElement, highlightid) => {
  // console.log("Span: ", spanElement.innerHTML, spanElement.dataset.highlightid, spanElement.dataset.highlight, highlightid);
  let parent = spanElement.parentNode;
  console.log("Child count: ", parent.childNodes.length);
  let parentHTML = '';
  parent.childNodes.forEach(element => {
    console.log("inner: ", element.data, element.innerHTML, element.tagName);
    if (element.dataset && element.dataset.highlight) {
      console.log("IN HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
      if (element.dataset.highlightid == highlightid) {
        parentHTML += element.innerHTML;
      } else {
        console.log("I am another");
        parentHTML += transferHTML(element);
        element.onclick = () => highlightClicked(element);
      }
    } else if (element.tagName != undefined) {
      parentHTML += transferHTML(element);
    } else {
      parentHTML += element.data;
    }
  });
  console.log("Parent html: ", parentHTML);
  parent.innerHTML = parentHTML;
  reregisterOnClick(parent);
}

/**
 * Method to eliminate delete dialog box above a highlight
 */
const eliminateDelete = (de, d, element) => {
  de.remove();
  d.remove();
  element.style.border = '0px';
}

/**
 * Method to do something when highlighted text is clicked!
 */
const highlightClicked = (element) => {
  console.log(typeof element, element.style);
  element.style.border = '1px solid #111111';
  element.style.cursor = 'pointer';
  var rect = element.getBoundingClientRect();
  var bodyRect = document.body.getBoundingClientRect();
  console.log(rect.top, rect.right, rect.bottom, rect.left);
  console.log(rect.top - bodyRect.top); 
  console.log("Highlight clicked!");

  var d = document.createElement('div');
  d.style.width = '70px';
  d.style.height = '35px';
  d.style.backgroundColor = 'black';
  d.style.position = 'fixed';
  d.style.left = (rect.left)+'px';
  d.style.top = (rect.top-51)+'px';
  d.style.display = 'flex';
  d.style.alignItems = 'center';
  d.style.justifyContent = 'center';
  d.style.zIndex = 10;
  d.style.borderWidth = '2px';
  d.style.borderRadius = '5px';
  document.body.appendChild(d);

  // Delete button inside d
  let deleteButton = document.createElement('button');
  deleteButton.id = 'deleteHighlight';
  deleteButton.style.height = '60%';
  deleteButton.style.width = 'auto';
  deleteButton.style.backgroundColor = '#ffff4d';
  deleteButton.style.borderRadius = '5px';
  deleteButton.style.color = '#000000';
  deleteButton.style.fontFamily = 'monospace';
  deleteButton.onmouseover = () => {
    deleteButton.style.color = 'white';
    deleteButton.style.backgroundColor = 'black';
  }
  deleteButton.onmouseout = () => {
    deleteButton.style.color = '#000000';
    deleteButton.style.backgroundColor = '#ffff4d';
  }
  deleteButton.innerHTML = 'Delete?';


  var de = document.createElement('div');
  de.style.width = '0px';
  de.style.height = '0px';
  de.style.position = 'fixed';
  de.style.left = (rect.left)+'px';
  de.style.top = (rect.top-21)+'px';
  de.style.borderLeft = '10px solid transparent';
  de.style.borderRight = '10px solid transparent';
  de.style.borderTop = '20px solid black';
  document.body.appendChild(de);

  document.addEventListener('scroll',(event) => {
    eliminateDelete(de, d, element);
  });

  document.addEventListener('mousedown',(event) => {
    if (event.target != deleteButton) {
      eliminateDelete(de, d, element);
    }
  });

  document.addEventListener('keydown',(event) => {
    eliminateDelete(de, d, element);
  });

  deleteButton.onclick = () => {
    chrome.runtime.sendMessage({'message':'getUser'}, (user) => {
      chrome.runtime.sendMessage({'message':'deleteHighlight', 'highlighterid': element.dataset.highlightid, user}, (response) => {
        eliminateDelete(de, d, element);
        eliminateSpan(element, element.dataset.highlightid);
      });
    });
  }
  d.appendChild(deleteButton);
}
/**
 * This method does the work of actually highlighting selected text and changing it's color
 */
const highlight = (path, selectedText, highlightid = undefined) => {
  let element = getElementByXpath(path);
  let innerContent = element.innerHTML;
  innerContent = innerContent.replace(/\n/g, "");
  innerContent = innerContent.replace(/\s\s/g,' ');
  selectedText = selectedText.replace(/\n/g, "");
  selectedText = selectedText.replace(/\s\s/g,' ');
  let index = innerContent.indexOf(selectedText);
  console.log('Index::', index);
  if (index >= 0) {
    let spanString = innerContent.substring(index,index+selectedText.length);
    let spanElement = document.createElement('span');
    spanElement.innerHTML = spanString;
    spanElement.style.backgroundColor = 'yellow';
    spanElement.dataset.highlight = true;
    spanElement.dataset.highlightid = highlightid;

    let wrapper = document.createElement('div');
    wrapper.appendChild(spanElement);

    innerContent = innerContent.substring(0,index) + wrapper.innerHTML + innerContent.substring(index + selectedText.length);
    element.innerHTML = innerContent;
    element.childNodes.forEach(element => {
      if (element.dataset && element.dataset.highlight) {
        element.onclick = () => {highlightClicked(element)};
      }
    });
  }
}

module.exports = {highlight, getElementByXpath};

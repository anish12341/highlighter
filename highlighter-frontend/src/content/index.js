/**
 * What are content scripts??
 * A content script is “a JavaScript file that runs in the context of web pages.” 
 * This means that a content script can interact with web pages that the browser visits.
 * Whenever I want to interact with the web page content scripts are used.
 */
const beforeHighlight = require('./beforeHighlight/highlight.js');
const afterHighlight = require('./afterHighlight/highlight.js');

let flag = 0;
let isDivThere = false;
let colorPickerValue = "#ffff4d"
let tempSpanElement;

/**
 * When page loads get all the highlights for that page
 */
window.addEventListener('load',(event) => {
  chrome.runtime.sendMessage({'message':'getUser'}, (userDetails) => {
    if (userDetails.isLoggedIn) {
      chrome.runtime.sendMessage({'message':'getHighlight', 'userid': userDetails.userData.id, 'accesstoken': userDetails.userData.accesstoken}, (highlights) => {
        if (highlights.success) {
          highlights.data.forEach(each => {
            console.log(each);
            afterHighlight.highlight(each.xpath, each.selected_html, each.id, each.highlight_color, each.highlight_color);
          });
        }
      });
    }
  });
})

/**
 * Check whether the selected element contains another highlight
 */
const anotherHighlight = (selectedHTML) => {
  let element = document.createElement('div');
  element.innerHTML = selectedHTML;
  for (let i = 0; i < element.childNodes.length; i++) {
    console.log(element.childNodes[i].dataset);
    if (element.childNodes[i].dataset && element.childNodes[i].dataset.highlight) {
      return false;
    }
  }
  return true;
};

/**
 * This listener is used when user stops dragging the mouse and mouse is up
 */
document.addEventListener('mouseup', (event) =>
{ 
  if (event.target.id !== "color_picker") {
    // Get selection which user just selected
    let sel = window.getSelection().toString();
    let sel2 = window.getSelection();
    let selectedHTML;

    // Rangecount is used to check whether user selected anything or not.
    if (sel2.rangeCount) {
        // Creating temporary div and putting selected html as innerHTML of that div
        let container = document.createElement("div");
        container.id = 'temp_div_html';
        for (let i = 0, len = sel2.rangeCount; i < len; ++i) {
            container.appendChild(sel2.getRangeAt(i).cloneContents());
        }
        selectedHTML = container.innerHTML;
    }
    
    /**To check if selected text is overlapping multiple DOM elements and other conditions like if "Highlight Me!"..
     * div is already there
    */
    if (flag === 1 && sel && sel.length > 0 && !isDivThere && 
      !(beforeHighlight.extraTerminatingConditions(event.path && event.path.length > 0 ? event.path[0] : {}, selectedHTML))) {
      
      // Get xPath of the element so that it can be identified later on
      let xPath = beforeHighlight.getPathInitial(event);
      
      // Check whether the element contains another highlight
      if (anotherHighlight(selectedHTML)) {
        // Preparing a div so that it can be displayed as "Highlight Me!"
        let divSkeleton = document.createElement("DIV");
        const {
          object: decisionDiv,
          inputName,
          triangleDiv,
          emptyMessageDiv
        } = getDivConfiguration(divSkeleton, event);
        document.body.appendChild(decisionDiv);
        isDivThere = true;

        beforeHighlight.tempHighlight({ path: xPath, selectedText: selectedHTML });
        tempSpanElement = document.getElementById("temp_highlighter_span");

        const highlightButton = decisionDiv.querySelector("#highlightme");
        highlightButton.onclick = (() => {
          if (inputName.value === '') {
            fadeIn(triangleDiv, 300);
            fadeIn(emptyMessageDiv, 300);
          } else {
            beforeHighlight.onHighlightClick({ 
              decisionDiv, 
              xPath,
              selectedHTML, 
              colorPickerValue,
              highlightName: inputName.value,
              tempSpanElement
            });
          }
        });

        inputName.addEventListener('keydown', (e) => {
          if (e.target.value === '') {
            fadeIn(triangleDiv, 300);
            fadeIn(emptyMessageDiv, 300);
          } else {
            triangleDiv.style.display = 'none';
            emptyMessageDiv.style.display = 'none';
          }
        });
      }
    }
  }
});


/** This listener is used when user clicks on any other part of the web page so that I can delete already popped
 * up div which says "Highlight Me!"
 * */ 
document.addEventListener('mousedown', async (event) =>
{    
  // await checkPopup();
  flag = 0;
  if (isDivThere && event.target && 
    event.target.id != 'highlightme' && event.target.id != 'color_picker'
    && event.target.id != 'input_highlight_name' && event.target.id != 'input_highlight_name_div') {
    let highlightDiv = document.getElementById('decision-popup');
    if (highlightDiv != undefined) {
      highlightDiv.remove();
      if (tempSpanElement) {
        beforeHighlight.resetTempSpan(tempSpanElement);
      }
    }
    isDivThere = false;
  }
});

/** A listener to detect the drag of a mouse */
document.addEventListener('mousemove', (event) =>
{
  flag = 1;
});

const fadeIn = (el, time) => {
  el.style.display = 'block';
  el.style.opacity = 0;

  var last = +new Date();
  var tick = function() {
    el.style.opacity = +el.style.opacity + (new Date() - last) / time;
    last = +new Date();

    if (+el.style.opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    }
  };

  tick();
}

const createHighlightButton = () => {
  const highlightButton = document.createElement("button");
  highlightButton.id = "highlightme";
  Object.assign(highlightButton.style, {
    height:"30px",
    width:"100px",
    backgroundColor:"#ffff4d",
    borderRadius:"5px",
    color:"#000000",
    fontFamily:"monospace",
    fontSize: "9px",
    fontWeight: "bold",
    marginLeft: '10px',
    cursor: "pointer"
  });

  highlightButton.onmouseover = function() {
    this.style.color = "white";
    this.style.backgroundColor = "black";
  }

  highlightButton.onmouseout = function() {
    this.style.color = "#000000";
    this.style.backgroundColor = colorPickerValue;
  }
  highlightButton.innerHTML = "Highlight Me!";
  return highlightButton;
}

const createColorDropbox = ({ highlightButton }) => {
  const colorDropbox = document.createElement("select");
  colorDropbox.id = "color_picker";
  Object.assign(colorDropbox.style, {
    marginLeft: '10px',
    marginRight: '10px',
    padding: '0',
    cursor: 'pointer',
    width: '70px',
    height: '30px',
    backgroundColor: 'white',
    fontFamily: 'monospace',
    fontSize: '11.5px',
    borderRadius: '5px'
  });

  const yellowOption = document.createElement("option");
  yellowOption.innerHTML = "yellow";
  yellowOption.value = "#ffff4d";
  yellowOption.checked = true;

  const purpleOption = document.createElement("option");
  purpleOption.innerHTML = "purple";
  purpleOption.value = "#cd4dff";

  const neonOption = document.createElement("option");
  neonOption.innerHTML = "Neon";
  neonOption.value = "#65ff4d";

  colorDropbox.append(yellowOption);
  [yellowOption, purpleOption, neonOption].forEach((eachOption) => {
    colorDropbox.append(eachOption);
  });

  colorDropbox.onchange = function() {
    colorPickerValue = this.value;
    highlightButton.style.backgroundColor = this.value;
    if (tempSpanElement) {
      tempSpanElement.style.backgroundColor = this.value;
    }
  }

  return colorDropbox;
}

const createHighlightNameInput = () => {
  const inputNameDiv = document.createElement('div');
  inputNameDiv.id = 'input_highlight_name_div';
  Object.assign(inputNameDiv.style, {
    width: '120px',
    height: '30px',
    marginLeft: '10px',
    fontSize: '0'
  });

  const inputName = document.createElement('input');
  inputName.type = 'text';
  inputName.id = 'input_highlight_name';
  inputName.placeholder = 'Give name!';
  inputName.maxLength = '40';
  Object.assign(inputName.style, {
    width: 'inherit',
    height: 'inherit',
    borderRadius: '5px',
    fontFamily: 'monospace',
    fontSize: '15px',
    padding: '0',
    margin: '0'
  });

  inputNameDiv.appendChild(inputName);
  return {inputNameDiv, inputName};
}

const createNameMessageDiv = () => {
  const triangleDiv = document.createElement('div');
  triangleDiv.id = "triangle_div";
  Object.assign(triangleDiv.style, {
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: '13px solid #f9fad4',
    position: 'absolute',
    top: '44px',
    left: '10px',
    display: 'none'
  });

  const emptyMessageDiv = document.createElement('div');
  emptyMessageDiv.id = "empty_message_div";
  emptyMessageDiv.innerHTML = "Name required!";
  Object.assign(emptyMessageDiv.style, {
    width: 'fit-content',
    height: '30px',
    position: 'absolute',
    borderRadius: '5px',
    top: '53px',
    left: '10px',
    backgroundColor: '#f9fad4',
    color: 'black',
    fontSize: '13px',
    paddingLeft: '4px',
    paddingRight: '4px',
    display: 'none'
  });

  return { triangleDiv, emptyMessageDiv };
}

const getDivConfiguration = (object, event) => {
  let style = {
    position: "absolute",
    left: `${event.pageX}px`,
    top: `${event.pageY}px`,
    zIndex: 10,
    height: '60px',
    width: 'auto',
    backgroundColor: '#000000',
    borderColor: '#ff0000' ,
    borderWidth: '2px',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
  object.id = 'decision-popup';
  for (var key in object.style) {
    if (style.hasOwnProperty(key)) {
      object.style[key] = style[key];
    }
  };

  const {triangleDiv, emptyMessageDiv} = createNameMessageDiv();
  const {inputNameDiv, inputName} = createHighlightNameInput();
  const highlightButton = createHighlightButton();
  const colorPicker = createColorDropbox({ highlightButton });

  object.appendChild(inputNameDiv);
  object.appendChild(highlightButton);
  object.appendChild(colorPicker);
  object.appendChild(triangleDiv);
  object.appendChild(emptyMessageDiv);
  
  return {object, inputName, triangleDiv, emptyMessageDiv};
};


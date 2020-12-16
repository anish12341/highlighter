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
        let decisionDiv = document.createElement("DIV");
        decisionDiv = getDivConfiguration(decisionDiv, event);
        document.body.appendChild(decisionDiv);
        isDivThere = true;
        const highlightButton = decisionDiv.querySelector("#highlightme")
        highlightButton.onclick = (() => {
          beforeHighlight.onHighlightClick({ decisionDiv, xPath, selectedHTML, colorPickerValue });
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
    event.target.id != 'highlightme' && event.target.id != 'color_picker') {
    let highlightDiv = document.getElementById('decision-popup');
    if (highlightDiv != undefined) {
      highlightDiv.remove();
    }
    isDivThere = false;
  }
});

/** A listener to detect the drag of a mouse */
document.addEventListener('mousemove', (event) =>
{
  flag = 1;
});

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
    fontSize: '11.5px'
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
  }

  return colorDropbox;
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
  console.log("I am here!")
  const highlightButton = createHighlightButton();
  object.appendChild(highlightButton);
  object.appendChild(createColorDropbox({ highlightButton }));
  return object;
};


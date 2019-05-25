let flag = 0;
let isDivThere = false;
document.addEventListener('mouseup',function(event)
{   
  if (flag === 1) {
    console.log("EVENT IN MOVE::", event);
    let sel = window.getSelection().toString();
    console.log("I am in here at content");
    let decisionDiv = document.createElement("DIV");
    decisionDiv = getDivConfiguration(decisionDiv, event);
    console.log("Object style second::", decisionDiv.style.left);    
    document.body.appendChild(decisionDiv);
    isDivThere = true;
    if(sel.length)
        chrome.runtime.sendMessage({'message':'setText','data': sel},function(response){})
  } else {
    console.log("In mouse down");      
  }
})

document.addEventListener('mousedown',function(event)
{    
  console.log("In mouse down");
  flag = 0;
  if (isDivThere) {
    console.log('Deleting now');
    document.getElementById('decision-popup').remove();
    isDivThere = false;
  }
})

document.addEventListener('mousemove',function(event)
{
  console.log("In mouse move");  
  flag = 1;
})

const getDivConfiguration = (object, event) => {
  let style = {
    position: "absolute",
    left: `${event.pageX}px`,
    top: `${event.pageY}px`,
    zIndex: 10
  };
  object.id = 'decision-popup';
  for (var key in object.style) {
    if (style.hasOwnProperty(key)) {
      object.style[key] = style[key];
    }
  };
  object.innerHTML = "I AM DIV";
  console.log("Object style::", object.style.left);
  return object;
}
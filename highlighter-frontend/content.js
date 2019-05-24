document.addEventListener('mouseup',function(event)
{
    var sel = window.getSelection().toString();
    console.log("I am in here at content");
    if(sel.length)
        chrome.runtime.sendMessage({'message':'setText','data': sel},function(response){})
})
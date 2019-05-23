document.addEventListener('mouseup',function(event)
{
    var sel = window.getSelection().toString();
     
    if(sel.length)
        chrome.runtime.sendMessage({'message':'setText','data': sel},function(response){})
})
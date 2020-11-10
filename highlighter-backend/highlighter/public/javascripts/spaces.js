document.addEventListener("DOMContentLoaded", function(){
  const createSpaceButton = document.getElementById("create_space");
  createSpaceButton.onclick = (() => {
    const modal = document.getElementById("myModal");
    modal.style.display = "block";
  });
});
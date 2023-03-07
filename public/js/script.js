const searchBox = document.getElementById("headerSearchBox");
const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");
const sideBar = document.getElementById("sideBar");
const overlay = document.getElementById("overlay");
const songsContainer = document.getElementById("songsContainer");

openMenu.addEventListener("click", function () {
  sideBar.classList.toggle("closed");
  overlay.classList.add("show");
});

closeMenu.addEventListener("click", function () {
  sideBar.classList.toggle("closed");
  overlay.classList.remove("show");
});

overlay.addEventListener("click", function () {
  sideBar.classList.add("closed");
  overlay.classList.remove("show");
});

function addSearchBoxLight() {
  searchBox.classList.add("addLight");
}

function removeSearchBoxLight() {
  searchBox.classList.remove("addLight");
}

// songsContainer.addEventListener('click', function(e) {
//     if(e.target.classList.contains('song-like')){
//         e.target.classList.toggle('liked');
//     }
// })

//* index.ejs slider -------------->

// $(document).ready(function () {
//   $("#autoWidth").lightSlider({
//     autoWidth: true,
//     loop: true,
//     onSliderLoad: function () {
//       $("#autoWidth").removeClass("cS-hidden");
//     },
//   });
// });

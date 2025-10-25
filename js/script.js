window.onresize = function () {
  if (screen.width > 991) {
    //location.reload();
    $(".splide__arrow--next").click();
  }
};

let mySplide = new Splide(".splide2", {
  // Desktop on down
  perPage: 1,
  perMove: 1,
  direction: "ttb",
  autoHeight: true,
  height: "100vh",
  focus: "center",
  type: "loop", // 'loop' or 'slide'
  arrows: true, // 'slider' or false
  pagination: false, // 'slider' or false
  speed: 600, // transition speed in miliseconds
  dragAngleThreshold: 60, // default is 30
  waitForTransition: true,
  updateOnMove: true,
  breakpoints: {
    991: {
      // Tablet
      focus: 0,
    },
    767: {
      // Mobile Landscape
      focus: 0,
    },
    479: {
      // Mobile Portrait
      focus: 0,
    },
  },
}).mount();

function slideChange() {
  let activeSlide = $(".splide__slide.is-active:not(.splide__slide--clone)");
  // Change background color
  let myColor = activeSlide.find(".color").css("background-color");
  $(".section.hero").css("background-color", myColor);
  // Replace button link
  let mainLink = activeSlide.find(".link1").eq(0).attr("href");
  $(".button.is--hero").eq(0).attr("href", mainLink);
  // Text Animation
  // Slide down
  $(".hero_text").eq(1).addClass("is--move");
  setTimeout(() => {
    $(".hero_text").eq(0).addClass("is--move");
  }, 100);
  // Replace text
  setTimeout(() => {
    $(".hero_text").eq(1).text(activeSlide.find(".text2").text());
  }, 300);
  setTimeout(() => {
    $(".hero_text").eq(0).text(activeSlide.find(".text1").text());
  }, 400);
  // Slide up
  setTimeout(() => {
    $(".hero_text").eq(1).removeClass("is--move");
  }, 400);
  setTimeout(() => {
    $(".hero_text").eq(0).removeClass("is--move");
  }, 500);
}

mySplide.on("move", function () {
  slideChange();
});
slideChange();

// Arrow clicks
$(".arrow.next").click(function () {
  $(".splide__arrow--next").click();
});
$(".arrow.prev").click(function () {
  $(".splide__arrow--prev").click();
});

// Move slider on scroll
let running = false;
document.addEventListener("mousewheel", function (event) {
  if (window.innerWidth > 991) {
    if (running == false) {
      running = true;
      if (event.wheelDelta >= 0) {
        $(".arrow.prev").click();
      } else {
        $(".arrow.next").click();
      }
      setTimeout(() => {
        running = false;
      }, 1500);
    }
  }
});

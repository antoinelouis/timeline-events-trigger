//= require 'smooth-scroll/dist/js/smooth-scroll'

import TimelineEventsTrigger from "./timeline-events-trigger.js";

window.onload = function() { 

  const timeline = new TimelineEventsTrigger();
  var clickTarget = document.querySelector('.btn');

  clickTarget.addEventListener('click', function(e){
    e.preventDefault();
    e.target.innerHTML += " clicked";
  })

  timeline.addKey("scroll", 1000, {
    scrollTo: 100,
    duration: 1500
  })

  timeline.addKey("hover", 3500, {
    target: clickTarget,
    duration: 1000
  })

  timeline.addKey("leave", 4000)

  if (window.confirm("Trigger events sequence?")) { 
    timeline.executeTimeline();
  }

};


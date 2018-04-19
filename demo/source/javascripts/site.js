//= require 'smooth-scroll/dist/js/smooth-scroll'

document.addEventListener("DOMContentLoaded", function(event) { 
  const timeline = new TimelineEventsTrigger;
  var clickTarget = document.querySelector('.btn');

  clickTarget.addEventListener('click', function(e){
    e.preventDefault();
    console.log('click');
    e.target.innerHTML += " clicked";
  })

  timeline.addKey("click", 4000, {
    target: clickTarget,
    duration: 1000
  })

  timeline.addKey("scroll", 2000, {
    scrollTo: 400,
    duration: 4000
  })

  if (window.confirm("Trigger events sequence?")) { 
    console.log('trigger events');
    timeline.executeTimeline();
  }
});








/* TET LIBRARY */

const TimelineEventsTrigger = function(){
  this.keys = [];
};


// Turn keys into embed objects 😯
TimelineEventsTrigger.prototype.Key = function(eventType, delay, options) {
  this.eventType = eventType;
  this.delay = delay || 1000;
  this.options = options || {};
};

TimelineEventsTrigger.prototype.addKey = function(eventType, delay, options) {
  this.keys[this.keys.length] = new this.Key(eventType, delay, options);
};

TimelineEventsTrigger.prototype.executeTimeline = function(i){
  var i = i || 0;
  if (i >= this.keys.length) return;
  this.keys[i].executeKey(this, i+1);
};

TimelineEventsTrigger.prototype.Key.prototype.executeKey = function(cb, index){
  var eventtype = this.eventType;
  var options = this.options;
  window.setTimeout(function(){
    console.log(eventtype);
    switch (eventtype){
      case 'click':
        var newEvent =  new MouseEvent("click", {
          bubbles: true,
          cancelable: false,
          view: window
        });
        options.target.dispatchEvent(newEvent);
        break;
      case 'scroll':
        var scroll = new SmoothScroll();
        scroll.animateScroll( options.scrollTo, null, {speed: options.duration});
        break;
    }
    cb.executeTimeline(index);
  }, this.delay)
};
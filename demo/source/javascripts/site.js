// This is where it all goes :)


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
    duration: 1000
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


// Turn keys into objects 😯
TimelineEventsTrigger.prototype.Key = function(eventType, duration, options) {
  this.eventType = eventType;
  this.duration = duration || 1000;
  this.options = options || {};
};

TimelineEventsTrigger.prototype.addKey = function(eventType, duration, options) {
  this.keys[this.keys.length] = new this.Key(eventType, duration, options);
};

TimelineEventsTrigger.prototype.executeTimeline = function(i){
  console.log('execute sequences');
  console.dir(this);
  console.log(this.keys.length);
  var i = i || 0;
  if (i >= this.keys.length) return;
  this.keys[i].executeKey(this, i+1);
};

TimelineEventsTrigger.prototype.Key.prototype.executeKey = function(cb, index){
  console.log('executeKey');
  console.log(this.eventType);
  window.setTimeout(function(){
    cb.executeTimeline(index);
  }, this.duration)
};
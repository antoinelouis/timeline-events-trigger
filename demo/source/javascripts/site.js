//= require 'smooth-scroll/dist/js/smooth-scroll'
//= require 'easing.js'

document.addEventListener("DOMContentLoaded", function(event) { 

  const timeline = new TimelineEventsTrigger;
  var clickTarget = document.querySelector('.btn');

  clickTarget.addEventListener('click', function(e){
    e.preventDefault();
    e.target.innerHTML += " clicked";
  })


  timeline.addKey("scroll", 1000, {
    scrollTo: 100,
    duration: 500
  })

  timeline.addKey("hover", 3000, {
    target: clickTarget
  })

  timeline.addKey("leave", 1000)

  if (window.confirm("Trigger events sequence?")) { 
    timeline.executeTimeline();
  }
});


/* TET LIBRARY */

const TimelineEventsTrigger = function(){
  this.keys = [];
  this.styles = this.storeHoverStyle();
  this.cursor = document.createElement('DIV');
  this.cursor.id = "timelinecursor";
  document.body.appendChild(this.cursor); 
};


// Turn keys into embed objects 😯
TimelineEventsTrigger.prototype.Key = function(eventType, delay, options, parent) {
  this.eventType = eventType;
  this.delay = delay || 1000;
  this.options = options || {};
  this.parent = parent;
};

TimelineEventsTrigger.prototype.moveMouse = function(x, y, t) {
  console.log(this);
  console.log(x);
  console.log(y);
  var self = this;
  var start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = Math.min((timestamp - start) / t, 1);
    console.log(progress);
    self.cursor.style.left = (x - Math.abs(self.cursor.offsetLeft - x) * (1 - progress)) + 'px';
    self.cursor.style.top = (y - Math.abs(self.cursor.offsetTop - y) * (1 - progress)) + 'px';
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }
  window.requestAnimationFrame(step);
};

TimelineEventsTrigger.prototype.storeHoverStyle = function() {
  var styles = document.styleSheets;
  var stylesLength = styles.length;
  var hoverRules = [];
  for(var i=0; i<stylesLength; i++) {
    var rules = styles[i].cssRules;
    var rulesLength = rules.length;
    for(var j=0; j<rulesLength; j++) {
      if(rules[j].selectorText && (rules[j].selectorText.indexOf(':hover') !== -1)) {
        hoverRules.push(rules[j]);
      }
    }
  }
  return hoverRules;
}

TimelineEventsTrigger.prototype.addKey = function(eventType, delay, options) {
  this.keys[this.keys.length] = new this.Key(eventType, delay, options, this);
};

TimelineEventsTrigger.prototype.executeTimeline = function(i){
  var i = i || 0;
  if (i >= this.keys.length) return;
  this.keys[i].executeKey(this, i+1);
};

TimelineEventsTrigger.prototype.Key.prototype.executeKey = function(cb, index){
  var self = this;
  var eventtype = this.eventType;
  var options = this.options;
  if(eventtype === 'hover') this.parent.moveMouse(
    options.target.offsetLeft + (options.target.offsetWidth / 2),
    options.target.offsetTop + (options.target.offsetHeight / 2) - window.pageYOffset,
    this.delay);
  window.setTimeout(function(){
    switch (eventtype){
      case 'click':
        var click =  new MouseEvent("click", {
          bubbles: true,
          cancelable: false,
          view: window
        });
        options.target.dispatchEvent(click);
        break;
      case 'scroll':
        var scroll = new SmoothScroll();
        scroll.animateScroll( options.scrollTo, null, {speed: options.duration});
        break;
      case 'hover':
        var styles = self.parent.styles.filter(function(row){
          return row.selectorText.indexOf(options.target.tagName.toLowerCase()+":hover") !== -1
        });
        for (var i = 0; i < styles.length; i++) { // for each matching selector
          for (var j = 0; j < styles[i].style.length; j++) { // for each property
            var cssProperty = styles[i].style[j];
            options.target.style[cssProperty] = styles[i].style[cssProperty];
          }
        }
        self.parent.hoveredElement = options.target;
        break;

      case 'leave':
        if(! self.parent.hoveredElement) return;
        self.parent.hoveredElement.style = "";
        break;
    }
    cb.executeTimeline(index);
  }, this.delay)
};

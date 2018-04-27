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

  timeline.addKey("hover", 2000, {
    target: clickTarget,
    duration: 500
  })

  timeline.addKey("leave", 3000)

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
  this.options = {
    relative: false,
    defaultMousePos: {x:50, y:50}
  }
};


// Turn keys into embed objects 😯
TimelineEventsTrigger.prototype.Key = function(eventType, delay, options, parent) {
  this.eventType = eventType;
  this.delay = delay || 1000;
  this.options = options || {};
  this.parent = parent;
};

TimelineEventsTrigger.prototype.moveMouse = function(x = this.options.defaultMousePos.x, y = this.options.defaultMousePos.y, t = 0) {
  var self = this;
  var startX = self.cursor.offsetLeft;
  var startY = self.cursor.offsetTop;
  var start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = t === 0 ? 1 : Math.min((timestamp - start) / t, 1);
    var delta = EasingFunctions.easeOutQuad(progress);
    self.cursor.style.left = (startX - (startX - x) * delta) + 'px';
    self.cursor.style.top = (startY - (startY - y) * delta) + 'px';
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

TimelineEventsTrigger.prototype.getEventTrigger = function(eventtype, options){
  var self = this;
  switch (eventtype){
    case 'click':
      return function(){
        var click =  new MouseEvent("click", {
          bubbles: true,
          cancelable: false,
          view: window
        });
        options.target.dispatchEvent(click);
      };
      break;

    case 'scroll':
      var scroll = new SmoothScroll();
      return function(){
        scroll.animateScroll( options.scrollTo, null, {speed: options.duration});
      };
      break;

    case 'hover':
      return function(){
        var styles = self.styles.filter(function(row){
          return row.selectorText.indexOf(options.target.tagName.toLowerCase()+":hover") !== -1
        });
        for (var i = 0; i < styles.length; i++) { // for each matching selector
          for (var j = 0; j < styles[i].style.length; j++) { // for each property
            var cssProperty = styles[i].style[j];
            options.target.style[cssProperty] = styles[i].style[cssProperty];
          }
        }
        self.cursor.className = "hover";
        self.hoveredElement = options.target;
      }
      break;

    case 'leave':
      return function(){
        if(! self.hoveredElement) return;
        self.hoveredElement.style = "";
        self.cursor.className = "";
        self.moveMouse(undefined, undefined, t = 1000);
      }
      break;
  }
};

TimelineEventsTrigger.prototype.Key.prototype.executeKey = function(cb, index){

  var self = this;
  self.parent.moveMouse();
  var eventtype = this.eventType;
  var options = this.options;
  var trigger = this.parent.getEventTrigger(eventtype, options);
  if(eventtype === 'hover') {
    window.setTimeout(function(){
      self.parent.moveMouse(
      options.target.offsetLeft + (options.target.offsetWidth / 2),
      options.target.offsetTop + (options.target.offsetHeight / 2) - window.pageYOffset,
      self.options.duration)
    }, self.delay - self.options.duration);
  };
  if(! this.parent.options.relative) cb.executeTimeline(index);
  window.setTimeout(function(){
    trigger();
    if(self.parent.options.relative) cb.executeTimeline(index);
  }, this.delay);
};

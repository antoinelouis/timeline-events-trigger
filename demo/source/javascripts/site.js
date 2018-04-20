//= require 'smooth-scroll/dist/js/smooth-scroll'

document.addEventListener("DOMContentLoaded", function(event) { 

  const timeline = new TimelineEventsTrigger;
  var clickTarget = document.querySelector('.btn');

  clickTarget.addEventListener('mouseenter', function(e){
    console.log(e);
    console.dir(e);
  });
  clickTarget.addEventListener('mousemove', function(e){
    console.log(e);
    console.dir(e);
  });
  clickTarget.addEventListener('click', function(e){
    e.preventDefault();
    console.log('click');
    e.target.innerHTML += " clicked";
  })


  timeline.addKey("scroll", 1000, {
    scrollTo: 100,
    duration: 500
  })

  timeline.addKey("hover", 1000, {
    target: clickTarget
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
        var hover =  new MouseEvent("mouseenter", {
          bubbles: true,
          cancelable: true,
          relatedTarget: document.querySelector('div.hero'),
        });
        options.target.dispatchEvent(hover);

        function getCssPropertyForRule(rule) {
          var sheets = document.styleSheets;
          var slen = sheets.length;
          for(var i=0; i<slen; i++) {
            var rules = sheets[i].cssRules;
            var rlen = rules.length;
            for(var j=0; j<rlen; j++) {
              if(rules[j].selectorText == rule) {
                return rules[j].style;
              }
            }
          }
        }

        var foo = getCssPropertyForRule(options.target.tagName.toLowerCase()+':hover');
        var cssAttr = foo[0];
        options.target.style[cssAttr] = foo[cssAttr];

        break;
    }
    cb.executeTimeline(index);
  }, this.delay)
};
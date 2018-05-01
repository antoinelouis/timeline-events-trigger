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
});









/*
**
** TET LIBRARY
**
*/



/*
** TIMELINE CLASS
*/

class TimelineEventsTrigger {

  constructor(options = {}){
    let self = this;
    let defaults = {
      relative        : false,
      defaultMousePos : {x:50, y:50}
    }
    this.options = Object.assign({}, defaults, options);
    this.hoverElements = [];
    this.keys = [];
    this.styles = this.storeHoverStyle();
    this.styles.forEach(function(style){
      var elements = style.selectorText
              .trim(style.selectorText.indexOf('{'))
              .split(', ')
              .filter(function(pseudoClass){
                return pseudoClass.indexOf('hover') !== -1;
              })
              .map(function(selector){
                selector = selector.slice(0, selector.indexOf(':'));
                return Array.prototype.slice.call(document.querySelectorAll(selector));
              });
      if (elements[0].length) {
        elements[0].forEach(function(el){self.hoverElements.push(el)});
      }
    })
    this.hoverPositions = self.hoverElements.map(function(el){
      var pos = {};
      pos.target = el;
      pos.top = el.offsetTop;
      pos.bottom = pos.top + el.offsetHeight;
      pos.left = el.offsetLeft;
      pos.right = pos.left + el.offsetWidth;
      return pos;
    });

    this.cursor = document.createElement('DIV');
    this.cursor.id = "timelinecursor";
    document.body.appendChild(this.cursor);
  }

  moveMouse(x = this.options.defaultMousePos.x, y = this.options.defaultMousePos.y, t = 0){
    var self = this;
    var startX = self.cursor.offsetLeft;
    var startY = self.cursor.offsetTop;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = t === 0 ? 1 : Math.min((timestamp - start) / t, 1);
      var delta = EasingFunctions.easeOutQuad(progress);
      var scroll = window.pageYOffset
      var left = Math.floor(startX - (startX - x) * delta);
      var top = Math.floor(startY - (startY - y) * delta);
      // check if any hoverable element has matching position with the mouse
      var hoveredEl = self.hoverPositions.find(function(element) {
        return element.top - scroll < top
            && top < element.bottom - scroll
            && element.left < left
            && left < element.right;
      });
      self.cursor.style.left = left + 'px';
      self.cursor.style.top = top + 'px';
      if (hoveredEl && hoveredEl.target !== self.hoveredElement) {
        self.hover(hoveredEl.target);
      } else if (! hoveredEl) {
        self.hoverElements.forEach(function(el){
          el.style = "";
        })
      };
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  storeHoverStyle() {
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

  hover(target) {
    var styles = this.styles.filter(function(row){
      return row.selectorText.indexOf(target.tagName.toLowerCase()+":hover") !== -1
    });
    for (var i = 0; i < styles.length; i++) { // for each matching selector
      for (var j = 0; j < styles[i].style.length; j++) { // for each property
        var cssProperty = styles[i].style[j];
        target.style[cssProperty] = styles[i].style[cssProperty];
      }
    }
    this.cursor.className = "hover";
    this.hoveredElement = target;
  }

  addKey(eventType, delay, options) {
    this.keys[this.keys.length] = new Key(eventType, delay, options, this);
  }

  executeTimeline(i){
    var i = i || 0;
    if (i >= this.keys.length) return;
    this.keys[i].executeKey(this, i+1);
  }


  /*
  ** Event emulator
  */

  getEventTrigger(eventtype, options){
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
          // var styles = self.styles.filter(function(row){
          //   return row.selectorText.indexOf(options.target.tagName.toLowerCase()+":hover") !== -1
          // });
          // for (var i = 0; i < styles.length; i++) { // for each matching selector
          //   for (var j = 0; j < styles[i].style.length; j++) { // for each property
          //     var cssProperty = styles[i].style[j];
          //     options.target.style[cssProperty] = styles[i].style[cssProperty];
          //   }
          // }
          // self.cursor.className = "hover";
          // self.hoveredElement = options.target;
        }
        break;

      case 'leave':
        return function(){
          if(! self.hoveredElement) return;
          self.hoveredElement.style = "";
          self.cursor.className = "";
          self.moveMouse(undefined, undefined, 1000);
        }
        break;
    }
  };

}



/*
** KEY CLASS
*/

class Key {

  constructor(eventType, delay, options, parent){
    this.eventType = eventType;
    this.delay = delay || 1000;
    this.options = options || {};
    this.parent = parent;
  }

  executeKey(cb, index){
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
  }

};
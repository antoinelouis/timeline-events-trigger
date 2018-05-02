//= require 'easing.js'

export default class TimelineEventsTrigger {

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
    var self = this;
    switch (eventType){
      case 'click':
        this.keys[this.keys.length] = new Click(delay, options, this);
        break;

      case 'scroll':
        this.keys[this.keys.length] = new Scroll(delay, options, this);
        break;

      case 'hover':
        this.keys[this.keys.length] = new Hover(delay, options, this);
        break;

      case 'leave':
        this.keys[this.keys.length] = new Leave(delay, options, this);
        break;
    }
  }

  executeTimeline(i){
    var i = i || 0;
    if(i === 0) this.moveMouse();
    if (i >= this.keys.length) return;
    this.keys[i].executeKey(this, i+1);
  }

}



/*
** KEY CLASS
*/

class Key {

  constructor(delay, options, parent){
    this.delay = delay || 1000;
    this.options = options || {};
    this.parent = parent;
    this.prior = false;
  }

  executeKey(cb, index){
    var self = this;
    var options = this.options;
    var trigger = this.getEventTrigger(options);
    if(self.prior) {
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

class Click extends Key {
  getEventTrigger(options){
    return function(){
      var click =  new MouseEvent("click", {
        bubbles: true,
        cancelable: false,
        view: window
      });
      options.target.dispatchEvent(click);
    };
  }
}

class Scroll extends Key {
  getEventTrigger(options){
    var scroll = new SmoothScroll();
    return function(){
      scroll.animateScroll( options.scrollTo, null, {speed: options.duration});
    };
  }
}

class Hover extends Key {
  constructor(delay, options, parent){
    super(delay, options, parent);
    this.prior = true;
  }
  getEventTrigger(options){
    return function(){
    }
  }
}

class Leave extends Key {
  getEventTrigger(options){
    var self = this;
    return function(){
      self.parent.moveMouse(undefined, undefined, 1000);
    }
  }
}

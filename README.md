# timeline-events-trigger

## Purpose

Here is a brand new JS library which purpose is to trigger an events sequence based on a timeline in order to perform neat demos on real websites.

## Use

At first, you'll need to declare a new timeline
```
const timeline = new TimelineEventsTrigger;
```

Then, add new key events to your timeline with the addKey method:

```
let options = {
  scrollTo: 400,
  duration: 1000
}
timeline.addKey(scroll, 2000, options)
```

## Supported events

Scroll
```
const myElement = document.querySelector('#anchor2');

let options = {
  scrollTo: 400,       // integer for scroll position in pixels
  scrollTo: "400vh",   // integer for scroll position in pixels
  scrollTo: myElement, // DOM element
  duration: 1000,      // duration in miliseconds
}
```

Click
Mouseover
Keypress
Focus
Change
Custom method
// Release 0

  var SweetSelector = (function(){
 	return {
 		select: function(target){
 			return document.querySelector(target);
 		}
 	};
 })();

// Release 1
 var DOM = (function() {
 	return {
 		hide: function(target) {
 			var div = SweetSelector.select(target);
 			div.style.display = 'none'
 		},
 		show: function(target) {
 			var div = SweetSelector.select(target);
 			div.style.display = 'block'
 		},
 		addClass: function(target, newClass) {
 			var div = SweetSelector.select(target);
 			return div.classList.add(newClass);
 		},
 		removeClass: function(target, oldClass) {
 			var div = SweetSelector.select(target);
 			return div.classList.remove(oldClass);
 		}
 	};
 })();

// Release 2
var EventDispatcher = (function(){

  return{
    on: function(target, event_name, anonymousFunction){
      document.addEventListener(event_name, anonymousFunction);
    },

    trigger: function(target, event_name){
      var event = new Event(event_name)
      document.dispatchEvent(event);
    }
  }
})();

// Releases 4-6

var pubSub = (function() {
  var events = {};
  var subscribe = function(target, evt, callback) {
    if (!events[evt]) {
      events[evt] = [];
    }
    var event = document.createEvent("HTMLEvents");
    event.initEvent(evt, true, true);
    event.eventName = evt;

    target.addEventListener(evt, callback, false);
    events[evt].push({ target: target, evt: event });
    return events;
  }

  var publish = function(evt) {
    if (!events[evt]) {
      return false;
    }
    var subscribers = events[evt];

    var len = subscribers.length
    while (len--) {
      var subscriber = subscribers[len];
      subscriber.target.dispatchEvent(subscriber.evt);
    }

  }
  return {
    subscribe: subscribe,
    publish: publish
  };
}());

var miniQuery = (function(pubsub) {
  var _$ = function(selector) {
    var element = document.querySelector(selector);
    if(element) return new MiniQuery(element);
  }

  _$['ajax'] = function(options){
    return new AjaxWrapper(options);
  }

  var AjaxWrapper = function(options) {
    this.xhr = new XMLHttpRequest();
    this.options = options
    this.sendRequest();
    return this.xhr;
  }

  AjaxWrapper.prototype = {
    sendRequest: function() {
      this.xhr.open(this.options['type'], this.options['url'], true)
      this.xhr.send();
      this.handleResponse();
    },
    handleResponse: function() {
      var success = this.options.success || this.transferComplete;
      var fail = this.options.fail || this.transferFailed;
      this.xhr.addEventListener("load", success, false);
      this.xhr.addEventListener("error", fail, false);
    },

    transferComplete: function(evt) {
      console.log('ajax failed');
    },
    transferFailed: function() {
      console.log('ajax failed');
    }
  }

  var MiniQuery = function(element) {
    this.element = element;
  }
  MiniQuery.prototype = {
    show: function() {
      this.element.setAttribute('style', 'display: block;');
    },
    hide: function() {
      this.element.setAttribute('style', 'display: none;');
    },
    addClass: function(name) {
      var klass = this.element.className + ' ' + name;
      this.element.setAttribute('class', klass.trim());
    },
    removeClass: function(name) {
      var klass = this.element.className.replace(name, '').trim();
      this.element.setAttribute('class', klass);
    },
    on: function(topic, callback) {
      pubsub.subscribe(this.element, topic, callback);
      return this;
    },

    trigger: function(topic) {
      pubsub.publish(topic);
    }
  }
  return function(global) {
    global.$ = _$;
  }
}(pubSub));


(function(global, miniQuery) {
  if (!global) throw new Error( "we need a window!" );
  miniQuery(global);
}(window, miniQuery));

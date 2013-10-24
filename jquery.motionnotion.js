(function($){
	var options = {
		suspendAnimationsOnAll: false
	};
	
	
	var engines = {
		STANDARD: 	'standard',
		MOZILLA: 	'mozilla',
		WEBKIT: 	'webkit',
		MICROSOFT:  'microsoft',
		OPERA:  	'opera'
	};
	
	
	var stylePrefixes = {
		'standard': 	'',
		'mozilla':		'Moz',
		'webkit':		'Webkit',
		'microsoft': 	'ms',
		'opera':		'O'
	};
	
	
	var eventPrefixes = {
		'standard':		'',
		'mozilla': 		'moz', 
		'webkit': 		'webkit', 
		'microsoft':	'MS', 
		'opera':		'o'
	};
	
	var eventsCamelCased = {
		'animationstart':		'AnimationStart',
		'animationend':			'AnimationEnd',
		'animationiteration':	'AnimationIteration'
	};
	
	
	//the name of the property by which we can fetch animation-name from 
	//various browsers. We can likely drop -ms- prefix for animations. More 
	//research, but as per this table http://caniuse.com/css-animation -ms- 
	//has never been required for animation support on any version of IE. 
	var animationNameStyleNames = {
		'standard':		'animationName', //standard access for jQuery
		'mozilla':		'-moz-animation-name', //unsupported access for jQuery
		'webkit':		'-webkit-animation-name',//unsupported access for jQuery
		'microsoft':	'-ms-animation-name', //unsupported access for jQuery
		'opera':		'-o-animation-name' //unsupported access for jQuery
	}; 
	
	
	var transitionNames = {
		'adding': 		'mn-adding', //encompassing for all adds types
		'removing': 	'mn-removing', //encompassing all remove types
		'appending': 	'mn-appending',
		'prepending':	'mn-prepending',
		'aftering':   	'mn-aftering',
		'beforing': 	'mn-beforing',
		'emptying': 	'mn-emptying',
		'detaching': 	'mn-detaching',
		'hiding': 		'mn-hiding',
		'showing': 		'mn-showing'
	};
	 
	 
	//Current test for animationName support:
	//http://jsfiddle.net/39X9S/
	var engineDetected = (function() { 
	    var div = document.createElement('div');
	    var engineDetected = false;
		
		for( var engine in engines ) {
			engineName = engines[engine];
			var property = animationNameStyleNames[ engineName ];
			if(div.style[property] !== undefined){
				engineDetected = engineName;
				break;
			}
		}
	    return engineDetected;
	})();
	
	var animationNameStyleName = animationNameStyleNames[engineDetected];
	
	
    /**
     * A method for normalizing the event names depending on what browser
     * you are using.
     * @param {string} eventName W3C name of the event you will be normalizing.
	 * @return {string}
     */
	var normalizeAnimationEventName = function(eventName){
		switch(engineDetected){
			case engines.MOZILLA:
			case engines.WEBKIT:
			case engines.MICROSOFT:
				return eventPrefixes[ engineDetected ] +
				       eventsCamelCased[ eventName ];
				break;
			case engines.OPERA:
				return eventPrefixes[ engineDetected ] + eventName;
				break;
			case engines.STANDARD:
			default:
				return eventName;
				break;
		}
		return eventName;
	};
	
	
	/**
	 * Checks to see if an element's css contains a specific animation name.
	 * @param {jQuery} $el jQuery element that will be evaluated.
	 * @param {string} name Animation name is being queried for.
	 * @return {boolean}
	 */
	var hasAnimation = function($el, name){
		var names = getAnimationNames($el);
	    for( var i = 0; i < names.length; i++ ) {
	        if( names[i] == name ) {
	            return true;
	        }
	    }
	    return false;
	};
	
	/**
	 * Gets all the animation names as an array.
	 * @param {jQuery} $el jQuery element that will be evaluated.
	 * @return {Array}
	 */
	var getAnimationNames = function($el){
		var commaSeperatedNames = $el.css(animationNameStyleName) || "";
		if(commaSeperatedNames !== "" &&
	       commaSeperatedNames !== "none"){
			return commaSeperatedNames.replace(/ /g,'').split(',');
		}else{
			return [];
		}
	};
	
	/**
	 * Returns all newly discovered animation names, minus the transition 
	 * animations names.
	 * @param {Array} prevNames Previously discovered animation names.
	 * @param {Array} currNames Currently discovered animation names.
	 * @return {Array}
     */
	var getNewAnimationNames = function(prevNames, currNames){
		var transitionNamesArray = new Array;
		for(var transition in transitionNames) {
		    transitionNamesArray.push(transitionNames[transition]);
		}
		
		//do not include transition animation name markers as discovered
		prevNames = $(prevNames).not(transitionNamesArray).get(); 
		currNames = $(currNames).not(transitionNamesArray).get();
		
		//new animations are ones that were not there before.
		return $(currNames).not(prevNames).get();
	};
	
	//get all original methods, store them as super methods!
	var removeSuper = $.fn.remove;
    var appendSuper = $.fn.append;
	var prependSuper = $.fn.prepend;
	var beforeSuper = $.fn.prepend;
	var afterSuper = $.fn.after;
	var emptySuper = $.fn.empty;
	var replaceWithSuper = $.fn.replaceWith;

	/**
	 * New remove method.
	 */
    $.fn.remove = function( selector, keepData /* Internal Use Only */ ) {
		var els = selector ? jQuery.filter( selector, this ) : this;
		
		
		for( var i = 0; i < els.length; i++ ) {
			var $el = $(els[i]);
			var prevNames = getAnimationNames($el);
			
			$el.addClass(transitionNames['removing']);
			
			if( hasAnimation($el, transitionNames['removing']) &&
			    !$el.data('mnSuspendAnimations') &&
				!options.suspendAnimationsOnAll
			 ) {
					
				var newNames = getNewAnimationNames(
					prevNames, 
					getAnimationNames($el)
				);
				
				var openAnimations = $el.data('mnOpenAnimations') || 0;
				$el.data('mnOpenAnimations', openAnimations + newNames.length);
				
				$el.on(
					normalizeAnimationEventName('animationend'), 
					[keepData, $el],
					removingAnimationEndHandler
				 );
			}else{ 
				completeRemoving($el, keepData);
			}
		}
		return this;
    };
	
	var removingAnimationEndHandler = function(event){
		var keepData = event.data[0];
		var $el = event.data[1];
		
		
		var openAnimations = $el.data('mnOpenAnimations');
		openAnimations --;
		$el.data('mnOpenAnimations', openAnimations);
		
		if(openAnimations == 0){
			$el.off(
				normalizeAnimationEventName('animationend'), 
				removingAnimationEndHandler
			 );
			 completeRemoving($el, keepData);
		}
	};
	
	var completeRemoving = function($el, keepData){
		 $el.removeClass(transitionNames['removing']);
		 removeSuper.apply($el, [undefined, keepData]);
		 $el.triggerHandler('remove');
	};
	
	//prototype motionNotion
	$.fn.motionNotion = function(method, param){
		switch(method){
		case 'suspendAnimations':
			this.data('mnSuspendAnimations', param);
		}
		return this;
	};
	
	//global motionNotion
	$.motionNotion = function(method, param){
		switch(method){
		case 'suspendAnimationsOnAll':
			options.suspendAnimationsOnAll = param;
			break;
		case 'internals':
			return {
				'engines':						engines,
				'stylePrefixes':				stylePrefixes,
				'eventPrefixes':				eventPrefixes,
				'eventsCamelCased':				eventsCamelCased,
				'animationNameStyleNames':		animationNameStyleNames,
				'transitionNames':				transitionNames,
				'engineDetected':				engineDetected,
				'animationNameStyleName':		animationNameStyleName,
				'normalizeAnimationEventName':	normalizeAnimationEventName,
				'hasAnimation':					hasAnimation,
				'getAnimationNames':			getAnimationNames,
				'getNewAnimationNames':			getNewAnimationNames
			};
			break;
		}
		return this;
	};
	
})(jQuery);

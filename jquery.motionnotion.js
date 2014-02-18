var self = function($){
	var options = {
		suspendAnimationsOnAll: false,
        useCustomManip: false
	};
	
	var engines = {
		STANDARD: 	'standard',
		MOZILLA: 	'mozilla',
		WEBKIT: 	'webkit',
		MICROSOFT:  'microsoft',
		OPERA:  	'opera'
	};
	
    var checkOrder = [
        engines.STANDARD,
        engines.MOZILLA,
        engines.WEBKIT,
        engines.MICROSOFT,
        engines.OPERA
    ];
	
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
		'standard':		'animation-name', //standard access for jQuery
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
		for( var i = 0; i < checkOrder.length; i++){
		    engineName = checkOrder[i];
            if(engineName == engines.STANDARD){
                var property = 'animationName'
            }else{
                var property = animationNameStyleNames[ engineName ];
            }
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
		
	var asyncManipulation = function($el, transition, manipulationSuper, superScope, superArgs) {
        manipulationSuper = manipulationSuper || function() {};
        superArgs = superArgs || [];
        superScope = superScope || $el;
        
		var transitionOperation = $el.data('mnTransitionOperation') || null;
		if( transitionOperation && transitionOperation.state() !== 'resolved' ){
            //finish the current manipulation & animation.
            transitionOperation.resolve();
		}
        
        //apply super asynchronosly incase an animation takes place.
		applyTransition(
			$el,
			transition,
            manipulationSuper,
            superScope,
			superArgs
		);
	};
    
    var syncManipulation = function($el, transition, manipulationSuper, superScope, superArgs) {
        manipulationSuper = manipulationSuper || function() {};
        superArgs = superArgs || [];
        superScope = superScope || $el;
        
		var transitionOperation = $el.data('mnTransitionOperation') || null;
		if( transitionOperation && transitionOperation.state() !== 'resolved' ){
            //finish the current manipulation & animation.
            transitionOperation.resolve();
		}
        
        //apply super right away (synchronosly)
        manipulationSuper.apply(superScope, superArgs);
        
		applyTransition(
			$el,
			transition
		);
    };
	
	
	var applyTransition = function($el, transition, callback, scope, args) {
        callback = callback || function() {};
        scope = scope || $el;
        args = args || [];
        
		var transitionOperation = $.Deferred();
		var prevNames = getAnimationNames($el);

		$el.addClass(transitionNames[transition]);
		
		if( hasAnimation($el, transitionNames[transition]) &&
		    !$el.data('mnSuspendAnimations') &&
			!options.suspendAnimationsOnAll
		 ) {
				
			var newNames = getNewAnimationNames( prevNames, getAnimationNames($el) );
			
			var openAnimations = $el.data('mnOpenAnimations') || 0;
			$el.data('mnOpenAnimations', openAnimations + newNames.length);
			
            transitionOperation.done(function() {
                completeTransition(
                    $el, 
                    transition, 
                    callback,
                    scope,
                    args
                );
            });
            $el.data('mnTransitionOperation', transitionOperation);
            
			$el.on(
				normalizeAnimationEventName('animationend'), 
				{ 
					transitionOperation: transitionOperation
				},
				animationEndHandler
			);
		}else{
            completeTransition(
                $el, 
                transition, 
                callback,
                scope,
                args
            );
		}
	};
	
	var completeTransition = function($el, transition, callback, scope, args) {
		$el.off(
			normalizeAnimationEventName('animationend'), 
			animationEndHandler
		);
        $el.data('mnOpenAnimations', 0);
	 	$el.removeClass(transitionNames[transition]);
	 	callback.apply(scope, args);
	 	$el.triggerHandler(transition+'End');
	};
	
	
	var animationEndHandler = function(event) {
		var data = event.data;
		var $el = $(this);
		
		var openAnimations = $el.data('mnOpenAnimations');
		openAnimations --;
		$el.data('mnOpenAnimations', openAnimations);

		if(openAnimations == 0){
			data.transitionOperation.resolve();
		}
	};
    
    //Borrowed from Zepto.js
    var traverseNode = function(node, fun) {
        fun(node)
        for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
    }
    
    //Borrowed from Zepto.js
    var fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
          'tr': document.createElement('tbody'),
          'tbody': table, 'thead': table, 'tfoot': table,
          'td': tableRow, 'th': tableRow,
          '*': document.createElement('div')
        };
        
    //Borrowed and modified from Zepto.js
    var customFragment = function(html, name, properties) {
        var dom, nodes, container;

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1));

        if (!dom) {
            if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
            if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
            if (!(name in containers)) name = '*';

            container = containers[name];
            container.innerHTML = '' + html;
            dom = $.each([].slice.call(container.childNodes), function(){
              container.removeChild(this)
            });
        }

        if ($.isPlainObject(properties)) {
            nodes = $(dom);
            $.each(properties, function(key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value)
                else nodes.attr(key, value)
            });
        }

        return dom;
    }
    
    //Borrowed and modified from Zepto.js
    var customDomManip = function(args, callback) {
        // arguments can be nodes, arrays of nodes, jQuery objects and HTML strings
        var argType, nodes = $.map(args, function(arg) {
            argType = $.type(arg);
            return argType == "object" || argType == "array" || arg == null ?
            arg : customFragment(arg)
        }),
        copyByClone = this.length > 1;
        
        if (nodes.length < 1) return this;

        return this.each(function(_, target) {

            for(var i = 0; i < nodes.length; i++){
                var node = nodes[i];
                if (copyByClone) node = node.cloneNode(true);
                if(node.get){
                    node = node.get(0);
                }
                callback.call(this, node);
                
                traverseNode(node, function(el) {
                    if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                       (!el.type || el.type === 'text/javascript') && !el.src)
                      window['eval'].call(window, el.innerHTML)
                });
            }
        });
    };
	
	//get all original methods, store them as super methods!
	var removeSuper = $.fn.remove;
    var appendSuper = $.fn.append;
	var prependSuper = $.fn.prepend;
	var beforeSuper = $.fn.before;
	var afterSuper = $.fn.after;
	var emptySuper = $.fn.empty;
	var replaceWithSuper = $.fn.replaceWith;
	var hideSuper = $.fn.hide;
	var showSuper = $.fn.show;
	var superDomManip = null;
    
    if($.fn.domManip){
        superDomManip = $.fn.domManip;
    }
    //shim for if domManip doesn't work. Required for Zepto or any future version of jQuery that 
    //doesn't expose domManip. HIGHLY EXPERIMENTAL.
    if(!$.fn.domManip || options.useCustomManip == true){
        $.fn.domManip = customDomManip;
    }

	/** 
	 * New remove method.
	 */
    $.fn.remove = function( selector, keepData /*Internal Use Only*/ ) {
		var els = selector ? $.filter( selector, this ) : this;
		var completionArgs = [undefined, keepData];
		
		for( var i = 0; i < els.length; i++ ) {
			var $el = $(els[i]);	
			asyncManipulation($el, 'removing', removeSuper, $el, completionArgs);
		}
		return this;
    };
    
	/**
	 * New detach method.
	 */
    $.fn.detach = function( selector ) {
		var els = selector ? $.filter( selector, this ) : this;
		
		for( var i = 0; i < els.length; i++ ) {
			var $el = $(els[i]);	
			asyncManipulation($el, 'detaching', removeSuper, $el, [undefined, true /*keepData*/]);
		}
		return this;
    };
	
	
	/**
	 * New hide method.
	 */
    $.fn.hide = function() {
		if( arguments.length > 0 ){
			//TODO: wrap callback function with an event dispatcher
			hideSuper.apply(this, arguments);
		}else{
			for( var i = 0; i < this.length; i++){
				var $el = $(this[i]);
				asyncManipulation($el, 'hiding', hideSuper, $el);
			}
		}
    };
	
	/**
	 * New show method.
	 */
    $.fn.show = function() {
		if( arguments.length > 0 ){
			//TODO: wrap callback function with an event dispatcher
			showSuper.apply(this, arguments); 
		}else{
			for( var i = 0; i < this.length; i++){
				var $el = $(this[i]);
				syncManipulation($el, 'showing', showSuper, $el);
			}
		}
    };
	
	/**
	 * New append mehtod
	 */
    $.fn.append = function() {
        if(this.domManip.length == 2) {
            return this.domManip(arguments, function(el){
                syncManipulation($(el),'appending', appendSuper, $(this), [el]);
            });
        }else if(this.domManip.length == 3){
            return this.domManip(arguments, false, function(el){
                syncManipulation($(el),'appending', appendSuper, $(this), [el]);
            });
        }
    };
	
	/**
	 * New prepend method.
	 */
    $.fn.prepend = function() {
        if(this.domManip.length == 2) {
            return this.domManip(arguments, function(el){
                syncManipulation($(el), 'prepending', prependSuper, $(this), [el]);
            });
        //for older versions of jQuery that take three arguments
        }else if(this.domManip.length == 3){
            return this.domManip(arguments, false, function(el){
                syncManipulation($(el), 'prepending', prependSuper, $(this), [el]);
            });
        }
    };
    
	/**
	 * New after method.
	 */
    $.fn.after = function() {
        if(this.domManip.length == 2) {
            return this.domManip(arguments, function(el){
                syncManipulation($(el), 'aftering', afterSuper, $(this), [el]);
            });
        //for older versions of jQuery that take three arguments
        }else if(this.domManip.length == 3){
            return this.domManip(arguments, false, function(el){
                syncManipulation($(el), 'aftering', afterSuper, $(this), [el]);
            });
        }
    };
    
	/**
	 * New before method.
	 */
    $.fn.before = function() {
        if(this.domManip.length == 2) {
            return this.domManip(arguments, function(el){
                syncManipulation($(el), 'beforing', beforeSuper, $(this), [el]);
            });
        //for older versions of jQuery that take three arguments
        }else if(this.domManip.length == 3){
            return this.domManip(arguments, false, function(el){
                syncManipulation($(el), 'beforing', beforeSuper, $(this), [el]);
            });
        }
    };
    
	/**
	 * New empty method.
	 */
    $.fn.empty = function() {
		for( var i = 0; i < this.length; i++){
			var $el = $(this[i]);
            syncManipulation($el, 'emptying', emptySuper);
		}
        
        return this;
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
            if(arguments.length == 2){
                options.suspendAnimationsOnAll = param;
            }else{
                return options.suspendAnimationsOnAll;
            }
			
			break;
        case 'useCustomManip':
            if(arguments.length == 2){
                options.useCustomManip = param;
            
                if(param == true) {
                    $.fn.domManip = customDomManip;
                }else if(superDomManip) {
                    $.fn.domManip = superDomManip;
                }
            }else{
                return options.useCustomManip;
            }
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
};

if( typeof define === "function" && define.amd ){
	define(["jquery"], self);
}else{
    self(window.jQuery || window.Zepto);
}

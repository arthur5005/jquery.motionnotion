#jQuery Motion Notion

A jQuery plugin which allows for CSS3 animations to occur and complete on core jQuery manipulation and visibility functions such as append, remove, show and hide.

Currently, only animations on .remove() are supported. This is highly experimental and production use is highly discouraged. 

The code has only been tested on jQuery 1.10.2+, although it is being written to support a wide gamut of jQuery versions. Try it for your self and let me know what jQuery versions have worked for you! 

##Usage
jQuery Motion Notion is a duck punch/monkey patch for jQuery gives the ability to CSS developers to animate elements as they are being manipulated. 

Nothing has to be done in Javascript other than including the plugin on your page. Simply adding a manipulation class and animation name to your CSS code will signal Motion Notion to defer completion of a manipulation until the animation has completed. If jQuery Motion Notion is unable to discover support for animations, then default jQuery behavior is the fallback and manipulations will happen immediately.

### Manipulations | Class/Animation Names {support}###
	.remove()  | mn-removing    {alpha}
	.append()  | mn-appending   {in development}
	.prepend() | mn-prepending  {in development}
	.after()   | mn-aftering	{in development}
	.before()  | mn-beforing	{in development}
	.empty()   | mn-emptying	{in development}
	.detach()  | mn-detaching	{in development}
	.hide()    | mn-hiding		{in development}
	.show()    | mn-showing		{in development}

**Example**

	/* To target an element that will be removed for an animation, add the .mn-removing class and mn-removing animation name. */
	.someBox.mn-removing {
		/* add animation name 'mn-removing' to the animation-name list */
		animation-name: someFancyAnimation, mn-removing; 
		animation-duration: 1s;
	}
	
Without any Javascript code at all, the element will defer the completion of it's own removal until the animation has completed. Try it for your yourself :).
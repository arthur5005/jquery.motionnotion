$(document).ready(function(){
	
	QUnit.log = function(result, message) {
		if (window.console && window.console.log) {
			window.console.log('%o :: %s', result, message || 'NO MESSAGE');
		}
	};

	module("Testing Internal Methods");
	test('hasAnimation', function(assert){
		expect(2);
		$div = $("<div class='box'></div>");
		$("#mn-fixture").append($div);
		assert.equal(
			$.motionNotion('internals').hasAnimation($div, 'dummyAnimationName'), 
			false, 
			"New div does not have dummyAnimationName"
		);
	
		$div.addClass('dummyAnimationClass');
	
		assert.equal(
			$.motionNotion('internals').hasAnimation($div, 'dummyAnimationName'), 
			true, 
			"New div does have dummyAnimationName"
		);
		$div.remove();
	});
	
	test("getAnimationNames", function(assert){
		expect(2);
		$div = $("<div class='box'></div>");
		$("#mn-fixture").append($div);
	
		assert.equal(
			$.motionNotion('internals').getAnimationNames($div).length, 
			0, 
			"New div does not have any animation names."
		);
	
		$div.addClass('dummyAnimationClass');
	
		assert.equal(
			$.motionNotion('internals').getAnimationNames($div).length, 
			1, 
			"New div does have a single animation name."
		);
		$div.remove();
	});
	
	test("getNewAnimationNames", function(assert){
		expect(2);
		var newNames1 = $.motionNotion('internals').getNewAnimationNames(
			['a','b','c', 'mn-adding'], 
			['a','b','c','d','e','mn-removing']
		);
		
		assert.deepEqual(
			newNames1, 
			['d', 'e'], 
			"Successfully found the 2 new animation names" +
			" while ignoring transition animation names."
		);
		
		var newNames2 = $.motionNotion('internals').getNewAnimationNames(
			['a','b','c','d','e','mn-removing'],
			['a','b','c','f', 'mn-adding']
		);
		
		assert.deepEqual(
			newNames2, 
			['f'], 
			"Successfully found the 1 new animation name while ignoring " +
			"animation names that were removed and transition animation names."
		);
	});
	
	
	module("Testing Base Functionality");
	
	asyncTest(".remove() animates and removes.", function(assert){
		expect(2);
		$div = $("<div class='box'></div>");
		$("#mn-fixture").append($div);
		$div.addClass('animating');
		$div.remove();
	
		assert.equal(
			$("#mn-fixture").children().length, 
			1, 
			"Div is still in DOM after .remove() is called."
		);
	
		setTimeout(function(){
			assert.equal(
				$("#mn-fixture").children().length, 
				0, 
				"Div has been removed after 1.2s has passed."
			);
			start();
		}, 1200);
	});
	
});



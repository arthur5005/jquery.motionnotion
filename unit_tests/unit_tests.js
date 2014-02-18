$(document).ready(function(){
    if ( window.location.href.indexOf( "showFixture=true" ) > -1) {
        $( "#qunit-fixture" ).css({
            height: "",
            width: "",
            position: 'static',
            backgroundColor: "#FFF",
            border: "solid"
        });
    }
    if ( window.location.href.indexOf( "useCustomManip=true" ) > -1) {
        $.motionNotion('useCustomManip', true);
    }
    
    
	QUnit.log = function(result, message) {
		if (window.console && window.console.log) {
			window.console.log('%o :: %s', result, message || 'NO MESSAGE');
		}
	};

	module("Testing Internal Methods");
	test('hasAnimation', function(assert){
		expect(2);
		$div = $("<div class='box'></div>");
		$("#qunit-fixture").append($div);
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
		$("#qunit-fixture").append($div);
	
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
		$("#qunit-fixture").append($div);
		$div.addClass('animating');
		$div.remove();
	
		assert.equal(
			$("#qunit-fixture").children().length, 
			1, 
			"Div is still in DOM after .remove() is called."
		);
	
		setTimeout(function(){
			assert.equal(
				$("#qunit-fixture").children().length, 
				0, 
				"Div has been removed after 1.2s has passed."
			);
            $div.removeClass('animating');
			start();
		}, 1200);
	});

	asyncTest(".hide() animates and hides.", function(assert){
		expect(2);
		$div = $("<div class='box'></div>");
		$("#qunit-fixture").append($div);
		$div.addClass('animating');
		$div.hide();
	
		assert.notEqual(
			$div.css('display'), 
			'none', 
			'Div is still visible after .hide() is called.'
		);

		setTimeout(function(){
			assert.equal(
				$div.css('display'), 
				'none', 
				"Div has been hidden from the DOM after 1.2s has passed."
			);
            $div.removeClass('animating');
			start();
		}, 1200);
	});
	
	asyncTest(".show() animates and shows.", function(assert){
		expect(4);
		$div = $("<div class='box'></div>");
		$("#qunit-fixture").append($div);
		$div.hide();
	
		assert.equal(
			$div.css('display'), 
			'none', 
			'Div has been hidden from the DOM'
		);
	
		$div.addClass('animating');
		$div.show();
		
		assert.notEqual(
			$div.css('display'), 
			'none', 
			'Div is still visible after .show() is called.'
		);
		
		assert.equal(
			$div.hasClass('mn-showing'),
			true,
			'Div has the showing transition class'
		);

		setTimeout(function(){
			assert.equal(
				$div.hasClass('mn-showing'),
				false,
				'Div does not have the showing transition class'
			);
            $div.removeClass('animating');
			start();
		}, 1200);
	});
    
	asyncTest(".append() appends and animates", function(assert){
		expect(3);
		$div = $("<div class='box'></div>");
		$div.addClass('animating');
		$("#qunit-fixture").append($div);
		
		assert.equal(
			$("#qunit-fixture").children().length, 
			1, 
			"New div is in DOM after .append($div) is called on fixture."
		);
		
		assert.equal(
			$div.hasClass('mn-appending'),
			true,
			'Div has the appending transition class'
		);

		setTimeout(function(){
			assert.equal(
				$div.hasClass('mn-appending'),
				false,
				'Div does not have the appending transition class'
			);
            $div.removeClass('animating');
			start();
		}, 1200);
	});
    
	asyncTest(".prepend() prepends and animates", function(assert){
		expect(4);
		$div = $("<div class='box'></div>");
		$div.addClass('animating');
        $('#qunit-fixture').append("<div></div>");
        $('#qunit-fixture').append("<div></div>");
		$("#qunit-fixture").prepend($div);
        
		assert.equal(
			$("#qunit-fixture").children().length, 
			3, 
			"New div is in DOM after .prepend($div) is called on fixture."
		);
		
        assert.equal(
            $("#qunit-fixture").children().eq(0).get(0),
            $div.get(0),
            "First out of three elements is in-fact the new div."
        );
        
		assert.equal(
			$div.hasClass('mn-prepending'),
			true,
			'Div has the prepending transition class'
		);

		setTimeout(function(){
			assert.equal(
				$div.hasClass('mn-prepending'),
				false,
				'Div does not have the prepending transition class'
			);
            $div.removeClass('animating');
			start();
		}, 1200);
	});
    
    
	asyncTest(".after() inserts and animates", function(assert){
		expect(4);
		$div = $("<div class='box'></div>");
        $div.addClass('animating');
        $pivotDiv = $("<div></div>");
        $('#qunit-fixture').append($pivotDiv);
        
		$pivotDiv.after($div);
        
		assert.equal(
			$("#qunit-fixture").children().length, 
			2, 
			"New div is in DOM after .after($div) is called on $pivotDiv."
		);
		
        assert.equal(
            $("#qunit-fixture").children().eq(1).get(0),
            $div.get(0),
            "Second element is in-fact the new div."
        );
        
		assert.equal(
			$div.hasClass('mn-aftering'),
			true,
			'Div has the aftering transition class'
		);

		setTimeout(function(){
			assert.equal(
				$div.hasClass('mn-aftering'),
				false,
				'Div does not have the aftering transition class'
			);
            $div.removeClass('animating');
			start();
		}, 1200);
	});
    
	asyncTest(".before() inserts and animates", function(assert){
		expect(4);
		$div = $("<div class='box'></div>");
        $div.addClass('animating');
        $pivotDiv = $("<div></div>");
        $('#qunit-fixture').append($pivotDiv);
		$pivotDiv.before($div);

		assert.equal(
			$("#qunit-fixture").children().length, 
			2, 
			"New div is in DOM after .before($div) is called on $pivotDiv."
		);
		
        assert.equal(
            $("#qunit-fixture").children().eq(0).get(0),
            $div.get(0),
            "First element is in-fact the new div."
        );
        
		assert.equal(
			$div.hasClass('mn-beforing'),
			true,
			'Div has the beforing transition class'
		);

		setTimeout(function(){
			assert.equal(
				$div.hasClass('mn-beforing'),
				false,
				'Div does not have the beforing transition class'
			);
            $div.removeClass('animating');
			start();
		}, 1200);
	});
    
    
	asyncTest(".empty() empties and animates", function(assert){
		expect(4);
		$div = $("<div class='box'></div>");
        $div.append("<div></div>");
        $div.append("<div></div>");
        $div.append("<div></div>");
        $('#qunit-fixture').append($div);

		assert.equal(
			$div.children().length, 
			3, 
			"3 divs are in the box"
		);
        
        $div.addClass('animating');
        $div.empty();
        
		assert.equal(
			$div.hasClass('mn-emptying'),
			true,
			'Div has the emptying transition class'
		);
        
		assert.equal(
			$div.children().length, 
			0, 
			"0 divs are in the box"
		);

		setTimeout(function(){
			assert.equal(
				$div.hasClass('mn-emptying'),
				false,
				'Div does not have the emptying transition class'
			);
            $div.removeClass('animating');
			start();
		}, 1200);
	});
});



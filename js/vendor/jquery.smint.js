/*

SMINT V1.0 by Robert McCracken
SMINT V2.0 by robert McCracken with some awesome help from Ryan Clarke (@clarkieryan) and mcpacosy ‏(@mcpacosy)

SMINT is my first dabble into jQuery plugins!

http://www.outyear.co.uk/smint/

If you like Smint, or have suggestions on how it could be improved, send me a tweet @rabmyself

*/

(function(){
	$.fn.smint = function( options ) {
		// adding a class to users div
		var smint = {};
		var settings = $.extend({
            'scrollSpeed '  : 500
		}, options);
		
		//Set the top bar
		smint.topBar = $(this);
		
		
		smint.topBar.addClass('smint');
		smint.menuHeight = smint.topBar.outerHeight();
		
		//Set the variables needed
		smint.menuLocations = new Array();
		var lastScrollTop = 0;
		
		//Create the menu button
		var anchor = $("<a />", {"id": "smint-menu-button", "data-open":"false"}).append($("<div />", {"class":"smint-bars"})).append($("<div />", {"class":"smint-bars"})).append($("<div />", {"class":"smint-bars"}));
		smint.menuButton = $(anchor);
		//Append the menu button to the smint top bar
		smint.topBar.append(smint.menuButton);
		
		//Create the overlay
		smint.menuOverlay = $("<div />", {"class": "smint-menu-overlay"})
		$("body").append(smint.menuOverlay);
		
		//Create the side-menu
		smint.sideMenu = $("<div />", {"id":"smint-side-menu"});
		smint.sideMenu.append(smint.topBar.find("a[data-smint]").clone());
		smint.sideMenu.css("top", smint.menuHeight);
		$("body").append(smint.sideMenu);
		
		//Combine current menuItems and newly created side menu items.
		smint.sideMenu.find("a[data-smint]").attr("data-side", "true");
		smint.menuItems = smint.topBar.find("a[data-smint]").add(smint.sideMenu.find("a[data-smint]"));
		console.log(smint.menuItems.length);
		
		smint.menuItems.each(function(index){
			if ( settings.scrollSpeed ) {
				var scrollSpeed = settings.scrollSpeed;
			}
			//Fill the menu
			var id = $(this).attr("data-id");
			smint.menuLocations.push({
				"start": $("div."+id).position().top-smint.menuHeight,
				"end": $("div."+id).outerHeight()+$("div."+id).position().top,
				"id": id
			});
			// get initial top offset for the menu 
			var stickyTop = smint.topBar.offset().top;
			// check position and make sticky if needed
			var stickyMenu = function(direction){
				// current distance top
				var scrollTop = $(window).scrollTop();
				// if we scroll more than the navigation, change its position to fixed and add class 'fxd', otherwise change it back to absolute and remove the class
				if(smint.topBar.attr("data-type") === "top"){
					if (scrollTop > stickyTop) { 
						smint.topBar.css({ 'position': 'fixed', 'top':0 }).addClass('fxd');	
					} else {
						smint.topBar.css({ 'position': 'absolute', 'top':stickyTop }).removeClass('fxd'); 
					}
				}
				//Check if the position is inside then change the menu
				// Courtesy of Ryan Clarke (@clarkieryan)
				//I need to check the location 
				if(smint.menuLocations[index].start <= scrollTop && scrollTop <= smint.menuLocations[index].end){	
					var current = $("a[data-smint][data-id="+id+"]");
					if(direction == "up"){
						$(current).addClass("active");
						var after = $("a[data-smint][data-id="+smint.menuLocations[index+1].id+"]");
						$(after).removeClass("active");
					} else if(index > 0) {
						$(current).addClass("active");
						var before = $("a[data-smint][data-id="+smint.menuLocations[index-1].id+"]");
						$(before).removeClass("active");
					} else if(direction === undefined){
						$(current).addClass("active");
					}
					$.each(smint.menuLocations, function(i){
						if(id != smint.menuLocations[i].id){
							var none = $("a[data-smint][data-id="+smint.menuLocations[i].id+"]");
							$(none).removeClass("active");
						}
					});
				}
			};
			// run functions
			stickyMenu();
			// run function every time you scroll
			$(window).scroll(function() {
				//Get the direction of scroll
				var st = $(this).scrollTop();
				if (st > lastScrollTop) {
				    direction = "down";
				} else if (st < lastScrollTop ){
				    direction = "up";
				}
				lastScrollTop = st;
				stickyMenu(direction);
				// Check if at bottom of page, if so, add class to last <a> as sometimes the last div
				// isnt long enough to scroll to the top of the page and trigger the active state.
				console.log($(window).scrollTop() + $(window).height());
				console.log($(document).height());
				if($(window).scrollTop() + $(window).height() == $(document).height()) {
       				smint.menuItems.removeClass('active');
					$(".smint a[data-smint]").last().addClass("active");
					$("#smint-side-menu").last().addClass("active");
   				}
			});


			$(this).on('click', function(e){				
        		// stops empty hrefs making the page jump when clicked
				e.preventDefault();
				// get id pf the button you just clicked
		 		var id = $(this).attr('data-id');
		 		// if the link has the smint-disable class it will be ignored 
		 		// Courtesy of mcpacosy ‏(@mcpacosy)
                if ($(this).hasClass("smint-disable")){
                    return false;
                }
				// gets the distance from top of the div class that matches your button id minus the height of the nav menu. This means the nav wont initially overlap the content.
				var goTo =  $('div.'+ id).offset().top - smint.menuHeight + 10;
				// Scroll the page to the desired position!
				$("html, body").animate({ scrollTop: goTo }, scrollSpeed);
				if($(this).attr("data-side") === "true"){
					toggleSide("close");
				}
				smint.menuItems.removeClass("active");
				$(this).addClass("active");
			});			
		});		
		
		var toggleSide = function(direction){
			switch(direction){
				case "close":
					smint.menuOverlay.fadeOut(300);
					smint.sideMenu.animate({left: -250}, 300);
					smint.menuButton.attr("data-open", "false");
					break;
				case "open":
					smint.menuOverlay.fadeIn(300);
					smint.sideMenu.animate({left: 0}, 300);
					smint.menuButton.attr("data-open", "true");
					break;
			}
		};
		
		//Bind click function to menu-button
		smint.menuButton.on("click", function(){
			if($(this).attr("data-open") !== "true"){
				toggleSide("open");
			}
			else{
				toggleSide("close");			
			}
		});		
		
		return $(this);
	};
})();
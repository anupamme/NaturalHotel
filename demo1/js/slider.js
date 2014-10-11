var slide = {
	imageCount: 0,
	transDelay: 0,
	staticDelay: 0,
	init: function(setValues){
		this.imageCount = setValues.imageCount;
		this.transDelay = setValues.transDelay;
		this.staticDelay = setValues.staticDelay;
		this.slideMain();
	},
	slideMain: function(){
		for(var i = 0;i < slide.imageCount;i++){
			setTimeout(function(i){slide.slideShow('.cb-slideshow li:nth-child('+ (i + 1) +') span');}, i * (slide.transDelay + slide.staticDelay), i);
			setTimeout(function(i){slide.slideShow('.home h2 div:nth-child('+ (i + 1) +')');}, i * (slide.transDelay + slide.staticDelay), i);
		}
		setTimeout(function(){slide.slideMain();}, slide.imageCount * (slide.transDelay + slide.staticDelay));
	},
	slideShow: function(elm){
		jQuery(elm).animate(
			{opacity:1},
			slide.transDelay,
			function(){
				setTimeout(function(){
						jQuery(elm).animate(
							{opacity:0},
							slide.transDelay
						);
					}, slide.staticDelay, elm);
			}
		);
	}
};

$(document).ready(function(){
	slide.init({imageCount:7,transDelay:2000,staticDelay:4000});
});
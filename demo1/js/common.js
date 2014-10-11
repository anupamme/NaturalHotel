$ = jQuery.noConflict();

var common = {
    init: function(){
        this.setHomeHeight();
        this.resize();
        this.setHotelList();
    },
    setHomeHeight: function(){
        if($('.home-block').length){
            var hbh = $('.home-block').outerHeight() + 100,
                wh = $(window).outerHeight();
            if(hbh < wh){
                $('.content-holder').css('height', wh + 'px');
            }
            else{
                $('.content-holder').css('height', hbh + 'px');
            }
        }
    },
    resize: function(){
        $(window).resize(function(){
            common.setHomeHeight();
        });
    },
    setHotelList: function(){
        if($('.hotel-list').length){
            var hH = $('.hotel-list .graph-holder .graph').innerHeight();
            
            $('.hotel-list .description-holder .photo').each(function(){
                $(this).css('background-image', 'url("'+ $(this).attr('data-src') +'")');
            });
            $('.hotel-list .graph-holder .graph li').each(function(){
                $(this).find('.bar').css('height', hH * $(this).attr('data-perc') / 100);
            });
        }
    }
};
$(document).ready(function(){
	common.init();
});


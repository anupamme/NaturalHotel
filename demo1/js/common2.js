$ = jQuery.noConflict();

var common = {
    reviewFinder: {},
    init: function(){
        this.setHomeHeight();
        this.resize();
        this.windowScroll();
        this.setOverlay();
        this.getHotelList();
        this.revulizeRank();
        this.setSticky();
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
            /* set user photo */
            $('.review-holder .photo').each(function(){
                $(this).css('background-image', 'url("'+ $(this).attr('data-src') +'")');
            });
            /* set graph */
            $('.hotel-list .graph-holder .graph li').each(function(){
                $(this).find('.bar').css('height', hH * $(this).attr('data-perc') / 100);
            });
            
            /* image caraousel */
            $('.hotel-list > li .image').on('click', function(){
                var imageSet = $(this).find('> img').attr('data-img');
                imageSet = eval(imageSet);
                var imageList = '';
                $.each(imageSet, function(i, item){
                    imageList += '<li>'+
                                    '<img src="'+ item +'">'+
                                '</li>';
                });
                var overlay = '<div class="overlay"></div>';
                $('body').append(overlay);
                $('.overlay').animate({opacity:1}, 'slow');
                $.ajax({
                    url:        "template-image-carousel.html",
                    async:      false,
                    success:    function(response){
                        overlay = response;
                    }
                });
                overlay = overlay.replace('{{imageList}}', imageList);
                $('body').append(overlay);
                $('.overlay-holder').animate({opacity:1}, 'slow');
                common.startImageCarousel();
            });
            
            common.setReviewCarousel();
        }
    },
    setReviewCarousel: function(){
        if($('.hotel-list').length){
            var w = $('.hotel-list .review-holder').innerWidth();
            $('.hotel-list .details .bubble').on('click', 'li:not(.selected)', function(){
                var cLi = $(this);
                var ul = cLi.closest('.bubble');
                var ind = ul.find('li').index(cLi);
                var rev = cLi.closest('.details').find('.review-holder > ul');
                var l = ind * w;
                ul.find('li').removeClass('selected');
                cLi.addClass('selected');
                rev.animate({left: -l}, 500, 'swing');
            });
        }
    },
    startImageCarousel: function(){
        var ww = $(window).innerWidth();
        var oh = $('.overlay-holder');
        oh.css('left', (ww - oh.innerWidth()) / 2);
        var imageCarousel = new common.SimpleCarousel();
        imageCarousel.setup();
    },
    SimpleCarousel: function(){
        var carousel = $('.simple-carousel');
        var counter = 1;
        var count = carousel.find('ul.item-list > li').length;
        var itemList = carousel.find('ul.item-list');
        var prev = carousel.find('.nav-button.prev');
        var next = carousel.find('.nav-button.next');
        var left = 0;
        var stageWidth = 0;
        var speedInterval = 500;
        var heightRatio = 0.2873; /* height / width */

        this.setup = function(){
            prev.on('click', function(){
                if(counter > count - 1){
                    left = left + stageWidth;
                    itemList.animate({left: left + 'px'}, speedInterval);
                    counter--;
                }
                else{
                    var remove = itemList.find('> li:last-of-type');
                    remove.remove();
                    itemList.prepend(remove);
                    left = left - stageWidth;
                    itemList.css({left: left + 'px'});
                    left = left + stageWidth;
                    itemList.animate({left: left + 'px'}, speedInterval);
                }
            });
            next.on('click', function(){
                if(counter < count){
                    left = left - stageWidth;
                    itemList.animate({left: left + 'px'}, speedInterval);
                    counter++;
                }
                else{
                    var remove = itemList.find('> li:first-of-type');
                    remove.remove();
                    itemList.append(remove);
                    left = left + stageWidth;
                    itemList.css({left: left + 'px'});
                    left = left - stageWidth;
                    itemList.animate({left: left + 'px'}, speedInterval);
                }
            });
            $(window).resize(this.changeDim);

            this.changeDim();
        };
        this.changeDim = function(){
            stageWidth = $('.simple-carousel').width();
            var liHeight = stageWidth * heightRatio;
            var navButton = carousel.find('.nav-button');
            buttonHeight = navButton.height();
            buttonTop = (liHeight - buttonHeight) / 2;
            carousel.find('ul.item-list').width(stageWidth * count);
            carousel.find('ul.item-list > li').width(stageWidth);
            //carousel.find('ul.item-list > li').height(liHeight);
            //navButton.css('top', buttonTop + 'px');
        };
    },
    setOverlay: function(){
        $(document).on('click', '.overlay', function(){
            $('.overlay').animate({opacity:0}, 'fast', function(){
                $('.overlay').remove();
            });
            $('.overlay-holder').animate({opacity:0}, 'fast', function(){
                $('.overlay-holder').remove();
            });
        });
    },
    getHotelList: function(){
        $('.travel-form input[type="button"]').on('click', function(){
            $.ajax({
                url:        "js/sample-result1.txt",
                async:      false,
                dataType:   "json",
                success:    function(response){
                    common.populateHotelList(response);
                }
            });
            var formH = $('.travel-form').innerHeight();
            var body = $("html, body");
            body.animate({scrollTop:formH}, '1000', 'swing', function(){
                $('.travel-form').closest('.stretch').addClass('sticky');
                $('#hotel-list-holder').closest('.stretch').addClass('sticky-shadow');
            });
        });
        
        var formH = $('.travel-form').innerHeight();
        $(window).on('scroll', function(){
            if($(window).scrollTop() > formH && $('.stretch.sticky').length < 1){
                $('.travel-form').closest('.stretch').addClass('sticky');
                $('#hotel-list-holder').closest('.stretch').addClass('sticky-shadow');
            }
        });
    },
    populateHotelList: function(result){
        var rObj = eval(result),
            jRes = rObj.results,
            hl = '<ul class="hotel-list">',
            hlTemplate = '',
            rvTemplate = '';
        $.ajax({
            url:        "template-hotel-list.html",
            async:      false,
            success:    function(response){
                hlTemplate = response;
            }
        });
        $.ajax({
            url:        "template-hotel-list-review-list.html",
            async:      false,
            success:    function(response){
                rvTemplate = response;
            }
        });
        var hlItem = '';
        $.each(jRes, function(index, item){
            hlItem = hlTemplate;
            hlItem = hlItem.replace('{{hotel-name}}', item.name);
            hlItem = hlItem.replace('{{hotel-address}}', item.Address);
            hlItem = hlItem.replace('{{default-image}}', item.image_link[0]);
            hlItem = hlItem.replace('{{image-list}}', JSON.stringify(item.image_link).replace(/"/g, "'"));
            
            /* review status */
            hlItem = hlItem.replace('{{perc-awesome}}', item.review_stats.awesome);
            hlItem = hlItem.replace('{{perc-good}}', item.review_stats.good);
            hlItem = hlItem.replace('{{perc-ok}}', item.review_stats.okay);
            hlItem = hlItem.replace('{{perc-bad}}', item.review_stats.average);
            hlItem = hlItem.replace('{{perc-worst}}', item.review_stats.bad);
            
            var rvItem = '',
                rvList = '';
            $.each(item.top_reviews, function(ind, review){
                rvItem = rvTemplate;
                rvItem = rvItem.replace('{{user-name}}', review.reviewer_name);
                rvItem = rvItem.replace('{{user-address}}', review.reviewer_place);
                rvItem = rvItem.replace('{{user-photo}}', review.reviewer_photo);
                rvItem = rvItem.replace('{{user-review}}', review.review);
                
                rvList += rvItem;
            });
            hlItem = hlItem.replace('{{review-list}}', rvList);
            
            hl += hlItem;
        });
        hl += '</ul>';
        $('#hotel-list-holder').html(hl);
        common.setHotelList();
    },
    windowScroll: function(){
        //var fh = $('.travel-form').innerHeight();//alert(fh);
        
    },
    revulizeRank: function(){
        if($('#revulize-content').length){
            $('.travel-form').closest('.stretch').addClass('sticky');
            $('#revulize-content').closest('.stretch').addClass('sticky-shadow');
            
            $('#revulize-content .review-list').width($(window).innerWidth() - $('#revulize-content .attributes').width() - 2);
            
            var formH = $('.travel-form').innerHeight();
            $(window).on('scroll', function(){
                if($(window).scrollTop() > formH && $('.stretch.sticky').length < 1){
                    $('.travel-form').closest('.stretch').addClass('sticky');
                    $('#revulize-content').closest('.stretch').addClass('sticky-shadow');
                }
            });
            
            $('#revulize-content .attributes .rank .selection').on('click', function(){
                var rl = $(this).siblings('.rank-list');
                var rank = $(this).attr('data-rank');
                rl.find('li').removeClass('selected');
                rl.find('li[data-rank="'+ rank +'"]').addClass('selected');
                rl.slideDown("fast");
            });

            $('#revulize-content .rank-list').on('click', 'li', function(){
                var cLi = $(this),
                    text = cLi.text(),
                    rank = cLi.attr('data-rank'),
                    rl = cLi.parent(),
                    sel = cLi.closest('.rank').find('.selection');
                cLi.siblings('li').removeClass('selected');
                cLi.addClass('selected');
                sel.attr('data-rank', rank);
                sel.find('.text').text(text);
                rl.slideUp("fast");
            });

            $('#revulize-content ul.choice-list').on('click', 'li span', function(){
                var li = $(this).parent().clone();
                $(this).parent().remove();
                $('#revulize-content ul.attr-list').append(li);
            });

            $('#revulize-content ul.attr-list').on('click', 'li span', function(){
                var li = $(this).parent().clone();
                $(this).parent().remove();
                $('#revulize-content ul.choice-list').append(li);
            });

            $('.review-list').on('click', '.review', function(){
                var rv = $(this),
                    rvf = $(this).siblings('.review-full-view');
                rv.hide();
                rvf.show();
            });

            $('.review-list').on('click', '.review-full-view', function(){
                var rvf = $(this),
                    rv = $(this).siblings('.review');
                rvf.hide();
                rv.show();
            });

            $.ajax({
                url:        "js/review-finder.txt",
                async:      false,
                dataType:   "json",
                success:    function(response){
                    common.reviewFinder = eval(response);
                }
            });

            common.setReviewList();
        }
    },
    setReviewList: function(){
        $('.review-holder .photo').each(function(){
            $(this).css('background-image', 'url("'+ $(this).attr('data-src') +'")');
        });
    },
    setSticky: function(){
        $('.container').on('click', '.stretch.sticky', function(){
            $('.stretch.sticky').removeClass('sticky');
            $('.stretch.sticky-shadow').removeClass('sticky-shadow');
            
            var body = $("html, body");
            body.animate({scrollTop:0}, '500', 'swing');
        });
    }
};

$(document).ready(function(){
	common.init();
});


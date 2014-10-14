$ = jQuery.noConflict();

window.sentimentMap = {}
window.reviewMap = {}
window.hotelDetailMap = {}
window.hotelAttr = {}
window.locationMap = {}
window.purposeOfTraveling = ''
window.purposeToAttributes = {
        'honeymoon': ['food', 'room'],
        'business': ['location', 'amenities', 'transfer']
    }
window.selectedAttributes = []
window.suggestedAttributes = ['overall', 'staff', 'night', 'beach', 'roof']
window.reviewFinder = []
window.reviewLookup = []
window.dummyhotelid = 'g188098-d266043'

var common = {
    
    init: function(){
        this.setHomeHeight();
        this.resize();
        this.windowScroll();
        this.setOverlay();
        //this.getHotelList();
        this.revulizeRank();
        this.setSticky();
        // load all the maps from the file system.
        this.loadFilteringMaps();
        this.setAttributes();
        //this.printReviews();
    },
    loadFilteringMaps: function(){
        
        purposeOfTraveling = 'honeymoon'
        attrList = purposeToAttributes[purposeOfTraveling]
        selectedAttributes = attrList
        
        $.getJSON('data/location_hotel_map/locationtohotel.json', function(data){
            locationMap = data
            $.getJSON('data/out-zermatt/sentiment.json', function(data){
                sentimentMap = data
                $.getJSON('data/reviews/' + dummyhotelid  + '/summary.txt', function(data){
                reviewMap = data[dummyhotelid]
        debugger
                common.printReviews(window.dummyhotelid)
            })
                //common.printReviews(selectedAttributes, sentimentMap, currentHotelId)
                $.getJSON('data/hotels/hotelDetail.json', function(data){
                    hotelDetailMap = data
                })
            })
        })
        
        $.getJSON('data/out-zermatt/hotel_sentiment.json', function(data){
                hotelAttr = data
        })
        // Load when revulize is hit.
        
        
        
    },
    hotelSelcted: function(hotelid){
        // load reviews for that particular hotel
    },
    searchStarted: function(purpose, location){
        // read the search params and location.
        // filter hotels and show relevant hotels. 
        // fetch reviews for this location and show top 5 reviews for each hotel.
        
        common.getHotelList()
    },
    printReviews: function(currentHotelId) {
        var results = this.selectReviews(selectedAttributes, sentimentMap)
            results = common.filterReviews(results, currentHotelId)
            //results = removeDuplicates(results)
            // do look up in reviewmap for these reviews.
            reviewLookup = []
            for (res in results){
                reviewObj = reviewMap[res]
                reviewLookup[res] = reviewObj // dangerous and writing to global var.
            }
        console.log('Total Resutls: ' + results.length)
            common.refreshReviews()
            return results.length
    },
    setAttributes: function(){
        $('.attr-list').children().remove()
        $('.choice-list').children().remove()
        for (var attr in selectedAttributes) {
            $('.choice-list').append('<li>' + selectedAttributes[attr] + '<span></span></li>')
        }
        for (var attr in suggestedAttributes) {
            $('.attr-list').append('<li>' + suggestedAttributes[attr] + '<span></span></li>')
        }
    },
    // get AttributeDetails is for the pop up display of infographics.
    getAttributeDetails: function(hotelid){
//        {'awesome': (['pool', 'food'], 33), 'good': [('service', 22), ('overall', 11)]}
        // intermediate results
        //        {'awesome': {'pool': 22, 'food': 33}, 'good': {'service': 22, 'overall': 11}}
        //return {'0': ([], 0), '1': ([], 0), '2': ([], 0), '3': ([], 0), '4': ([], 0)}
        var attrArr = hotelAttr[hotelid]
        var inter = {}
        for (val in attrArr){
            var attr = attrArr[val][0]
            var senti = attrArr[val][1]
            var current
            if (senti in inter) {
                current = inter[senti]
            } 
            else {
                current = {}
                inter[senti] = current
            }
            if (attr in current){
                current[attr] = current[attr] + 1
            }
            else {
                current[attr] = 1
            }
        }
        // find which attributes are in max over all sentiments and assign it to that sentiment.
        var maxInter = {} // from attribute to sentiment (where it is max.) 
        for (var senti in inter){
            var attMap = inter[senti]
            for (var attKey in attMap){
                var attNum = attMap[attKey]
                if (attKey in maxInter){
                    var maxSoFar = maxInter[attKey]
                    var maxSentiSoFar = maxSoFar[0]
                    var maxValSoFar = maxSoFar[1]
                    if (attNum > maxValSoFar){
                        maxInter[attKey] = [senti, attNum]
                    }
                    else {
                        // do nothing.
                    }
                }
                else {
                    maxInter[attKey] = [senti, attNum]
                }
            }
        }
        // final result: 
        var final = {} // contain values like: senti => [[att], num]
        for (var att in maxInter){
            var senti = maxInter[att][0]
            var value = maxInter[att][1]
            if (senti in final){
                final[senti][0].push(att)
                updatedNum = Math.max(value, final[senti][1])
                final[senti][1] = updatedNum
            }
            else {
                final[senti] = [[att], value]
            }
        }
        // normalize results
        for (var i = 0; i < 5; i++){
            if (i in final){
                
            }
            else {
                final[i] = [[], 0]
            }
        }
        return final
    },
    selectReviews: function(selectedAttributes, sentimentMap){
      // find the selected reviews.
        var results_4 = []
        var results_3 = []
        var results_2 = []
        for (var attr in selectedAttributes){
               var sel = sentimentMap["('" + selectedAttributes[attr] + "', 4.0)"]
               if (sel !== undefined && sel.length > 0){
                    results_4 = sel
               }
               sel = sentimentMap["('" + selectedAttributes[attr] + "', 3.0)"]
               if (sel !== undefined && sel.length > 0){
                    results_3 = sel
               }
               sel = sentimentMap["('" + selectedAttributes[attr] + "', 2.0)"]
               if (sel !== undefined && sel.length > 0){
                    results_2 = sel
               }
        }
        return {"results4" : results_4, "results3" : results_3, "results2": results_2}
    },
    
    filterReviews: function(results_super, currenthotelid){
        results = {}
        for (result in results_super){
            args = results_super[result]
            for (val in args){
                var hotelid = args[val][0]
                var reviewid = args[val][1]
                if (hotelid == currenthotelid){
                    results[reviewid] = 'True'
                }
            }
        }
        return Object.keys(results)
    },
    
    refreshReviews: function() {
        // clean current reviews.
        debugger
        $('.review-list').children().remove()
        results = []
        for (var i = 1; i < reviewLookup.length; i++){
            results.push(reviewLookup[i.toString()])
        }
        this.showReviewList(results)
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
                    url:        "templates/template-image-carousel.html",
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
        //var place =  parseCookieValue('place') // XXX: this place is currently in format Paris, France. We need to convert it into correct format: PARIS:FRANCE.
        locationKey = 'ZERMATT:SWITZERLAND'
        
        results_super = common.selectReviews(selectedAttributes, sentimentMap)
        
        // find hotels for this location.
        superset = locationMap[locationKey]
        // for each of this hotel do a look up and create a detail json file
        finalhotels = []
        finalReviews = {}
        for (resultKind in results_super){
            var results = results_super[resultKind]
            for (res in results){
                hotelid = results[res][0]
                reviewid = results[res][1]
                if (hotelid in superset){
                    finalhotels.push(hotelid)
                    if (hotelid in finalReviews){
                        finalReviews[hotelid].push(reviewid)
                    }
                    else {
                        finalReviews[hotelid] = [reviewid]
                    }
                }
                else {
                    console.log('hotel id not there: ' + hotelid)
                }
            }
        }
        // fetch json for these final hotels.
        
        // build the json for hotels in sample json text file format.
        hotelListJson = {}
        for (hotelid in finalhotels){
            attrDetails = common.getAttributeDetails(finalhotels[hotelid])
            details = hotelDetailMap[finalhotels[hotelid]]
            if (details["images"].length < 5)
                continue
            details["sentiment"] = attrDetails
            details["top_reviews"] = finalReviews[finalhotels[hotelid]].slice(0, 5)
            hotelListJson[finalhotels[hotelid]] = details
        }
        common.populateHotelList(hotelListJson)
        // visit the location page and parse the details.
        // build the hotel map.
//        $('.travel-form input[type="button"]').on('click', function(){
//            $.ajax({
//                url:        "js/sample-result1.txt",
//                async:      false,
//                dataType:   "json",
//                success:    function(response){
//                    common.populateHotelList(response);
//                }
//            });
            
            
            
               $('.cContent').css('min-height',0);
          //  var formH = $('.travel-form').innerHeight();
            var formH = 500 - $('.cContent').innerHeight()-$('.button-holder').innerHeight;
            var body = $("html, body");
            body.animate({scrollTop:formH}, '1000', 'swing', function(){
                $('.travel-form').closest('.stretch').addClass('sticky');
                $('#hotel-list-holder').closest('.stretch').addClass('sticky-shadow');
            });
            $('.cContent').slideUp(400);
            $('.button-holder').slideUp(400);
             $('.goBackForm').fadeIn(1000);
               $('#hotel-list-holder').fadeIn(1000);
        //});
        
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
            url:        "templates/template-hotel-list.html",
            async:      false,
            success:    function(response){
                hlTemplate = response;
            }
        });
        $.ajax({
            url:        "templates/template-hotel-list-review-list.html",
            async:      false,
            success:    function(response){
                rvTemplate = response;
            }
        });
        var hlItem = '';
        $.each(rObj, function(index, item){
            hlItem = hlTemplate;
            hlItem = hlItem.replace('{{hotel-name}}', item.title.substring(0, 35));
            hlItem = hlItem.replace('{{hotel-address}}', item.locality);
            hlItem = hlItem.replace('{{default-image}}', item.images[1]);
            hlItem = hlItem.replace('{{image-list}}', JSON.stringify(item.images.slice(1, 11)).replace(/"/g, "'"));
            /* review status */
            hlItem = hlItem.replace('{{perc-awesome}}', item.sentiment[4][1]);
            hlItem = hlItem.replace('{{perc-good}}', item.sentiment[3][1]);
            hlItem = hlItem.replace('{{perc-ok}}', item.sentiment[2][1]);
            hlItem = hlItem.replace('{{perc-bad}}', item.sentiment[1][1]);
            hlItem = hlItem.replace('{{perc-worst}}', item.sentiment[0][1]);
            
            var rvItem = '',
                rvList = '';
            $.each(item.top_reviews, function(ind, reviewid){
                rvItem = rvTemplate;
                rvItem = rvItem.replace('{{user-name}}', reviewMap[reviewid]['ReviewerName']);
                rvItem = rvItem.replace('{{user-address}}', reviewMap[reviewid]['Place']);
                rvItem = rvItem.replace('{{user-photo}}', reviewMap[reviewid]['ReviewerImage']);
                rvItem = rvItem.replace('{{user-review}}', common.summarize( reviewMap[reviewid].review, 4, 270));
                
                rvList += rvItem;
            });
            hlItem = hlItem.replace('{{review-list}}', rvList);
            
            hl += hlItem;
        });
        hl += '</ul>';
        $('#hotel-list-holder').html(hl);
        common.setHotelList();
    },
    summarize: function(text, num, max){
        var stopwords = {'.' : true, '!' : true, '?' : true}
        var minLength = 10
        var lastIndex = 0
        var totalSen = 0
        var index = 0
        while (index < text.length){
            if (text[index] in stopwords){
                if (index - lastIndex >  minLength){
                    totalSen += 1
                    lastIndex = index
                    if (totalSen === num)
                        break
                }
            }
            index += 1
        }
        console.log('summary length: ' + index + " : " + max)
        if (index > max){
            return common.summarize(text, num - 1, max)
        }
        console.log('returning length: ' + index + " : " + max)
        return text.substring(0, index)
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

            $('ul.choice-list').on('click', function(){
                console.log('click.')
                
                debugger
                
            })
            
            $('#revulize-content ul.choice-list').on('click', 'li span', function(){
                var attr = $(this).parent().text()
                for (var i = 0; i < selectedAttributes.length; i++){
                    if (selectedAttributes[i] === attr){
                        selectedAttributes.splice(i, 1)
                        break   
                    }
                }
                var li = $(this).parent().clone();
                $(this).parent().remove();
                $('#revulize-content ul.attr-list').append(li);
                debugger
                common.printReviews(window.dummyhotelid)
            });

            $('#revulize-content ul.attr-list').on('click', 'li span', function(){
                debugger
                var attr = $(this).parent().text()
                selectedAttributes.push(attr)

                
                var li = $(this).parent().clone();
                $(this).parent().remove();
                $('#revulize-content ul.choice-list').append(li);
                debugger
                common.printReviews(window.dummyhotelid)
            });

            $.ajax({
                url:        "js/review-finder.txt",
                async:      false,
                dataType:   "json",
                success:    function(response){
                    common.reviewFinder = eval(response);
                }
            });
            
//            $.ajax({
//                url:        "js/review-lookup.txt",
//                async:      false,
//                dataType:   "json",
//                success:    function(response){
//                    //common.reviewLookup = eval(response);
//                }
//            });

            //common.populateReviewList();
        }
    },
    setReviewList: function(){
        $('.review-holder .photo').each(function(){
            $(this).css('background-image', 'url("'+ $(this).attr('data-src') +'")');
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
    },
    setSticky: function(){
        $('.container').on('click', '.stretch.sticky', function(){
            window.location.href = 'form.html';
        });
    },
//    populateReviewList: function(){
//        var arrRevList = [];
//        arrRevList.push(common.reviewLookup["1"]);
//        arrRevList.push(common.reviewLookup["2"]);
//        arrRevList.push(common.reviewLookup["3"]);
//        arrRevList.push(common.reviewLookup["4"]);
//        arrRevList.push(common.reviewLookup["5"]);
//        arrRevList.push(common.reviewLookup["6"]);
//        common.showReviewList(arrRevList);
//    },
    showReviewList: function(rl){
        var rul = '<ul>';
        var rvTemplate = '';
        $.ajax({
            url:        "templates/template-review-list.html",
            async:      false,
            success:    function(response){
                rvTemplate = response;
            }
        });
        $.each(rl, function(i, item){
            var li = rvTemplate;
            li = li.replace('{{user-name}}', item['ReviewerName']);
            li = li.replace('{{user-photo}}', item['ReviewerImage']);
            li = li.replace('{{user-address}}', item['Place']);
            var summary = item.review.substring(0, 150) + '...';
            li = li.replace('{{summary}}', summary);
            li = li.replace('{{review-full}}', item.review);
            
            rul += li;
        });
        rul += '</ul>';
        $('.review-list').html(rul);
        
        common.setReviewList();
    }
};

$(document).ready(function(){
	common.init();
});

parseCookieValue = function(param) {
                cookieSet = document.cookie.split(';')
                for (cook in cookieSet) {
                    value = cookieSet[cook];
                    name = value.substring(0, value.indexOf('='));
                    if (name.trim() === param) {
                        return value.substring(value.indexOf('=') + 1)
                    }
                }
                return undefined
            }

// show up hotels is clicked.
$('.button-holder').on('click', function(arg){
    debugger
    place = $('.op0 a').text()
    document.cookie = 'place=' + place
    purpose = $('.op1 a').text()
    document.cookie = 'purpose=' + purpose
    
    common.searchStarted(purpose, place)
})
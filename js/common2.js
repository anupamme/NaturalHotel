$ = jQuery.noConflict();

window.sentimentMap = {}
window.reviewMap = {}
window.hotelDetailMap = {}
window.hotelAttr = {}
window.locationMap = {}
window.attributeMap = {}
window.purposeOfTraveling = ''
//window.purposeToAttributes = {
//        'honeymoon': ['food', 'room'],
//        'business': ['location', 'amenities', 'transfer']
//    }
window.selectedAttributes = ['overall', 'staff', 'night', 'beach', 'roof', 'amenities', 'transfer', 'food', 'location']
window.suggestedAttributes = ['overall', 'staff', 'night', 'beach', 'roof']
window.superResults = []
window.excludeList = {'g188098-d619925': true, 'g188098-d550027': true}
window.purposeMap = {}
window.locationKey = 'ZERMATT:SWITZERLAND'

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
        //this.printReviews();
    },
    loadFilteringMaps: function(){
        
        $.getJSON('data/location_hotel_map/locationtohotel.json', function(data){
            locationMap = data
            $.getJSON('data/out-zermatt/sentiment.json', function(data){
                sentimentMap = data
                // for loop to read reviews for all the hotel ids.
                debugger
                window.superResults = common.selectReviews(selectedAttributes, sentimentMap)
                
                $.getJSON('data/reviews/summary.txt', function(data){
                    debugger
                    reviewMap = data
                })
                $.getJSON('data/hotels/hotelDetail.json', function(data){
                    hotelDetailMap = data
                })
                $.getJSON('data/purpose/honeymoon.json', function(data){
                    purposeMap = data
                })
            })
        })
        
        $.getJSON('data/out-zermatt/hotel_sentiment.json', function(data){
                hotelAttr = data
        })
        $.getJSON('data/attribute-cloud.json', function(data){
            attributeMap = data
         })
    },
    hotelSelcted: function(hotelid){
        // load reviews for that particular hotel
    },
    searchStarted: function(purpose, location){
        common.getHotelList(window.locationKey, purpose)
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
                
                //var k=common.getAttributeDetails(window.dummyhotelid);
                
                overlay = overlay.replace('{{imageList}}', imageList);
                $('body').append(overlay);
                $('.overlay-holder').animate({opacity:1}, 'slow');
                common.startImageCarousel();
            });
            
            
            
           
          
          function xyz() {
               $('.overlay').click(function() { $('.overlay-holder1').hide(); });
          }
            
            
               /* Graph caraousel */
            $('.graph > li ').on('click', function(){
                debugger
                var classname=$(this).attr('class');
                var hotelId = $(this).attr('data-valueofhotel');
                //imageSet = eval(imageSet);
                    imageList="";
                var overlay = '<div class="overlay"><span class="iconclose">Close</span></div>';
                $('body').append(overlay);
                $('.overlay').animate({opacity:1}, 'slow');
                $.ajax({
                    url:        "templates/template-bak.html",
                    async:      false,
                    success:    function(response){
                        overlay = response;
                    }
                });
                 $.ajax({
                    url:        "templates/template-graph.html",
                    async:      false,
                    success:    function(response){
                        imageList = response;
                    }
                });
              
                overlay = overlay.replace('{{imageList}}', imageList);
                console.log('hotelid: ' + hotelId)
                 var k=common.getAttributeDetails(hotelId);
                 var l=0,m,y=1;
                 var ullist="";
                var replacetext="{{ListOfitems}}";
                var replacePeople="{{people}}";
                   for(var j=0;j<=4;j++)
                   {
                       peoplecount="";
                       ullist="";
                       replacetext="{{ListOfitems"+j+"}}";
                       replacePeople="{{people"+j+"}}";
                       peoplecount=k[j][y];
                       m=k[j][l].length;
                       if(m != 0) {
                       for(var t=0;t<m;t++)
                       {
                           ullist+="<li>"+k[j][l][t]+"</li>";
                       }
                       }
                         overlay=overlay.replace(replacePeople,peoplecount);
                         overlay=overlay.replace(replacetext,ullist);
                   }

                
                    pslectedYes="pSelected";
                    pslectedNo="";
                    if(classname=="awesome")
                    {
                           overlay=overlay.replace('{{selectedClass1}}',pslectedYes);
                    }
                    else {
                         overlay=overlay.replace('{{selectedClass1}}',pslectedNo);
                    }
                
                   if(classname=="good")
                    {
                           overlay=overlay.replace('{{selectedClass2}}',pslectedYes);
                    }
                    else {
                         overlay=overlay.replace('{{selectedClass2}}',pslectedNo);
                    }
                  if(classname=="ok")
                    {
                           overlay=overlay.replace('{{selectedClass3}}',pslectedYes);
                    }
                    else {
                         overlay=overlay.replace('{{selectedClass3}}',pslectedNo);
                    }
                 if(classname=="bad")
                    {
                           overlay=overlay.replace('{{selectedClass4}}',pslectedYes);
                    }
                    else {
                         overlay=overlay.replace('{{selectedClass4}}',pslectedNo);
                    }
                 if(classname=="worst")
                    {
                           overlay=overlay.replace('{{selectedClass5}}',pslectedYes);
                    }
                    else {
                         overlay=overlay.replace('{{selectedClass5}}',pslectedNo);
                    }
                
                
                $('body').append(overlay);
                $('.overlay-holder1').animate({opacity:1}, 'slow');
                xyz();
                if($(this).text()==$('.pHeader').text())
               $('.pHeader').addClass('pSelected');
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
    getHotelList: function(locationKey, purpose){
        //var place =  parseCookieValue('place') // XXX: this place is currently in format Paris, France. We need to convert it into correct format: PARIS:FRANCE.
        debugger
        results_super = window.superResults
        // results for this purpose
        purposeHotels = window.purposeMap[purpose]
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
                    if (hotelid in purposeHotels){
                        finalhotels.push(hotelid)
                        if (reviewid in purposeHotels[hotelid]){
                            if (hotelid in finalReviews){
                                finalReviews[hotelid].push(reviewid)
                            }
                            else {
                                finalReviews[hotelid] = [reviewid]
                            }
                        }
                    }
                }
                else {
                    console.log('hotel id not there: ' + hotelid)
                }
            }
        }
        // fetch json for these final hotels.
        console.log('Final Hotels: ' + finalReviews.length)
        // build the json for hotels in sample json text file format.
        hotelListJson = {}
        for (hotelid in finalhotels){
            attrDetails = common.getAttributeDetails(finalhotels[hotelid])
            details = hotelDetailMap[finalhotels[hotelid]]
            if (details["images"].length < 5)
                continue
            details["sentiment"] = attrDetails
            if (finalhotels[hotelid] in finalReviews){
                details["top_reviews"] = finalReviews[finalhotels[hotelid]].slice(0, 5)
            }
            else {
                continue
            }
            hotelListJson[finalhotels[hotelid]] = details
        }
        common.populateHotelList(hotelListJson)
        
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
        for (var res in rObj){
//            key = item.key;
//            value = item.value;
            debugger
            if (res in window.excludeList){
                continue
            }
            item = rObj[res]
            hlItem = hlTemplate;
            hlItem = hlItem.replace('{{hotel-name}}', item.title.substring(0, 35));
            hlItem = hlItem.replace('{{hotel-address}}', item.locality);
            hlItem = hlItem.replace('{{default-image}}', item.images[1]);
            hlItem = hlItem.replace('{{image-list}}', JSON.stringify(item.images.slice(1, 11)).replace(/"/g, "'"));
            /* review status */
            debugger
            hlItem = hlItem.replace('{{perc-index0}}', res);
            hlItem = hlItem.replace('{{perc-awesome}}', item.sentiment[4][1]);
            hlItem = hlItem.replace('{{perc-good}}', item.sentiment[3][1]);
            hlItem = hlItem.replace('{{perc-ok}}', item.sentiment[2][1]);
            hlItem = hlItem.replace('{{perc-bad}}', item.sentiment[1][1]);
            hlItem = hlItem.replace('{{perc-worst}}', item.sentiment[0][1]);
            hlItem = hlItem.replace('{{perc-index}}', res);
            hlItem = hlItem.replace('{{perc-index1}}', res);
            hlItem = hlItem.replace('{{perc-index2}}', res);
            hlItem = hlItem.replace('{{perc-index3}}', res);
            hlItem = hlItem.replace('{{perc-index4}}', res);
            
            var rvItem = '',
                rvList = '';
            $.each(item.top_reviews, function(ind, reviewid){
                rvItem = rvTemplate;
                rvItem = rvItem.replace('{{user-name}}', reviewMap[res][reviewid]['ReviewerName']);
                rvItem = rvItem.replace('{{user-address}}', reviewMap[res][reviewid]['Place']);
                rvItem = rvItem.replace('{{user-photo}}', reviewMap[res][reviewid]['ReviewerImage']);
                rvItem = rvItem.replace('{{user-review}}', common.summarize(reviewMap[res][reviewid].review, 4, 270))
                
                rvList += rvItem;
            });
            hlItem = hlItem.replace('{{review-list}}', rvList);
            
            hl += hlItem;
        }
        hl += '</ul>';
        $('#hotel-list-holder').html(hl);
        common.setHotelList();
    },
    summarize: function(text, num, max){
        if (num == 1){
            return text.substr(0, max)
        }
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
        if (index > max){
            return common.summarize(text, num - 1, max)
        }
        return text.substring(0, index)
    },
    windowScroll: function(){
        //var fh = $('.travel-form').innerHeight();//alert(fh);
        
    },
    filter: function(searchTermArr, textToCheck) {
        for (var searchTerm in searchTermArr){
            var searchPattern = new RegExp('('+searchTermArr[searchTerm]+')', 'ig'); 
            textToCheck = textToCheck.replace(searchPattern, '<span style="font-family: DIN_BLACK; font-weight: bold">$1</span>'); 
        }
        return textToCheck;
    },
    highlightSetOfKeyWords: function(text, keywordSet, keywordMap){
        var lowerText = text.toLowerCase()
        for (var key in keywordSet){
            var wordList = keywordMap[keywordSet[key]]
            text = common.filter(wordList, text)
        }
        return text
    },
    setSticky: function(){
        $('.container').on('click', '.stretch.sticky', function(){
            window.location.href = 'form.html';
        });
    },
    revulizeRank: function(){
        if($('#revulize-content').length){
            $('.travel-form').closest('.stretch').addClass('sticky');
            $('#revulize-content').closest('.stretch').addClass('sticky-shadow');
            
            $('#revulize-content .review-list').width(757);
            
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
            $.ajax({
                url:        "js/review-finder.txt",
                async:      false,
                dataType:   "json",
                success:    function(response){
                    common.reviewFinder = eval(response);
                }
            });
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
    revulizeRank: function(){
        if($('#revulize-content').length){
            $('.travel-form').closest('.stretch').addClass('sticky');
            $('#revulize-content').closest('.stretch').addClass('sticky-shadow');
            
            $('#revulize-content .review-list').width(757);
            
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
            $.ajax({
                url:        "js/review-finder.txt",
                async:      false,
                dataType:   "json",
                success:    function(response){
                    common.reviewFinder = eval(response);
                }
            });
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
    printReviews: function(currentHotelId) {
        debugger
        var results = window.superResults
            results = common.filterReviews(results, currentHotelId)
            //results = removeDuplicates(results)
            // do look up in reviewmap for these reviews.
            var reviewLookup = {}
            for (res in results){
                reviewObj = reviewMap[currentHotelId][res]
                reviewLookup[res] = reviewObj // dangerous and writing to global var.
            }
        console.log('Total Resutls: ' + results.length)
        common.refreshReviews(reviewLookup)
        return reviewLookup
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
    size: function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
    return size;
    },
    refreshReviews: function(reviewLookUp) {
        // clean current reviews.
        $('.review-list').children().remove()
        results = []
        var length = common.size(reviewLookUp)
        for (var i = 1; i < length; i++){
            results.push(reviewLookUp[i])
        }
        this.showReviewList(results)
    },
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
            var summary = common.summarize(item.review, 4, 250);
            var highlightedSummary = common.highlightSetOfKeyWords(summary, selectedAttributes, attributeMap)
            li = li.replace('{{summary}}', highlightedSummary);
            var highlightedReview = common.highlightSetOfKeyWords(item.review, selectedAttributes, attributeMap)
            li = li.replace('{{review-full}}', highlightedReview);
            
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


// show up hotels is clicked.
$('.button-holder').on('click', function(arg){
    debugger
    console.log('show up clicked.')
    place = $('.op0 a').text()
    document.cookie = 'place=' + place
    purpose = $('.op1 a').text()
    document.cookie = 'purpose=' + purpose
    
    common.searchStarted(purpose.toLowerCase(), place)
    
    $('.foot').find('input').on('click', function(arg) { 
        debugger; 
        document.cookie = 'attributes=' + selectedAttributes.toString()
        // find which hotel has been clicked and filter reviews only for that hotel.
        // also put the name of that hotel.
        var hotelId = $($(this).parentsUntil('.details')[2]).attr('data-valueofhotel')
        document.cookie = 'hotelid=' + hotelId
        var results = common.printReviews(hotelId)
        common.setAttributes()
        sessionStorage.setItem('reviews', JSON.stringify(results))
    });
});
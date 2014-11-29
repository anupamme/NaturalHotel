$ = jQuery.noConflict();

window.sentimentMap = {}
window.reviewMap = {}
window.hotelDetailMap = {}
window.hotelAttr = {}
window.locationMap = {}
window.attributeMap = {}
window.superResults = []
window.excludeList = {'g188098-d619925': true, 'g188098-d550027': true}
window.purposeMap = {}
window.foodMap = {}
window.locationKey = 'ZERMATT:SWITZERLAND'
window.subAttrIndexMap = {}
window.subAttrWordCloud = {}
window.hotelListMp={}

var common = {
    
    init: function(){
        this.setHomeHeight();
        this.resize();
        this.windowScroll();
        this.setOverlay();
        this.revulizeRank();
        this.setSticky();
        this.loadFilteringMaps();
    },
    loadFilteringMaps: function(){
        
        $.getJSON('data/location_hotel_map/locationtohotel.json', function(data){
            locationMap = data
            $.getJSON('data/out-zermatt/sentiment.json', function(data){
                sentimentMap = data
                // for loop to read reviews for all the hotel ids.
                $.getJSON('data/reviews/summary.txt', function(data){
                    window.reviewMap = data
                })
                $.getJSON('data/hotels/hotelDetail.json', function(data){
                    hotelDetailMap = data
                })
                $.getJSON('data/purpose/purpose.json', function(data){
                    purposeMap = data
                })
                $.getJSON('data/purpose/foodIndex.json', function(data){
                    foodMap = data
                })
            })
        })
       

        
        $.getJSON('data/out-zermatt/hotel_sentiment.json', function(data){
                hotelAttr = data
        })
        $.getJSON('data/attribute-cloud.json', function(data){
            attributeMap = data
         })
        $.getJSON('data/purpose/foodIndex.json', function(data){
            subAttrIndexMap['food'] = data
         })
        $.getJSON('data/purpose/view/viewIndex.json', function(data){
            subAttrIndexMap['view'] = data
         })
        $.getJSON('data/purpose/loc/locIndex.json', function(data){
            subAttrIndexMap['loc'] = data
         })
        $.getJSON('data/purpose/amenity/amenityIndex.json', function(data){
            subAttrIndexMap['amenity'] = data
         })
        $.getJSON('data/foodtype.json', function(data){
            var reverseFoodTypeMap = data
           
            var foodTypeAttr = {}
            for (var key in reverseFoodTypeMap){
                foodTypeAttr = common.addOrInsert(foodTypeAttr, reverseFoodTypeMap[key], key)
            }
            subAttrWordCloud['food'] = foodTypeAttr
         })
        $.getJSON('data/purpose/view/view.json', function(data){
            var reverseFoodTypeMap = data
            var foodTypeAttr = {}
            for (var key in reverseFoodTypeMap){
                foodTypeAttr = common.addOrInsert(foodTypeAttr, reverseFoodTypeMap[key], key)
            }
            subAttrWordCloud['view'] = foodTypeAttr
         })
        $.getJSON('data/purpose/loc/loc.json', function(data){
            var reverseFoodTypeMap = data
            var foodTypeAttr = {}
            for (var key in reverseFoodTypeMap){
                foodTypeAttr = common.addOrInsert(foodTypeAttr, reverseFoodTypeMap[key], key)
            }
            subAttrWordCloud['loc'] = foodTypeAttr
         })
        $.getJSON('data/purpose/amenity/amenity.json', function(data){
            var reverseFoodTypeMap = data
            var foodTypeAttr = {}
            for (var key in reverseFoodTypeMap){
                foodTypeAttr = common.addOrInsert(foodTypeAttr, reverseFoodTypeMap[key], key)
            }
            subAttrWordCloud['amenity'] = foodTypeAttr
         })
    },
    hotelSelcted: function(hotelid){
        // load reviews for that particular hotel
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
        var results = {}
        for (var index in selectedAttributes){
            var sub = []
            var attr = selectedAttributes[index]
            var sel = sentimentMap["('" + attr + "', 4.0)"]
               if (sel !== undefined && sel.length > 0){
                    sub = sub.concat(sel)
               }
               sel = sentimentMap["('" + attr + "', 3.0)"]
               if (sel !== undefined && sel.length > 0){
                    sub = sub.concat(sel)
               }
               sel = sentimentMap["('" + attr + "', 2.0)"]
               if (sel !== undefined && sel.length > 0){
                    sub = sub.concat(sel)
               }
            results[attr] = sub
        }
        // {attr -> [(hotel, review)]}
        return results
    },
    
    filterReviews: function(results_super, currenthotelid){
        results = {}
        for (attr in results_super){
            for (val in results_super[attr]){
                var hotelid = results_super[attr][val][0]
                var reviewid = results_super[attr][val][1]
                if (hotelid == currenthotelid){
                    results = common.addOrInsert(results, attr, reviewid)
                }
            }
        }
        // output format: attr -> [reviewid]
        return results
    },
    
    addOrInsert: function(obj, key, val){
        if (key in obj){
            obj[key].push(val)
        }
        else {
            obj[key] = [val]
        }
        return obj
    },
    
    selectReviewsForSubAttributes: function(selectedAttr, subAttrMap, subAttrIndexMap, hotelId, attrReviewIdMap)
    {
        var final = {}
        for (var index in selectedAttr){
            var attr = selectedAttr[index]
            if (attr in subAttrMap){
                for (var subAtt in subAttrMap[attr]){
                    final[subAttrMap[attr][subAtt]] = subAttrIndexMap[attr][subAttrMap[attr][subAtt]][hotelId]
                }
            }
            else {
                final[attr] = attrReviewIdMap[attr]
            }
        }
        return final
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
            
            function readListOfValuesFromReview(listValues) {
                var ullist="";
                 for(var i in listValues)
                {
                     ullist+="<li>"+listValues[i]+"</li>";
                }
                return ullist;
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
                 var item=common.getHotelListMp();
                if($.isEmptyObject(item)) {
                     var hotelListSessionData=sessionStorage.getItem("hotelList");
                      item = $.parseJSON(hotelListSessionData); 
                }
                for(var itemMatched in item.items)
                {
                    if(item.items[itemMatched].hotelid==hotelId)
                    {
                        hotelId=itemMatched;
                        break;
                    }
                }
       
                var replacetext="{{ListOfitems}}";
                
                overlay=overlay.replace("{{awesome_people}}",item.items[hotelId].attributes[4].people);
                overlay=overlay.replace("{{good_people}}",item.items[hotelId].attributes[3].people);
                overlay=overlay.replace("{{ok_people}}",item.items[hotelId].attributes[2].people);
                overlay=overlay.replace("{{bad_people}}",item.items[hotelId].attributes[1].people);
                overlay=overlay.replace("{{worst_people}}",item.items[hotelId].attributes[0].people);   
                
                if(item.items[hotelId].attributes[4].numpeople !=0){               
                overlay=overlay.replace("{{awesome_values}}",readListOfValuesFromReview(item.items[hotelId].attributes[4].views))
                }
                if(item.items[hotelId].attributes[3].numpeople !=0 ) {             
                overlay=overlay.replace("{{good_values}}",readListOfValuesFromReview(item.items[hotelId].attributes[3].views))
                }
                if(item.items[hotelId].attributes[2].numpeople !=0 ) {
                overlay=overlay.replace("{{ok_values}}",readListOfValuesFromReview(item.items[hotelId].attributes[2].views))
                }
                if(item.items[hotelId].attributes[1].numpeople !=0 ) {
                overlay=overlay.replace("{{bad_values}}",readListOfValuesFromReview(item.items[hotelId].attributes[1].views))
                }
                if(item.items[hotelId].attributes[0].numpeople !=0 ) {
                overlay=overlay.replace("{{worst_values}}",readListOfValuesFromReview(item.items[hotelId].attributes[0].views))
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
        results_super = window.superResults // format is {attr -> [(hotel, review)] }
        // results for this purpose
        purposeHotels = window.purposeMap[purpose]
        // find hotels for this location.
        superset = locationMap[locationKey]
        // for each of this hotel do a look up and create a detail json file
        finalhotels = []
        finalReviews = {}
        for (resultKind in results_super){ // resultKind is the attribute.
            var results = results_super[resultKind] // format is [(hotel, review)]
            for (res in results){           // res is the index
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
        return hotelListJson
    },
    getHotelListFromServer:function(queryParams) {
         $.ajax({
             type: "POST",
               async: true,
                contentType: "application/json",
                data: queryParams,
                url: "https://review-viz.appspot.com/_ah/api/helloworld/v1/hellogreeting/",
                success: function(response){
                    hotelListMp = response;
                },
            error: function(error){
                $.ajax({
                type: "GET",
                async: false,
                url: "https://review-viz.appspot.com/_ah/api/helloworld/v1/hellogreeting/",
                success: function(response){
                    hotelListMp = response;
                }
                });
            }
        },2000);
    },
    getHotelListMp: function() {
        return hotelListMp;
    },
    checkURL: function(url) {
        return(url.match(/\.(gif)$/) != null);
    },
    animateHotelList: function() {
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
        for (var res in rObj.items){
//            key = item.key;
//            value = item.value;
            
            if (res in window.excludeList){
                continue
            }
            
            item = rObj.items[res]
            
            var customimages=[],k=0;
            for(var img in item.images)
            {
                  if(!common.checkURL(item.images[img]))
                  {
                      customimages[k]=item.images[img];
                      k++;
                  }
            }
            if(customimages.length != 0)
            {
            hlItem = hlTemplate;
            hlItem = hlItem.replace('{{hotel-name}}', item.name.substring(0, 35));
            hlItem = hlItem.replace('{{hotel-address}}', item.address);
            hlItem = hlItem.replace('{{default-image}}', customimages[0]);
            hlItem = hlItem.replace('{{image-list}}', JSON.stringify(customimages.slice(1, 11)).replace(/"/g, "'"));
            hlItem = hlItem.replace('{{perc-index0}}',item.hotelid);
            hlItem = hlItem.replace('{{perc-awesome}}', item.attributes[4].percentageAttr);
            hlItem = hlItem.replace('{{perc-good}}', item.attributes[3].percentageAttr);
            hlItem = hlItem.replace('{{perc-ok}}', item.attributes[2].percentageAttr);
            hlItem = hlItem.replace('{{perc-bad}}', item.attributes[1].percentageAttr);
            hlItem = hlItem.replace('{{perc-worst}}', item.attributes[0].percentageAttr);
            hlItem = hlItem.replace('{{perc-index}}',item.hotelid);
            hlItem = hlItem.replace('{{perc-index1}}',item.hotelid);
            hlItem = hlItem.replace('{{perc-index2}}',item.hotelid);
            hlItem = hlItem.replace('{{perc-index3}}',item.hotelid);
            hlItem = hlItem.replace('{{perc-index4}}',item.hotelid);
            
            var rvItem = '', rvList = '';
            var hotelReviews=item.reviews;
            for(var i in hotelReviews)
            {
                 rvItem = rvTemplate;
                rvItem = rvItem.replace('{{user-name}}', hotelReviews[i].reviewer);
                rvItem = rvItem.replace('{{user-address}}',hotelReviews[i].location);
                rvItem = rvItem.replace('{{user-photo}}',hotelReviews[i].image);
                rvItem = rvItem.replace('{{user-review}}',hotelReviews[i].review.substring(0,329)+"...more")
                 rvList += rvItem;
            }
            
              hlItem = hlItem.replace('{{review-list}}', rvList);

            
            hl += hlItem;
        }
        }
        hl += '</ul>';
        $('#hotel-list-holder').html(hl);
        common.setHotelList();
    },
    summarize: function(text, num, max){
        
        if (text === undefined){
            debugger
            return ''
        }
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
        var originalText = textToCheck
        for (var searchTerm in searchTermArr){
            if ('croissant' === searchTerm){
                console.log('searching for croissant')   
            }
            var searchPattern = new RegExp('('+searchTermArr[searchTerm]+')', 'ig'); 
            textToCheck = textToCheck.replace(searchPattern, '<span style="font-family: DIN_BLACK; font-weight: bold">$1</span>'); 
        }
//        if (originalText !== textToCheck){
//            console.log('text changed.')
//        }
        return textToCheck;
    },
    highlightSetOfKeyWords: function(text, selected, subAtt){
        var lowerText = text.toLowerCase()
        var mapToUse = {}
        var wordList = []
        for (var key in selected){
            var attr = selected[key]
            if (attr in subAtt){
                // it has subattr
                subAttrs = subAtt[attr]
                for (var index in subAttrs){
                    // find the word cloud for this sub attr
                    if (attr in window.subAttrWordCloud){
                        wordList = wordList.concat(window.subAttrWordCloud[attr][subAttrs[index]])
                    }
                }
            }
            else{
                // it is an attribute
                if (attr in window.attributeMap){
                    wordList = wordList.concat(window.attributeMap[attr])
                }
            }
        }
        text = common.filter(wordList, text)
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
    isAttribute: function(attr){
      return attr in window.attributeMap
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
    printReviews: function(reviewMapArg, results, selected, subAtt) {
            var reviewLookup = {}
            for (res in results){
                reviewObj = reviewMapArg[res]
                reviewLookup[res] = reviewObj // dangerous and writing to global var.
            }
        console.log('Total Resutls: ' + results.length)
        common.refreshReviews(reviewLookup, selected, subAtt)
        return reviewLookup
    },
    setAttributes: function(selected, suggested, subAtt){
        $('.attr-list').children().remove()
        $('.choice-list').children().remove()
        debugger
        for (var index in selected) {
            var attr = selected[index]
            if (attr in subAtt){
                for (subAttr in subAtt[attr]){
                    $('.choice-list').append('<li data=' + attr+ '>' + subAtt[attr][subAttr] + '<span></span></li>')
                }
            }
            else {
                $('.choice-list').append('<li>' + attr + '<span></span></li>')
            }
        }
        for (var attr in suggested) {
            $('.attr-list').append('<li>' + suggested[attr] + '<span></span></li>')
        }
    },
    size: function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
    return size;
    },
    refreshReviews: function(reviewLookUp, selected, subAtt) {
        // clean current reviews.
        $('.review-list').children().remove()
        results = []
        var length = common.size(reviewLookUp)
        for (var i = 1; i < length; i++){
            results.push(reviewLookUp[i])
        }
        this.showReviewList(results, selected, subAtt)
    },
    showReviewList: function(rl, selected, subAtt){
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
            if (item !== undefined && item.review !== undefined){
                var li = rvTemplate;
                li = li.replace('{{user-name}}', item['ReviewerName']);
                li = li.replace('{{user-photo}}', item['ReviewerImage']);
                li = li.replace('{{user-address}}', item['Place']);
                var summary = common.summarize(item.review, 4, 250);
                var highlightedSummary = common.highlightSetOfKeyWords(summary, selected, subAtt)
                li = li.replace('{{summary}}', highlightedSummary);
                var highlightedReview = common.highlightSetOfKeyWords(item.review, selected, subAtt)
                li = li.replace('{{review-full}}', highlightedReview);
                rul += li;
            }
        });
        rul += '</ul>';
        $('.review-list').html(rul);
        common.setReviewList();
    }
};

$(document).ready(function(){
	common.init();
 
});

$('.menu').on('click', function() {
    $(this).fadeOut(100);
    $('.title').fadeOut(100);
    $('#revulize-content').fadeOut(100);
    var hotelListSessionData=sessionStorage.getItem("hotelList");
    var viewName = $.parseJSON(hotelListSessionData); 
    common.populateHotelList(viewName)
    common.animateHotelList()
    
});

$('.goBackFormButton1').on('click',function() {
    window.location.href="form.html";
    
});
// show up hotels is clicked.
$('.button-holder').on('click', function(arg){
    
    var storeRevilizeState=[],revilizeNumber=0;
    var objForSession = {}  
    
    objForSession.location=$('#tags').val();
    objForSession.fromDate= $('.date1').val();
    objForSession.toDate=$('.date2').val();
    objForSession.purposeOfTraveling=$('.op1 > a.nl-field-toggle').text();
    
    $('span[style="display: inline;"]').each(function() {
         storeRevilizeState[revilizeNumber]=$(this).attr('class');
         revilizeNumber++;
    });
    
    objForSession.firstChoosenOption=storeRevilizeState[0];
    objForSession.secondChoosenOption=storeRevilizeState[1];
    
    if(objForSession.purposeOfTraveling != "Business") {
        $('div[style="display: inline-block;"]').each(function() {
         storeRevilizeState[revilizeNumber]=$(this).attr('class').split(/[ ]+/).pop();
         revilizeNumber++;
    });
        objForSession.selectedFoodItems=$('.selectedFoods:first').text();
        objForSession.selectedClassTwo=storeRevilizeState[2];
        objForSession.secondSelectedOption=$('.'+storeRevilizeState[2]+'> a.nl-field-toggle').text();
    }
    else {
    $('div[style="display: inline-block;"]').each(function() {
         storeRevilizeState[revilizeNumber]=$(this).attr('class').split(/[ ]+/).pop();
         revilizeNumber++;
    });
         objForSession.selectedClassOne=storeRevilizeState[2];
         objForSession.selectedClassTwo=storeRevilizeState[3];
         objForSession.firstSelectedOption=$('.'+storeRevilizeState[2]+'> a.nl-field-toggle').text();
        objForSession.secondSelectedOption=$('.'+storeRevilizeState[3]+'> a.nl-field-toggle').text();
    }
    
    objForSession.userEntry=$('#typewriter').text();
    
    
     sessionStorage.setItem('storeRevilizeStateAttributes', JSON.stringify(objForSession));
    
    common.getHotelListFromServer();
     
   
    // load the data.
    place = $('.op0 a').text()
    document.cookie = 'place=' + place
    purpose = $('.op1 a').text().toLowerCase()
    document.cookie = 'purpose=' + purpose
    var foodType = $($('.selectedFoods')[0]).text().toLowerCase().split(',')
    
    var queryParams = {"location": window.locationKey, "purpose":purpose, "food": foodType }
    common.getHotelListFromServer(queryParams);
    
    // load the data.
    var selectedAttributes = []
    var subAttributes = {}
    if ('honeymoon' === purpose){
        var foodType = $($('.selectedFoods')[0]).text().toLowerCase().split(',')
        selectedAttributes = ['overall', 'staff', 'night', 'beach', 'roof', 'amenities', 'location', 'food', 'view']
        viewType = [$($('.nl-dd-checked')[3]).text().toLowerCase()]
        subAttributes = {'food': foodType, 'view': viewType}
    }
    else if ('business' === purpose){
        var locationType = [$('.op2 a').text().split(' ')[0].toLowerCase()]
        selectedAttributes = ['transfer', 'food', 'location', 'amenity']
        subAttributes = {'loc': locationType, 'amenity': ['amenity']} // fill later.
    }
    // step 0: find results for this location.
    // step 1: find results indexed on basic attributes
    // step 2: Off these results indexed on sub attributes. All the results which are indexed by subattributes should be indexed by parent attribute as well
    // so 
    
    // It considers attributes.
    window.superResults = common.selectReviews(selectedAttributes, sentimentMap)
    
   
    sessionStorage.setItem('selAtt', JSON.stringify(selectedAttributes))
    sessionStorage.setItem('sugAtt', JSON.stringify([]))
    sessionStorage.setItem('subAtt', JSON.stringify(subAttributes))
    
    // It considers purpose.
    //var hotelListJson = common.getHotelList(window.locationKey, purpose)
  //  common.populateHotelList(hotelListJson)
    var hotelListMp1=common.getHotelListMp()
    common.populateHotelList(hotelListMp1)
     sessionStorage.setItem('hotelList',JSON.stringify(hotelListMp1))
    common.animateHotelList()
    
    $('.foot').find('input').on('click', function(arg) { 
        debugger; 
        document.cookie = 'attributes=' + selectedAttributes.toString()
        // find which hotel has been clicked and filter reviews only for that hotel.
        // also put the name of that hotel.
        var hotelId = $($(this).parentsUntil('.details')[2]).attr('data-valueofhotel')
        document.cookie = 'hotelid=' + hotelId
        sessionStorage.setItem('reviewMap', JSON.stringify(window.reviewMap[hotelId]))
        
        var attrReviewIdMap = common.filterReviews(window.superResults, hotelId)
        // add another filter which will filter the results as per the user spec fields.
        debugger
        var relevantResultsAfterSub = common.selectReviewsForSubAttributes( selectedAttributes, subAttributes, window.subAttrIndexMap, hotelId, attrReviewIdMap)
        sessionStorage.setItem('results', JSON.stringify(relevantResultsAfterSub))
    });
});
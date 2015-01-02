$ = jQuery.noConflict();

var common = {
    init: function(){
        this.setHomeHeight();
        this.resize();
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
    }
};
$(document).ready(function(){
	common.init();
});



 var clearTextOnlyOnce=1;
                
      $(function() {
          //Auto complete 
          var availableTags = [
        'Zermatt, Switzerland',
        'Boston,Massachusetts',	
        'New York,New York',	
        'Vienna,Austria',	
        'San Francisco Bay Area,California',	
        'Paris,France',	
        'Munich,Germany',	
        'London,United kingdom',	
        'Copenhagen,Denmark',	
        'Amsterdam,Netherlands',	
        'Seattle,Washington',	
        'Toronto,Canda',	
        'Los Angeles,California',	
        'Berlin,Germany',	
        'Hong Kong,Hong Kong',	
        'Frankfurt,Germany',	
        'Stockholm,Swedan',	
        'Lyon,France',	
        'Melbourne,VIC',	
        'Hamburg,Germany',	
        'Sydney,NSW',	
        'Seoul,Korea, South',	
        'Washington DC,District of Columbia',	
        'Philadelphia,Pennsylvania',	
        'Manchester,United Kingdom',	
        'Tokyo,Tokyo',	
        'Chicago,Illinois',	
        'Stuttgart,Germany',	
        'Tel Aviv,Israel',	
        'Shanghai,Shanghai',	
        'Singapore,Singapore',	
        'Montreal,Canada',	
        'Kyoto,Kyoto',	
        'Brussels,Belgium',	
        'Dubai,United Arab Emirates',	
        'Vancouver,Canada',	
        'Helsinki,Finland',	
        'Leipzig,Germany',	
        'Oslo,Norway',	
        'Dallas-Fort Worth,Texas',	
        'Marseille,France',	
        'Dusseldorf,Germany',	
        'Strasbourg,France',	
        'Austin,Texas',	
        'Cologne,Germany',	
        'The Hague,Netherlands',	
        'Milan,Italy',	
        'Osaka,Osaka',	
        'Raleigh-Durham,North Carolina',	
        'San Diego,California',	
        'Orlando,Florida',	
        'Portland,Oregon',	
        'Minneapolis-St Paul,Minnesota',	
        'Beijing,Beijing',	
        'Bordeaux,France',	
        'Prague,Czech Republic',	
        'Barcelona,Spain',	
        'Denver,Colorado',	
        'Budapest,Hungary',	
        'Edinburgh,United Kingdom',	
        'Houston,Texas',	
        'Atlanta,Georgia',	
        'Miami,Florida',	
        'Toulouse,France',	
        'Newark,New Jersey',	
        'Baltimore,Maryland',	
        'Kuala Lumpur,Malaysia',	
        'Quebec,Canada',	
        'Abu Dhabi,United Arab Emirates',	
        'Rotterdam,Netherlands',	
        'Dresden,Germany',	
        'Shenzhen,Guangdong',	
        'Zurich,Switzerland',	
        'Karlsruhe,Germany',	
        'Moscow,Russia',	
        'Rome,Italy',	
        'Hannover,Germany',	
        'Santa Ana-Anaheim,California',	
        'Nantes,France',	
        'Pittsburgh,Pennsylvania',	
        'Kobe,Hyogo',	
        'Kansas City,KO/MO',	
        'Geneva,Switzerland',	
        'Tampa,Florida',	
        'St Petersburg,Russia',	
        'Brisbane,QLD',	
        'Montpellier,France',	
        'Richmond,Virginia',	
        'Torino,Italy',	
        'Istanbul,Turkey',	
        'Ann Arbor,Michigan',	
        'Auckland,New Zealand',	
        'Glasgow,United Kingdom',	
        'Mexico City,Mexico',	
        'Madrid,Spain',	
        'Taipei,Taiwan',	
        'Aachen,Germany',	
        'Bangkok,Thailand',	
        'Providence,Rhode Island',	
        'Nice,France',	
        'Mannheim-Heidelberg,Germany',	
        ];
    
        //Auto Complete tag
        $( "#tags" ).autocomplete({
              source: availableTags,
              focus:function(e,ui) {
               
              $('#tags').addClass('nl-field nl-field-open');
              $('#tags').css('z-index',20000);
              $('.ui-widget-content').css('z-index',20000);
              },
              select: function(e, ui) {
              
              var ss=ui.item.value.length;
              
              if(ss <= 17){
                 ss=ss+220;
              } else if(ss <= 23) {
               ss=ss+320;
              } else if(ss<=25) {
              ss=ss+350;
              } else  {
              ss=ss+420;
              }
              
              $('#tags').css("width",ss+"px")
              $('#tags').removeClass('nl-field nl-field-open');
              hideAll();
              $('.op1').find('a.nl-field-toggle').text('Select');

              $('.datepicker').each(function() {
                $(this).val("DD-MM-YYYY");
               });
               }
         });
              
              
         $('#tags').focus(function() {           
              $(this).addClass('nl-field nl-field-open');
              $('#tags').css('z-index',20000);
              $('.ui-widget-content').css('z-index',20000);
         });
              
         $( "#tags" ).focusout(function(){
             $('#tags').removeClass('nl-field nl-field-open');
         }); 
              
         $('.op0').hide();
         $('.logout').hide();

          $('.pAttributes').each(function() { 
              if($(this).find('li').length >=6 )
              $(this).css('overflow-y','scroll')
          });
          
          $('.goBackFormButton').click(function() {
                $('.cContent').css('min-height',475);
                $('.cContent').slideDown('slow');
                $('.button-holder').slideDown('slow');
                $('.goBackForm').fadeOut(1000);
                $('#hotel-list-holder').fadeOut(1000);
          });
          
          $('.datepicker').click(function() {           
              $(this).addClass('nl-field nl-field-open');
              $('.ui-datepicker').css('z-index',20000);
          });
          $('.datepicker').change(function() {
              if($(this).val()){
                  $(this).removeClass('nl-field nl-field-open');
              }
          });
          
          clearTextOnlyOnce=1;
          $('#typewriter').keypress(function() {
                $(this).css('font-family','NeoSans');
               
                if($(this).text().length > 150 )
                $('.tepete').css('overflow-y','scroll');
                
                if($(this).text().length < 150 )
                $('.tepete').css('overflow-y','auto');
          });
         
          $('.profile-image').click(function() {
              $('.logout').fadeToggle(1000);
          });
             
          $('#typewriter').click(function() {
              if(clearTextOnlyOnce==1) {
                $(this).text("").focus();
                $('#typed-cursor').hide();
                clearTextOnlyOnce++;
               } else {
                  $(this).focus();
               }
          });
          
          $('body').keypress(function() {
              if(!$("#tags").is(":focus")) {
                if(clearTextOnlyOnce==1) {
                  $('#typewriter').text("").focus();
                  $('#typed-cursor').hide();
                  clearTextOnlyOnce++;
                 } else {
                   $('#typewriter').focus();
                 }
               }
          });
          
          $( ".datepicker" ).datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat:'dd-mm-yy',
                minDate: 0, 
                maxDate: "+2Y +1M +1D"
            });
          
          $('.tepete').hide();
          
          function typer() {
                 $('#typewriter').css('font-family','NeoSans-italic');
                 var str = "Please tell us your any further requirements", i = 0,isTag,text;

                (function type() {
                    text = str.slice(0, ++i);
                    if (text === str) return;
                    document.getElementById('typewriter').innerHTML = text+" ";
                    placeCaretAtEnd( document.getElementById("typewriter") );
                    var char = text.slice(-1);
                    if( char === '<' ) isTag = true;
                    if( char === '>' ) isTag = false;
                    if (isTag) return type();
                    setTimeout(type, 40);
                }()); 
           }
              
           $('.op3').click(function() {
                $('.tepete').fadeIn();
                typer();
                clearTextOnlyOnce=1;
            });
              
           $('.op4').click(function() {
                $('.tepete').fadeIn();
                typer();
                clearTextOnlyOnce=1;
            });
              
           $('.op5').click(function() {
                $('.tepete').fadeIn();
                typer();
                clearTextOnlyOnce=1;
            });
              
            $('.op6').click(function() {
                $('.tepete').fadeIn();   
                typer();
                clearTextOnlyOnce=1;
            });
          
            hideAll();
            var checkStatefood;
          
           $('#iAmGood').click(function() {
                 checkFood();
                 afterLoadingFood();
             });
          
            $('.modal-close').click(function() {
               checkFood();
               afterLoadingFood();
            });
          
           function afterLoadingFood() {
              
              if(checkStatefood=="honeymoon"){
                    $('.honeymoon5th').fadeIn(1500);
                    $('.op3').fadeIn(1500);
               } else if(checkStatefood=="travelling") {
                    $('.Traveling5th').fadeIn(1000);
                    $('.op5').fadeIn(1000);
               } else if(checkStatefood=="solotravelling") {
                    $('.soloTraveling5th').fadeIn(1000);
                    $('.op6').fadeIn(1000);
               }
            }
          
            $('.honeymoon4th').click(function(){
                 checkStatefood="honeymoon";
            });

           $('.op2').click(function() {
               $('.business5th').fadeIn(1000);
               $('.op4').fadeIn(1000);
           });
          
           $('.Traveling4th').click(function() {
                checkStatefood="travelling"
           });
          
           $('.soloTraveling4th').click(function() {
                checkStatefood="solotravelling"
           });
          
          function hideAll() {
             $('.tepete').hide();
             $('.honeymoon4th').hide();
             $('.honeymoon5th').hide();
             $('.op2').hide();
              
             $('.business4th').hide();
             $('.op3').hide();
              
             $('.business5th').hide();
             $('.op4').hide();
              
             $('.Traveling4th').hide();
              
             $('.Traveling5th').hide();
             $('.op5').hide();
             $('.soloTraveling4th').hide();
              
             $('.soloTraveling5th').hide();
             $('.op6').hide();
              
          }
          
          $('.op1').click(function(){
                          
              if($('.op1').find('ul>li.nl-dd-checked').text()=="Honeymoon"){    
                    $('.tepete').hide();
                    clearFood();
                    $('.honeymoon4th').fadeIn(1000);
                    $('.honeymoon5th').hide();
                    $('.op2').hide();
                    $('.business4th').hide();
                    $('.op3').hide();
                    $('.business5th').hide();
                    $('.op4').hide();
                    $('.Traveling4th').hide();
                    $('.Traveling5th').hide();
                    $('.op5').hide();
                    $('.soloTraveling4th').hide();
                    $('.soloTraveling5th').hide();
                    $('.op6').hide();
            } else  if($('.op1').find('ul>li.nl-dd-checked').text()=="Business") {
                  
                    $('.tepete').hide();
        
                    $('.business4th').fadeIn(1000);
                    $('.op2').fadeIn(1000);
                  
                    $('.honeymoon4th').hide();
                    $('.honeymoon5th').hide();
                    $('.op3').hide();
                    $('.business5th').hide();
                    $('.op4').hide();
                    $('.Traveling4th').hide();
                    $('.Traveling5th').hide();
                    $('.op5').hide();
                    $('.soloTraveling4th').hide();
                    $('.soloTraveling5th').hide();
                    $('.op6').hide();
                  
              } else  if($('.op1').find('ul>li.nl-dd-checked').text()=="Friends Outing") {
                  
                    $('.tepete').hide();
                    clearFood();
                    $('.soloTraveling4th').fadeIn(1000);
                    $('.honeymoon4th').hide();
                    $('.honeymoon5th').hide();
                    $('.op2').hide();
                    $('.business4th').hide();
                    $('.op3').hide();
                    $('.business5th').hide();
                    $('.op4').hide();
                    $('.Traveling4th').hide();
                    $('.Traveling5th').hide();
                    $('.op5').hide();
                    $('.soloTraveling5th').hide();
                    $('.op6').hide();
               }
              else  if($('.op1').find('ul>li.nl-dd-checked').text()== "Traveling ") {
                  
                     $('.tepete').hide();
                     clearFood();
                     $('.Traveling4th').fadeIn(1000);
                     $('.honeymoon4th').hide();
                     $('.honeymoon5th').hide();
                     $('.op2').hide();
                     $('.business4th').hide();
                     $('.op3').hide();
                     $('.business5th').hide();
                     $('.op4').hide();
                     $('.Traveling5th').hide();
                     $('.op5').hide();
                     $('.soloTraveling4th').hide();
                     $('.soloTraveling5th').hide();
                     $('.op6').hide();
               } else  if($('.op1').find('ul>li.nl-dd-checked').text()=="Select") {
                     hideAll();
               }
          });
          
          
          var selectedItems=[];
          
          $('.demo-hover').click(function(){ 
                $("#selectedFoods").text();
                $(this).find('div').toggleClass('demo-desc greenBack');          
           });
                
           
         function clearFood() {
            selectedItems=[];
            
             if($(".selectedFoods").text() !="" || $(".selectedFoods").text() !=null ) {
               $(".selectedFoods").text("Food");
               $('.demo-hover').each(function() {
               $(this).find('div').removeClass('greenBack').addClass('demo-desc');
               });
          }
         }
        function checkFood() {         
                i=0;
                $('.greenBack').each(function() {
                    selectedItems[i]= $(this).find('h3').text();
                    i++;
                 });
            
                if($('.greenBack').length != 0) {
                $(".selectedFoods").text(selectedItems);
                } else {
                    $(".selectedFoods").text("");
                }
            
                if($(".selectedFoods").text()=="" || $(".selectedFoods").text()==null ) {
                     $(".selectedFoods").text("Food");
                }
            
          } 
      });


 $(document).ready(function() {
              
    console.log(sessionStorage.getItem('sessionSetForOnlicking'));
    if( sessionStorage.getItem('sessionSetForOnlicking')=="true")
    revilizeState();
              
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return "";
    }
              
    $('.profile-name').text(getCookie('name'));       
    $('.profile-image').css('background',"url("+getCookie('image')+")");
    $('.profilename').text(parseCookieValue('name'));
    $(".username").text(parseCookieValue('name'));
    imageUrl = parseCookieValue('image')
    $($('#profilecircle')[0]).attr('style','background-image: url(' + imageUrl + ')')
    
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
     function revilizeState() {
        var revilizestaeattr=sessionStorage.getItem('storeRevilizeStateAttributes');
        var itemState=JSON.parse(revilizestaeattr)
        $('#tags').val(itemState.location);
        var ss=itemState.location.length;
        if(ss <= 17){
           ss=ss+220;
         } else if(ss <= 23){
           ss=ss+320;
         } else if(ss<=25) {
           ss=ss+350;
         } else  {
            ss=ss+420;
         }
 
         $('#tags').css("width",ss+"px")
         $('.date1').val(itemState.fromDate);
         $('.date2').val(itemState.toDate);
         $('.op1 > a.nl-field-toggle').text(itemState.purposeOfTraveling);
 
         if(itemState.purposeOfTraveling != "Business") {
            $('.'+itemState.firstChoosenOption+'').show();
            $('.selectedFoods').text(itemState.selectedFoodItems);
            $('.'+itemState.secondChoosenOption+'').show();
            $('.'+itemState.selectedClassTwo+'').show();
            $('.'+itemState.selectedClassTwo+'> a.nl-field-toggle').text(itemState.secondSelectedOption);
            } else {
                      $('.'+itemState.firstChoosenOption+'').show();
                      $('.'+itemState.secondChoosenOption+'').show();
                      $('.'+itemState.selectedClassOne+'').show();
                      $('.'+itemState.selectedClassTwo+'').show();
                      $('.'+itemState.selectedClassOne+'> a.nl-field-toggle').text(itemState.firstSelectedOption);
                      $('.'+itemState.selectedClassTwo+'> a.nl-field-toggle').text(itemState.secondSelectedOption);
            }
            
            if(itemState.userEntry !=""){
                 $('.tepete').show();
                 $('#typewriter').text(itemState.userEntry+" ");
                 placeCaretAtEnd( document.getElementById("typewriter") );
                 clearTextOnlyOnce=2;
             }    
            }
          
          function placeCaretAtEnd(el) {
                 el.focus();
                 if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
                     var range = document.createRange();
                     range.selectNodeContents(el);
                     range.collapse(false);
                     var sel = window.getSelection();
                     sel.removeAllRanges();
                     sel.addRange(range);
                  } else if (typeof document.body.createTextRange != "undefined") {
                      var textRange = document.body.createTextRange();
                      textRange.moveToElementText(el);
                      textRange.collapse(false);
                      textRange.select();
                  }
            }

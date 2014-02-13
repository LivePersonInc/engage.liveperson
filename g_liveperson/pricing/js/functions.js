
$(document).ready(function(){
    var atime = 1200; //animation time
    var pausetime = 3500; //pause time to hold up current slide

    var pauset = false;

    var testimonials = [
        '<span>&ldquo;</span>&nbsp;When the initial results of a 200% conversion rate increase came in after just a few days [from implementing keyword-based targeting], I was taken by surprise.&nbsp;<span>&rdquo;</span>',
        '<span>&ldquo;</span>&nbsp;We are able to target traffic that is coming to browse our site but that we know needs a little encouragement to actually buy a product.&nbsp;<span>&rdquo;</span>',
        '<span>&ldquo;</span>&nbsp;After our first discount voucher campaign, I was expecting the order values to be lower than average. Not only did they convert at higher rates, they also converted at higher order values.&nbsp;<span>&rdquo;</span>',
        '<span>&ldquo;</span>&nbsp;When the initial results of a 200% conversion rate increase came in after just a few days [from implementing keyword-based targeting], I was taken by surprise.&nbsp;<span>&rdquo;</span>'
    ]

    function anime(i){
        // if( !pauset ){
            $('#quotewrap p').empty().append(testimonials[i]);
            
            if( i >= testimonials.length-1){
                i = -1;
            }
            $('#quotewrap p').show().animate({
                'opacity': '1'
            }, atime, function(){
                setTimeout( function(){
                    $('#quotewrap p').animate({
                        'opacity': '0'
                    }, atime, function(){
                        $('#quotewrap p').hide();
                        anime(i+1)
                    });
                }, pausetime)
            });
        // } else {
        //     $('#quotewrap p').stop(true);
        //     setTimeout(function(){
        //         anime(i);
        //     }, 500)
        // }
    }

    anime(0);

    $("#sliderbox").slidesjs({
        width: 940,
        height: 88,
        pagination: { active: false },
        navigation: { active: false },
        play: { auto: true }
    });

    setTimeout(function(){
        $('#chatpop').show();
    }, 15000)

    $('#notnow').click(function(){
        $('#chatpop').hide();
    })

    //check for the proper url params
    var datapoints = ["campaignSearchKeywords__c","campaignSource__c","campaignReferrer__c","campaignAdvertiserKeyword__c"];
    for( var i = 0; i < datapoints.length; i++ ){
        if( urlParams[datapoints[i]] ){
            $('input[name=' + datapoints[i] + ']').val(urlParams[datapoints[i]]);
        }
    }
    //if no proper url params...
    //Transform improper url params into proper data points.
    var marketo_transform = {
        'campaignSearchKeywords__c':    ["utm_term", "utm_keyMatch"],
        'campaignSource__c':            ["utm_campaign", "utm_source", "Network"],
        'campaignReferrer__c':          ["ref","SiteTarget", "utm_device"],
        'campaignAdvertiserKeyword__c': ["utm_adPosition","utm_content"]
    }

    //roll through each required field
    for( var key in marketo_transform ){
        if( !(urlParams[key]) ){ // if already defined in url ignore it.
            var tval = "";
            // role through each data point within field
            for( var i = 0; i < marketo_transform[key].length; i++ ){

                //fix for referrer
                if( marketo_transform[key][i] == "ref" ){
                    tval += document.location.href;
                    continue;
                }

                if( !urlParams[marketo_transform[key][i]] ){ // if it isn't defined skip it. prevent's a bunche of "undefined"s
                    if( i != 0 && tval != '' ) tval += "|";
                    tval += 'null';
                    continue;
                } 

                if( i != 0 && tval != '' ) tval += "|";
                tval += urlParams[marketo_transform[key][i]];
            }
            $('input[name=' + key + ']').val(tval);
        }
    }
});

var new_window;
var baseurl = 'https://base.liveperson.net/hc/84421077/?cmd=file&file=visitorWantsToChat&site=84421077&byhref=1&SESSIONVAR!VisitSource=ppc';
var poptions = 'width=460,height=650,toolbar=no,location=no,directories=no,top=0,left=0,status=no,scrollbars=no';

function openChat(){
    var url = baseurl + "&SESSIONVAR!skill=BuyNow";
    new_window = window.open( url, '', poptions );
    new_window.focus();
}


function openSalez(){
    var url = baseurl + "&SESSIONVAR!skill=sales-english";
    new_window = window.open( url, '', poptions );
    new_window.focus();
}

function openTrial(){
    var url = baseurl + "&SESSIONVAR!skill=Trial";
    new_window = window.open( url, '', poptions );
    new_window.focus();
}








function select_monthly(){
    $('.price_tabs').each(function(){
        $(this).removeClass('clicked_tab');
    });

    $('#price_tab_1').addClass('clicked_tab');

    $('#price_tab_1').attr('src', 'img/tab1_orange.png');
    $('#price_tab_2').attr('src', 'img/tab2_grey.png');
    $('#price_tab_3').attr('src', 'img/tab3_grey.png');

    $('.price_widget_body').each(function(){
        $(this).hide();
    });

    $('#monthly').show();
}

function select_quarterly(){
    $('.price_tabs').each(function(){
        $(this).removeClass('clicked_tab');
    });

    $('#price_tab_2').addClass('clicked_tab');

    $('#price_tab_1').attr('src', 'img/tab1_grey.png');
    $('#price_tab_2').attr('src', 'img/tab2_orange.png');
    $('#price_tab_3').attr('src', 'img/tab3_grey.png');

    $('.price_widget_body').each(function(){
        $(this).hide();
    });

    $('#quarterly').show();
}

function select_annually(){
    $('.price_tabs').each(function(){
        $(this).removeClass('clicked_tab');
    });

    $('#price_tab_3').addClass('clicked_tab');

    $('#price_tab_1').attr('src', 'img/tab1_grey.png');
    $('#price_tab_2').attr('src', 'img/tab2_grey.png');
    $('#price_tab_3').attr('src', 'img/tab3_orange.png');

    $('.price_widget_body').each(function(){
        $(this).hide();
    });

    $('#annually').show();
}

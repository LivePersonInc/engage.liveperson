
$(document).ready(function(){

    $("#sliderbox").slidesjs({
        width: 1100,
        height: 75,
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
    var url = baseurl + "&SESSIONVAR!skill=sales-english";
    new_window = window.open( url, '', poptions );
    new_window.focus();
}

function openTrial(){
    var url = baseurl + "&SESSIONVAR!skill=Trial";
    new_window = window.open( url, '', poptions );
    new_window.focus();
}

$('#country').change( function(){
    if( $(this).val() == '0' ){
        $('#formwrap2 select').css('color', '#797979');
    } else {
        $('#formwrap2 select').css('color', '#000000');
    }
});

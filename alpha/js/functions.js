


/*

var superArray = new Array;
superArray = [

'https://le-billing.liveperson.net/le-billing/public/api/pricing/rateplan/v1.0?productName=LiveEngage&planName=30%20%2F%20Quarterly',
'https://le-billing.liveperson.net/le-billing/public/api/pricing/rateplan/v1.0?productName=LiveEngage&planName=100%20%2F%20Quarterly',
'https://le-billing.liveperson.net/le-billing/public/api/pricing/rateplan/v1.0?productName=LiveEngage&planName=330%20%2F%20Quarterly',
'https://le-billing.liveperson.net/le-billing/public/api/pricing/rateplan/v1.0?productName=LiveEngage&planName=30%20%2F%20Annual',
'https://le-billing.liveperson.net/le-billing/public/api/pricing/rateplan/v1.0?productName=LiveEngage&planName=100%20%2F%20Annual',
'https://le-billing.liveperson.net/le-billing/public/api/pricing/rateplan/v1.0?productName=LiveEngage&planName=330%20%2F%20Annual'

]
*/

/* alert(superArray); */



	$.getJSON( 'js/pricing.json', function( data ) {
	  populateColumn('starter', data);
	  populateColumn('basic', data);
	  populateColumn('deluxe', data);

	});

function populateColumn(columnName, data){
	  var column = $('th.' + columnName);
	  var column2 = $('td.' + columnName);

		  column.find('.annual .list_price').text(data[columnName].annual.list_price);
		  column.find('.annual .discount').text(data[columnName].annual.discount);
		  column.find('.annual .price').text(data[columnName].annual.price);

		  column2.find('.credits').text(data[columnName].annual.credits);
		  column2.find('.button').attr('id', data[columnName].annual.button);

		  column.find('.monthly .list_price').text(data[columnName].monthly.list_price);
		  column.find('.monthly .discount').text(data[columnName].monthly.discount);
		  column.find('.monthly .price').text(data[columnName].monthly.price);

		  column2.find('.credits').text(data[columnName].monthly.credits);
		  column2.find('.button').attr('id', data[columnName].monthly.button);

};




	$('button#annual').click(function() {
		$('button#monthly').addClass('off');
		$('button#annual').removeClass('off');
		$('div.monthly').hide();
		$('div.annual').show();
	});

	$('button#monthly').click(function() {
		$('button#annual').addClass('off');
		$('button#monthly').removeClass('off');
		$('div.monthly').show();
		$('div.annual').hide();
	});







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

/*
    setTimeout(function(){
       $('#chatpop').show();
    }, 1500)
*/

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

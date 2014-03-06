


/* giancarlo added */
	function start(){
				if ( window.addEventListener ) {
					window.addEventListener( "load", doLoad, false );
				} else if ( window.attachEvent ) {
					window.attachEvent( "onload", doLoad );
				} else if ( window.onLoad ) {
					window.onload = doLoad;
				}
			}



			function doLoad(){
				var endpoint = {
					"transport":"postmessage",
					"configuration":[
						{
							"url": "https://le-billing-a.liveperson.net/postmessage/postmessage.min.html",
							"delayLoad":0
						}
					]
				};

				var configurers = {
					postmessage:{
						frames:[],
						defaults:{
							timeout: 100
						},
						configure:function (frame) {
							this.frames.push(frame);
						}
					}
				};
				configurers[endpoint.transport].configure(endpoint.configuration[0]);

				lpBilling.taglets.lpAjax.configureTransports(configurers);
			}

			function success(){
				console.log("success >>> 111");
			}

			function error(){
				console.log("error >>> 111");
			}

			function onServerResponse(data) {

/*
			alert(data);
			alert(data.body[0].productRatePlanName);
			alert(data.body[1].productRatePlanName);
			alert(data.body[2].productRatePlanName);
			alert(data.body[3].productRatePlanName);
			alert(data.body[4].productRatePlanName);
			alert(data.body[5].productRatePlanName);
console.log(data.body[0].includedUnits);

*/


console.log(data.body);


var annualCols = document.querySelectorAll(".annual");

var quarterlyCols = document.querySelectorAll(".quarterly");

var creditsPer = document.querySelectorAll('div.credits');

var buttonArray = ["lp_div_qtrbuynowstarter","lp_div_qtrbuynowbasic","lp_div_annualbuynowdeluxe","lp_div_annualbuynowstarter", "lp_div_annualbuynowbasic", "lp_div_qtrbuynowdeluxe"];

//button = document.querySelectorAll('.button');

for (i=0; i < data.body.length; i++) {
	var pricingObject = data.body[i].ratePlanCharges.USD;

	if (i >= 0 && i <= 2) {

		quarterlyCols[i].querySelector('.list_price').innerHTML = "$" + pricingObject.flatFeePrice/12 + "/mo";
		quarterlyCols[i].querySelector('.discount').innerHTML = pricingObject.discountPercentage + "% off";
		quarterlyCols[i].querySelector('.price').innerHTML = "$" + pricingObject.discountPrice/12 + "/mo";
		creditsPer[i].innerHTML = data.body[i].includedUnits;

	//	button.setAttribute('id') = buttonArray[i];

		} else if (i >= 3 && i <= 5) {

		annualCols[i].querySelector('.list_price').innerHTML = "$" + pricingObject.flatFeePrice/12 + "/mo";
		annualCols[i].querySelector('.discount').innerHTML = pricingObject.discountPercentage + "% off";
		annualCols[i].querySelector('.price').innerHTML = "$" + pricingObject.discountPrice/12 + "/mo";

		}

	}

}







/* column.find('.annual .list_price').text(data[columnName].annual.list_price); */



			function send(url){
				var req = lpBilling.taglets.lpAjax_request;

				req.method = "post";

				req.url = url;
				req.callback = onServerResponse;
				req.data= '[{"productName":"LiveEngage","productRatePlanName":"30 / Quarterly"},{"productName":"LiveEngage","productRatePlanName":"100 / Quarterly"},{"productName":"LiveEngage","productRatePlanName":"330 / Quarterly"},{"productName":"LiveEngage","productRatePlanName":"30 / Annual"},{"productName":"LiveEngage","productRatePlanName":"100 / Annual"},{"productName":"LiveEngage","productRatePlanName":"330 / Annual"}]';

				req.success = function (data) {
					console.log("req.success");
					onServerResponse(data);
				};

				req.error = function (data) {
					console.log("req.error");
					onServerResponse(data);
				};

				lpBilling.taglets.lpAjax.issueCall(req);
			}

			start();

			$(window).load(function(){

				send('https://le-billing-a.liveperson.net/le-billing/public/api/pricing/rateplans/v10');

			})
/* end giancarlo added */



	$('button#annual').click(function() {
		$('button#quarterly').addClass('off');
		$('button#annual').removeClass('off');
		$('div.quarterly').hide();
		$('div.annual').show();
	});

	$('button#quarterly').click(function() {
		$('button#annual').addClass('off');
		$('button#quarterly').removeClass('off');
		$('div.quarterly').show();
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

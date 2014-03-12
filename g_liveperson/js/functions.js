

/* giancarlo added */

$('.button_quarterly').hide();



window.lpTag=window.lpTag||{};if(typeof window.lpTag._tagCount==='undefined'){window.lpTag={
    site:lpTag.site||'84421077',
    section:lpTag.section||'',
    autoStart:lpTag.autoStart===false?false:true,ovr:lpTag.ovr||{},_v:'1.5.1',_tagCount:1,protocol:location.protocol,events:{bind:function(app,ev,fn){lpTag.defer(function(){lpTag.events.bind(app,ev,fn);},0);},trigger:function(app,ev,json){lpTag.defer(function(){lpTag.events.trigger(app,ev,json);},1);}},defer:function(fn,fnType){if(fnType==0){this._defB=this._defB||[];this._defB.push(fn);}else if(fnType==1){this._defT=this._defT||[];this._defT.push(fn);}else{this._defL=this._defL||[];this._defL.push(fn);}},load:function(src,chr,id){var t=this;setTimeout(function(){t._load(src,chr,id);},0);},_load:function(src,chr,id){var url=src;if(!src){url=this.protocol+'//'+((this.ovr&&this.ovr.domain)?this.ovr.domain:'lptag.liveperson.net')+'/tag/tag.js?site='+this.site;}var s=document.createElement('script');s.setAttribute('charset',chr?chr:'UTF-8');if(id){s.setAttribute('id',id);}s.setAttribute('src',url);document.getElementsByTagName('head').item(0).appendChild(s);},init:function(){this._timing=this._timing||{};this._timing.start=(new Date()).getTime();var that=this;if(window.attachEvent){window.attachEvent('onload',function(){that._domReady('domReady');});}else{window.addEventListener('DOMContentLoaded',function(){that._domReady('contReady');},false);window.addEventListener('load',function(){that._domReady('domReady');},false);}if(typeof(window._lptStop)=='undefined'){this.load();}},start:function(){this.autoStart=true;},_domReady:function(n){if(!this.isDom){this.isDom=true;this.events.trigger('LPT','DOM_READY',{t:n});}this._timing[n]=(new Date()).getTime();},vars:lpTag.vars||[],dbs:lpTag.dbs||[],ctn:lpTag.ctn||[],sdes:lpTag.sdes||[],ev:lpTag.ev||[]};lpTag.init();}else{window.lpTag._tagCount+=1;}

		function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

  URLvars = getUrlVars();
  
  var campaignSearchKeywords;
   var campaignSource;
  
  if(undefined != URLvars['utm_term']) 
		{ campaignSearchKeywords = URLvars['utm_term'];	}
		else{campaignSearchKeywords = 'undefined'}
  if(undefined != URLvars['utm_campaign']) 
		{ campaignSource = URLvars['utm_campaign']; }
		else{campaignSource = 'undefined'}
  
  var urlPathName = window.location.pathname;
  urlPathName = urlPathName.split('/');

  
 if (typeof(lpMTagConfig)=='undefined') { lpMTagConfig = {}; } 
 if (typeof(lpMTagConfig.sessionVar) == "undefined"){ lpMTagConfig.sessionVar = [];} 
 lpMTagConfig.sessionVar[lpMTagConfig.sessionVar.length] = 'Topic=LE by LI'; 
 lpMTagConfig.sessionVar[lpMTagConfig.sessionVar.length] = 'Section=Paid-Search'; 
 lpMTagConfig.sessionVar[lpMTagConfig.sessionVar.length] = 'Campaign_ID=70100000000ACE9'; 
 lpMTagConfig.sessionVar[lpMTagConfig.sessionVar.length] = 'campaignSearchKeywords='+campaignSearchKeywords; 
 lpMTagConfig.sessionVar[lpMTagConfig.sessionVar.length] = 'campaignSource='+campaignSource; 
 lpMTagConfig.sessionVar[lpMTagConfig.sessionVar.length] = 'campaignReferrer='+urlPathName[1]; 




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
var annualBtn = document.querySelectorAll(".button_annual");
var quarterlyCols = document.querySelectorAll(".quarterly");
var quarterlyBtn = document.querySelectorAll(".button_quarterly");

var creditsPer = document.querySelectorAll('div.credits');


for (i=0; i < data.body.length; i++) {
/* 	console.log(data.body[i].ratePlanCharges.USD.discountPercentage + " " + data.body[i].baseBillingFrequencyMonths); */
	var output = '';
	var pricingObject = data.body[i].ratePlanCharges.USD;

 if (i < 3) {
	
	quarterlyCols[i].querySelector('.list_price').innerHTML = "$" + pricingObject.flatFeePrice/3 + "/mo";
	quarterlyCols[i].querySelector('.discount').innerHTML = pricingObject.discountPercentage + "% off";
	var yearlyPrice = pricingObject.flatFeePrice - pricingObject.discountPrice;
	var monthlyPrice = Math.round((yearlyPrice / 3)*100)/100;
	var monthlyPriceFixed = monthlyPrice.toFixed(2);
	quarterlyCols[i].querySelector('.price').innerHTML = "$" + monthlyPriceFixed + "/mo";
	var productRatePlanName = data.body[i].productRatePlanName;
	creditsPer[i].innerHTML = data.body[i].includedUnits;
	$(quarterlyBtn[i]).attr('href','https://liveengage.liveperson.net/a/new/?currency=USD&lang=en-US&planName='+productRatePlanName+'&Campaign_ID=70100000000AAtC#registration!buyNow');
}

 else {
	var iHateYou = i-3;
	annualCols[iHateYou].querySelector('.list_price').innerHTML = "$" + pricingObject.flatFeePrice/12 + "/mo";
	annualCols[iHateYou].querySelector('.discount').innerHTML = pricingObject.discountPercentage + "% off";
	var yearlyPrice = pricingObject.flatFeePrice - pricingObject.discountPrice;
	var monthlyPrice = Math.round((yearlyPrice / 12)*100)/100;
	var monthlyPriceFixed = monthlyPrice.toFixed(2);
	annualCols[iHateYou].querySelector('.price').innerHTML = "$" + monthlyPriceFixed + "/mo";
	var productRatePlanName = data.body[i].productRatePlanName;
	$(annualBtn[iHateYou]).attr('href','https://liveengage.liveperson.net/a/new/?currency=USD&lang=en-US&planName='+productRatePlanName+'&Campaign_ID=70100000000AAtC#registration!buyNow');
}


/*
	for (var property in object) {
	  output += property + ': ' + object[property]+'; ';
	}

	var pricingDataStr = data.body[i].baseBillingFrequencyStr + " " + data.body[i].includedUnits + " " + output
	priceAr.push(pricingDataStr);
*/

	}

	var newLinkParams = 'campaignSearchKeywords='+campaignSearchKeywords+'&campaignSource='+campaignSource+'&campaignReferrer='+urlPathName[1]+'&';
 
 

 
  $('a').each(function(){
  
	var anchorHref = $(this).attr('href');
    if (anchorHref.indexOf('liveengage.liveperson.net') >= 0)
	{	
		anchorHref = anchorHref.split('?');
		var newAnchorHref = anchorHref[0]+'?'+newLinkParams+anchorHref[1];
	}
	$(this).attr('href',newAnchorHref);
  })
  

	
	
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



/* alert(superArray);

	$.getJSON( 'js/pricing.json', function( data ) {
	  populateColumn('starter', data);
	  populateColumn('basic', data);
	  populateColumn('deluxe', data);

	});*/

/*

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
*/




	$('button#annual').click(function() {
		$('button#quarterly').addClass('off');
		$('button#annual').removeClass('off');
		$('div.quarterly').hide();
		$('.button_quarterly').hide();
		$('.button_annual').show();
		$('div.annual').show();
	});

	$('button#quarterly').click(function() {
		$('button#annual').addClass('off');
		$('button#quarterly').removeClass('off');
		$('.button_quarterly').show();
		$('div.quarterly').show();
		$('.button_annual').hide();
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

var transform = {};

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
    'campaignAdvertiserKeyword__c': ["utm_adPosition"],
    'campaignCreative__c':          ["utm_content"]
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

        transform[key] = tval;
    }
}

/* LP Mobile JS Configuration */
var _LP_CFG_ = {
    app_id : "4d1d3012",
    options : {
        chatDisabled : false,
        triggerSelector : '#clickchatlink', // Replace with a selector to your help button(s)
        extras : function() { // A static dictionary or a function that returns a dictionary of custom variables 
            var extras = {
                campaign_medium : 'CPC',
                //campaign_source : transform.campaignSource__c,
                //campaign_content : transform.campaignCreative__c,
                //referrer : transform.campaignReferrer__c,
                //campaign_advertiser_keyword : transform.campaignAdvertiserKeyword__c
                campaign_content : 123456,
                campaign_source: 'MOBILETESTSOURCE',
                campaign_advertiser_keywords : 'MOBILETESTKEYWORD',
                referrer : 'MOBILETESTREFERRER.COM'
                            };
            return extras;
        },
        onChatDisabled : function(els) { // An event that fires when chat is disabled. It takes one parameter which is an array of your trigger selectors.
            for(var i = 0; i < els.length; i++) {
                els[i].style.opacity = 1;
            }
        },
        onChatEnabled : function(els) { // An event that fires when chat is enabled. It takes one parameter which is an array of your trigger selectors.
            for(var i = 0; i < els.length; i++) {
                els[i].style.opacity = 1;
            }
        },
          onChatNotAnswered : function(messgaes) { // An event that fires after a message is sent by the user but agents are no longer available. It takes one parameter which is an array of the messages attempted to be sent by the user.
            alert('All chat agents are currently helping other customers. Please call our customer service center at 800-555-5555');
        }
    }
};
/* End of Configuration */
 
/* LP Mobile JS include */
(function(){var a=_LP_CFG_.lpjsid="lpjs-"+(new Date).getTime(),b=document.createElement("script"),s=document.getElementsByTagName("script")[0];b.id=a;b.type="text/javascript";b.async=true;b.src="https://d3tpuxked45kzt.cloudfront.net/lp_lib/liveperson-mobile.js";s.parentNode.insertBefore(b,s)})();
/* End of Include */

// LiveBall External Tagging and Conversion
//
// Copyright (c) 2006-2008 ion interactive, inc.   All rights reserved.

var _lb_hostname="";
var _lb_convert_path="/Outside/Convert.ashx";
var _lb_tag_path="/Outside/Tag.ashx";
var _lb_data_path="/Outside/Data.ashx";
var _lb_uid_param="lbuid";
var _lb_uky_param="lbuky";
var _lb_rid_param="lbrid";
var _lb_rnd_param="rnd";
var _lb_tag_param="tag";
var _lb_json_param="lbjson";
var _lb_json_value="y";
var _lb_uid_value="";
var _lb_uky_value="";
var _lb_rid_value="";
var _lb_recognized=false;
var _lb_temponly=false;
var _lb_localcookie_name="liveball_local";
// variables associated with returning back to LiveBall
var _lb_return_page="/Callback.aspx";
var _lb_fallback_url="";
var _lb_return_pgn_param="lbpgn";
var _lb_return_cvt_param="lbcvt";
var _lb_return_tag_param="lbtag";
var _lb_return_fbu_param="lbfbu";
var _lb_this_converted=false;
var _lb_this_tagged="";
var _lb_return_pnames=new Array();
var _lb_return_pvalues=new Array();
var _lb_use_json=false;
// following variables for reading original LiveBall cookies cross-domain
var _lb_origcookie_name="LiveBall";
var _lb_origtempcookie_name="LiveBallTemp";

var _lb_script_id_counter=1;
 
function jsonRequest(fullUrl)
{
    this.fullUrl = fullUrl; 
    this.headLoc = document.getElementsByTagName("head").item(0);
    this.scriptID = 'jscriptid' + _lb_script_id_counter++;

    this.scriptObj = document.createElement("script");
    
    this.scriptObj.setAttribute("type", "text/javascript");
    this.scriptObj.setAttribute("charset", "utf-8");
    this.scriptObj.setAttribute("src", this.fullUrl);
    this.scriptObj.setAttribute("id", this.scriptID);

    this.headLoc.appendChild(this.scriptObj);
}

function liveballUseJSON(flag)
{
    _lb_use_json=flag;
}

function liveballEncodeUrl(instg)
{
    var retval=""
    if (instg != null && instg != "")
    {
        retval=escape(instg);
        retval=retval.replace("+", "%2B");
        retval=retval.replace("/", "%2F");
    }
    return retval;
}

function liveballRecognizeQuery()
{
    var found_uid=false;
    var found_uky=false;
    var found_rid=false;
    
    var qs=location.search;
    if (qs == null || qs.length <= 1) {
        return false;
    }
    var qsarr=qs.substring(1).split('&');
    if (qsarr[0].length > 0) {
        for (var pidx=0 ; pidx < qsarr.length ; pidx++) {
            var ppair=qsarr[pidx].split('=');
            if (ppair[0] == _lb_uid_param) {
                _lb_uid_value=ppair[1];
                found_uid=true;
            }
            else if (ppair[0] == _lb_uky_param) {
                _lb_uky_value=ppair[1];
                found_uky=true;
            }
            else if (ppair[0] == _lb_rid_param) {
                _lb_rid_value=ppair[1];
                found_rid=true;
            }
        }
    }
    if (found_uid && found_uky && found_rid) {
        _lb_recognized=true;
        return true;
    }
    return false;
}

function liveballRecognizeCookie()
{
    var cookies=document.cookie;
    var lbpos=cookies.indexOf(_lb_localcookie_name + "=");
    if (lbpos != -1) {
        lbpos=lbpos + _lb_localcookie_name.length + 1;
        var fin=cookies.indexOf(";",lbpos);
        var packedcookie = cookies.substring(lbpos,(fin == -1 ? cookies.length : fin));
        if (packedcookie != null && packedcookie.length > 5) {
            var valuearr=packedcookie.split("$");
            if (valuearr.length == 3) {
                _lb_uid_value=valuearr[0];
                _lb_uky_value=valuearr[1];
                _lb_rid_value=valuearr[2];
                _lb_recognized=true;
                return true;
            }
        }
    }
    return false;
}

function liveballRecognizeOrigCookie()
{
    var cookies=document.cookie;
    var lbpos=cookies.indexOf(_lb_origcookie_name + "=");
    if (lbpos != -1) {
        lbpos=lbpos + _lb_origcookie_name.length + 1;
        var fin=cookies.indexOf(";",lbpos);
        var packedcookie = cookies.substring(lbpos,(fin == -1 ? cookies.length : fin));
        if (packedcookie != null && packedcookie.length > 5) {
            var valuearr=packedcookie.split("&");
            if (valuearr.length == 3) {
                if (valuearr[0].length > 4 && valuearr[1].length > 4 && valuearr[2].length > 4) {
                    _lb_uid_value=valuearr[0].substring(4);
                    _lb_uky_value=valuearr[1].substring(4);
                    _lb_rid_value=valuearr[2].substring(4);
                    _lb_recognized=true;
                    return true;
                }
            }
        }
    }
    return false;
}

function liveballRecognizeOrigTempCookie()
{
    var cookies=document.cookie;
    var lbpos=cookies.indexOf(_lb_origtempcookie_name + "=");
    if (lbpos != -1) {
        lbpos=lbpos + _lb_origtempcookie_name.length + 1;
        var fin=cookies.indexOf(";",lbpos);
        var packedcookie = cookies.substring(lbpos,(fin == -1 ? cookies.length : fin));
        if (packedcookie != null && packedcookie.length > 5) {
            var valuearr=packedcookie.split("&");
            if (valuearr.length == 3) {
                if (valuearr[0].length > 4 && valuearr[1].length > 4 && valuearr[2].length > 4) {
                    _lb_uid_value=valuearr[0].substring(4);
                    _lb_uky_value=valuearr[1].substring(4);
                    _lb_rid_value=valuearr[2].substring(4);
                    _lb_recognized=true;
                    return true;
                }
            }
        }
    }
    return false;
}

function liveballWriteCookie()
{
    var nextyear=new Date();
    nextyear.setFullYear(nextyear.getFullYear() + 1);
    
    var packedcookie=_lb_uid_value+"$"+_lb_uky_value+"$"+_lb_rid_value;
    
    var threemin="|au|name|pro|uk|";
    var sldthreemin="|ac|com|edu|gov|net|org|";
    var cookiedomain=document.domain.toLowerCase();
    if (cookiedomain.indexOf(".postclickmarketing.com") == -1 &&!(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/).test(cookiedomain)) { // not PCM or an IP address
        var domainarr=cookiedomain.split(".");
        if (domainarr.length > 2) {                                             // has more than 2 parts
            if (threemin.indexOf("|"+domainarr[domainarr.length-1]+"|") != -1 
             || sldthreemin.indexOf("|"+domainarr[domainarr.length-2]+"|") != -1
             || domainarr[domainarr.length-2].length == 2) {
                if (domainarr.length > 3) {
                    cookiedomain=domainarr[domainarr.length-3]+"."+domainarr[domainarr.length-2]+"."+domainarr[domainarr.length-1];
                }
            }
            else {
                cookiedomain=domainarr[domainarr.length-2]+"."+domainarr[domainarr.length-1];
            }
        }
    }
    
    if (_lb_temponly) {
        document.cookie=_lb_localcookie_name + "=" + packedcookie +"; path=/; domain=" + cookiedomain;
    }
    else {
        document.cookie=_lb_localcookie_name + "=" + packedcookie +"; path=/; domain=" + cookiedomain + "; expires=" + nextyear.toGMTString();
    }
}

function liveballRecognize(set_hostname)
{
    if (set_hostname != null && set_hostname.length > 1) {
        var lastpos=(set_hostname.length-1);
        if (set_hostname.lastIndexOf("/") == lastpos) {
            _lb_hostname=set_hostname.substring(0,(lastpos-1));
        }
        else {
            _lb_hostname=set_hostname;
        }
    }

    if (liveballRecognizeQuery()) {
        liveballWriteCookie();
    }
    else if (!liveballRecognizeCookie()) {
        if (liveballRecognizeOrigCookie()) {
            liveballWriteCookie();
        }
        else if (liveballRecognizeOrigTempCookie()) {
            _lb_temponly=true;
            liveballWriteCookie();
        }
    }
}

function liveballBaseUrl()
{
    return (document.location.protocol + "//" + _lb_hostname);
}

function liveballQueryString()
{
    return ("?"+_lb_uid_param+"="+_lb_uid_value+"&"+_lb_uky_param+"="+_lb_uky_value+"&"+_lb_rid_param+"="+_lb_rid_value+"&"+_lb_rnd_param+"="+parseInt(31777*Math.random())+(_lb_use_json ? ("&"+_lb_json_param+"="+_lb_json_value) : ""));
}

function liveballConvertUrl()
{
   return (liveballBaseUrl() + _lb_convert_path + liveballQueryString());
}

function liveballTagUrl(tag)
{
   return (liveballBaseUrl() + _lb_tag_path + liveballQueryString() + "&" + _lb_tag_param + "=" + liveballEncodeUrl(tag));
}

function liveballDataUrl(dname, dvalue)
{
   return (liveballBaseUrl() + _lb_data_path + liveballQueryString() + "&" + dname + "=" + liveballEncodeUrl(dvalue));
}

function liveballConvert()
{
    if (_lb_recognized && _lb_hostname != null && _lb_hostname != "") {
        _lb_this_converted=true;
        if (_lb_use_json) {
            var json = new jsonRequest(liveballConvertUrl());
        }
        else {
            document.write('<img src="' + liveballConvertUrl() + '" width="1" height="1" />');
        }
    }
}

function liveballTag(tag)
{
    if (_lb_recognized && _lb_hostname != null && _lb_hostname != "" && tag != null && tag != "" && tag != _lb_this_tagged) {
        _lb_this_tagged=_lb_this_tagged + (_lb_this_tagged == "" ? "" : ";") + tag;
        if (_lb_use_json) {
            var json = new jsonRequest(liveballTagUrl(tag));
        }
        else {
            document.write('<img src="' + liveballTagUrl(tag) + '" width="1" height="1" />');
        }
    }
}

function liveballData(dname, dvalue)
{
    if (_lb_recognized && _lb_hostname != null && _lb_hostname != "" && dname != null && dname != "" && dvalue != null && dvalue != "") {
        liveballReturnParam(dname, dvalue);
        if (_lb_use_json) {
            var json = new jsonRequest(liveballDataUrl(dname, dvalue));
        }
        else {
            document.write('<img src="' + liveballDataUrl(dname, dvalue) + '" width="1" height="1" />');
        }
    }
}

function liveballDataPost(dname, dvalue, func) {
    if (dname != null && dname != "" && dvalue != null && dvalue != "") {
        var xhr = new XMLHttpRequest;
        xhr.open("POST", "/Outside/Data.ashx", _lbapi_asynchronous);
        var params = _lbapi_idstg() + "&" + dname + "=" + _lbapi_urlencode(dvalue);

        xhr.onreadystatechange = function () {
            if (this.readyState == XMLHttpRequest.DONE && func != null) {
                func();
            }
        };
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("Content-length", params.length);
        xhr.setRequestHeader("Connection", "close");

        xhr.send(params);
    }
}

function liveballReturnParam(pname, pvalue)
{
    if (pname != null && pname != "" && pvalue != null && pvalue != "") {
        for (var i=0 ; i < _lb_return_pnames.length ; i++)
        {
            if (_lb_return_pnames[i] == pname) {
                _lb_return_pvalues[i]=pvalue;
                return;
            }
        }
        
        var newidx=_lb_return_pnames.length;
        _lb_return_pnames[newidx]=pname;
        _lb_return_pvalues[newidx]=pvalue;
    }
}

function liveballReturnFallbackUrl(fburl)
{
    if (fburl != null && fburl != "") {
        _lb_fallback_url=fburl;
    }
}

function liveballReturnUrl(pathdomain, pagename, gosecure)
{
    var retval="";
    if ((_lb_recognized || top != self) && _lb_hostname != null && _lb_hostname != "") {
        if (pathdomain == null || pathdomain == "") {
            pathdomain=_lb_hostname;
        }
        retval=(gosecure ? "https://" : "http://") + pathdomain + _lb_return_page + "?";
        if (_lb_recognized) {
            retval = retval +
            _lb_uid_param + "=" + _lb_uid_value + "&" +
            _lb_uky_param + "=" + _lb_uky_value + "&" +
            _lb_rid_param + "=" + _lb_rid_value;
        }
        if (pagename != null && pagename != "") {
            retval=retval + "&" + _lb_return_pgn_param + "=" + liveballEncodeUrl(pagename);
        }
        if (_lb_this_converted) {
            retval=retval + "&" + _lb_return_cvt_param + "=Y";
        }
        if (_lb_this_tagged != "") {
            retval=retval + "&" + _lb_return_tag_param + "=" + liveballEncodeUrl(_lb_this_tagged);
        }
        if (_lb_fallback_url != "") {
            retval=retval + "&" + _lb_return_fbu_param + "=" + liveballEncodeUrl(_lb_fallback_url);
        }
        if (_lb_return_pnames.length > 0 && _lb_return_pnames.length == _lb_return_pvalues.length) {
            for (var pidx=0 ; pidx < _lb_return_pnames.length ; pidx++) {
                retval=retval + "&" + _lb_return_pnames[pidx] + "=" + liveballEncodeUrl(_lb_return_pvalues[pidx]);
            }
        }
    }
    else if (_lb_fallback_url != "") {
        retval=_lb_fallback_url;
    }
    return retval;
}

function liveballReturn(pathdomain, pagename, gosecure, framebust)
{
    var returnUrl=liveballReturnUrl(pathdomain, pagename, gosecure);
    if (returnUrl != "") {
        if (framebust) {
            top.location.href=returnUrl;
        }
        else {
            window.location.href=returnUrl;
        }
    }
}
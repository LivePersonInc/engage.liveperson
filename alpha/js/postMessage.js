window.lpBilling = window.lpBilling || {};
lpBilling.taglets = lpBilling.taglets || {};
/*
****  lpajax.js  *****
*/
/**
 * lpAjax namespace
 * @namespace - contains the lpAjax logic
 */
lpBilling.taglets.lpAjax = (function (window) {
    var version = "1.0.3";
    var name = "lpAjax";
    var _transports = {};
    var isInit = false;

    function init() {
        isInit = true;
    }

    var addTransport = function (name, transport) {
        _transports[name] = transport;
    };


    function _log(msg, type) {
        if (window.lpBilling && lpBilling.log) {
            lpBilling.log(msg, type, name);
        }
    }

    function issueCall(request) {
        if (!isInit) { init(); }

        var tname = 'unknown';

        try {
            var transport = _chooseTransport(request);
            if(transport){
                transport.issueCall(request);
                return true;
            }else{
                request.error.call(request.context || null, { responseCode: 602, error: "Transport - " + tname + " - unable to issueCall request: " + request.url + " e=" + e, body: "ERROR" });
            }
        }
        catch (e) {
            _log('general exception in calling transport: ' + e,'ERROR');
            if (typeof request.error == 'function') {
                if (transport && transport.getName) {
                    tname = transport.getName();
                }
                try {
                    request.error.call(request.context || null, { responseCode: 602, error: "Transport - " + tname + " - unable to issueCall request: " + request.url + " e=" + e, body: "ERROR" });
                } catch (e) {
                    _log("Exception in execution of ERROR callback, type :" + tname + " e=[" + e.message + "]", 'ERROR');
                }
            }
        }
    }

    function configureTransports(confT) {
        if (!isInit) { init(); }

        for (var name in confT) {
            var t = _transports[name];
            if (t) {
                t.configure(confT[name]);
            }
        }
    }

    function _chooseTransport(reqObj) {
        var foundT = false, index = -1;
        for (var i=0; i<reqObj.transportOrder.length; i++) {
            if(!foundT){
                var req = extend({} , reqObj);
                var t = _transports[req.transportOrder[i]];
                if (t && t.isValidRequest && t.isValidRequest(req)) {
                    foundT = true;
                    index = i;
                }
            }
        }
        if(foundT){
            return _transports[req.transportOrder[index]];
        }else{
            return null;
        }
    }
    /**
     * An `each` implementation, aka `forEach`<br>
     * Handles objects with the built-in `forEach`, arrays, and raw objects<br>
     * Delegates to **ECMAScript 5**'s native `forEach` if available
     *
     * @param {Object} obj list of elements
     * @param {Object} iterator
     * @param {Object} context
     * @example
     * lpBilling.taglets.lpajax_utils.each([1, 2, 3], function(num){ alert(num); });
     * result: alerts each number in turn...
     * lpBilling.taglets.lpajax_utils.each({one : 1, two : 2, three : 3}, function(num, key){ alert(num); });
     * result: alerts each number in turn...
     */
     function each(obj, iterator, context) {
        if (obj == null) {return;}
        var nativeForEach = Array.prototype.forEach;

        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        }
        else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (i in obj && iterator.call(context, obj[i], i, obj) === {}) {return;}
            }
        } else {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === {}) {return;}
                }
            }
        }
    }
    /**
     * Copy all of the properties in the source objects over to the destination object, and return the destination object.<br>
     * It's in-order, so the last source will override properties of the same name in previous arguments
     *
     * @param {Object} obj a request object (see lpAjax for detailed description)
     * @example
     * lpBilling.taglets.lpajax_utils.extend(destination, *sources)
     * lpBilling.taglets.lpajax_utils.extend({name : 'moe'}, {age : 50});
     * result: {name : 'moe', age : 50}
     */
     function extend(obj) {
        each(Array.prototype.slice.call(arguments, 1),
            function(source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        );
        return obj;
    }


    return {
        getVersion: function () { return version; },
        getName: function () { return name; },
        init : init,
        issueCall : issueCall,
        configureTransports : configureTransports,
        addTransport : addTransport
    };
})(window);

/*
****  lpajax.request.js  *****
*/
/**
 * @fileOverview Contains lpAjax request object definition
 * @author Efim Dimenstein
 * @version 0.1 - 2012-08-20
 */
/**
 * lpAjax_request namespace
 * @namespace - Contains lpAjax request object definition
 */
lpBilling.taglets.lpAjax_request = {
    /**
     * The url of the request
     * @public
     * @type String
     */
    url : '',
    /**
     * The method of the request - valid options (GET/POST/PUT/DELETE) <br>
     * Optional - default value is an automatically GET <br>
     * Please note that for some transports not all methods apply
     * @public
     * @type String
     */
    method : 'GET',
    /**
     * The encoding of the request <br>
     * Optional - default value UTF8 <br>
     * Please note that for some transports not all methods apply
     * @public
     * @type String
     */
    encoding : 'UTF8',
    /**
     * If set to false, it will force requested pages not to be cached by the browser.<br>
     * Setting cache to false also appends a query string parameter, "_=[TIMESTAMP]", to the URL.
     * Optional - default value true <br>
     * Please note that for some transports not all methods apply
     * @public
     * @type String
     */
    cache : true,
    /**
     * A map of additional header key/value pairs to send along with the request.
     * Optional <br>
     * Please note that for some transports not all methods apply
     * @public
     * @type Object
     */
    headers : {},
    /**
     * An array of transport names - which specifies the order of finding the matching transport <br>
     * Optional - default []<br>
     * @public
     * @type Array
     */
    transportOrder : ['ajax', 'jsonp', 'postmessage','iframePost'],
    //    transportOrder : ['postmessage','iframePost'],

    /**
     *  An optional property that applies only to jsonp transport and specifies the name of the callback to use when issuing the request
     * Optional - default 'cb'<br>
     * @public
     * @type String
     */
    callback : 'cb',
    /**
     * Data to be sent to the server. <br>
     * It is converted to a query string, if not already a string. It's appended to the url for GET-requests.<br>
     * Deep Object for JSONP will be converted to key : encodeURIComponent(stringify(Object)) format
     * Optional <br>
     * @public
     * @type Object|String
     */
    data : {},
    /**
     * Number of retries if the timeout is reached <br>
     * Specifies the number of retries after the request timed out
     * Optional  - default value 2 <br>
     * @public
     * @type Integer
     */
    retries : 2,
    /**
     * Set a timeout (in seconds) for the request <br>
     * Optional  - default value 30 <br>
     * @public
     * @type Integer
     */
    timeout : 30,
    /**
     * Use XML HTTP override headers for PUT/DELETE requests <br>
     * making them use post as the real method <br>
     * Optional
     */
    XMLHTTPOverride: true,
    /**
     * The sent mimeType, supported for override in modern browser
     * Options: "application/json", "text/javascript", "text/html", "application/xml", "text/xml", "application/x-www-form-urlencoded"
     * Optional
     */
    mimeType : "application/json",
    /**
     * A function to be called if the request fails. <br>
     * Optional <br>
     * @public
     * @type Function
     */
    error : function () {},
    /**
     * A function to be called if the request succeeds. <br>
     * Optional <br>
     * @public
     * @type Function
     */
    success : function () {},
    /**
     * If you want to receive progress events on XHR requests this
     * can be used if the browser supports them.
     */
    progress: function(){},
    /**
     * The context in which we want to run the success/error callbacks <br>
     * If none is provided the context will not be set (null)
     * Optional
     */
    context: {},

    init : function (cfg) {
    }
};
/*
/*
****  transports/postmessage.js  *****
*/
lpBilling.taglets.postmessage = lpBilling.taglets.postmessage || (function (window) {

    var version = "1.0.5";
    var transportType = "postmessage";
    var initialised = true;
    var iFramesObj = {};
    var callbacks = {};
    var pendingFrameReqQueue = {};
    var callCount = 0;
    var errorCount = 0;
    var pendingCount = 0;
    var bufferedCount = 0;
    var iFrameList = {};
    var errorTimeOutId;
    var logType = { DEBUG: "DEBUG", INFO: "INFO", ERROR:"ERROR"};
    var docSubDomain = getSubDomain(document.location.href);
    var responseTypes  = { progress: "progressLoad", completed: "completeLoad", error: "errorLoad", reloading: "reloading" };
    var postMessageTimeout = { responseType: responseTypes.error, responseCode: 404, message: "Request timed out on parent postMessage layer", name: "TIMEOUT"};
    var iFrameLoaded = { responseType: responseTypes.success, responseCode: 200, message: "iFrame has successfully loaded", name: "OK"};
    var iFrameTeapot = { responseType: responseTypes.error, responseCode: 418, message: "This iFrame is a teapot, not very useful for communication but lovely for earl grey", name: "TEAPOT" };//See rfc http://www.ietf.org/rfc/rfc2324.txt
    var rDefaults = { timeout: 60000 };

    bindEvent(window, "message", handleMessageFromFrame);
    /**
     * Enumeration of the possible iframe states
     * @type {Object}
     */
    var validationState = {
        VALIDATED: "valid",
        PENDING: "pending",
        FAILED: "failed"
    };

    /**
     * Binding function for DOM elements
     * @param elem - the element we're binding to
     * @param eventName - the event we're listening on
     * @param callback - our callback for when it happens
     */
    function bindEvent(elem, eventName, callback) {
        if (elem.addEventListener) {
            elem.addEventListener(eventName, callback, false);
        } else {
            elem.attachEvent("on" + eventName, callback);
        }
    }

    /**
     * Creates a new error response object
     * @param callId
     * @param reponseObj
     * @return {Object}
     */
    function getErrorResponse(callId, responseObj){
        return { callId: callId, responseType: responseObj.responseType, responseCode: responseObj.responseCode, error: { message: responseObj.message, id: responseObj.responseCode, name: responseObj.name}};
    }

    /**
     * Unbinds a DOM event
     * @param elem
     * @param eventName
     * @param callback
     */
    function unbindEvent(elem, eventName, callback) {
        if (elem.removeEventListener) {
            elem.removeEventListener(eventName, callback, false);
        } else if(elem.detachEvent){
            elem.detachEvent("on" + eventName, callback);
        }
    }

    /**
     * Creates a Unique identifier with a prefix
     * @return {String}
     */
    function createUId(preFix) {
        return preFix + "_" + Math.floor(Math.random() * 100000) + "_" + Math.floor(Math.random() * 100000);
    }

    /**
     * Function to extract the sub domain from any URL
     * @param url
     * @return {String}
     */
    function getSubDomain(url) {
        var domainRegEx = new RegExp(/(http{1}s{0,1}?:\/\/)([^\/\?]+)(\/?)/ig);
        var matches, domain = null;
        if (url.indexOf("http") === 0) {
            matches = domainRegEx.exec(url);
        } else {
            matches = domainRegEx.exec(window.location.href);
        }
        if (matches && matches.length >= 3 && matches[2] !== "") {
            domain = matches[1].toLowerCase() + matches[2].toLowerCase(); // 0 - full match 1- HTTPS 2- domain
        }
        return domain;
    }

    /**
     * Adds an iframe to our list of potential iframes
     * Also checks for defaults definition of requests for that iframe
     * If none existent sets the defaults defined for the transport
     * @param frameObject
     * @return {Boolean}
     */
    function addiFrameLocation(frameObject) {
        var added = false, domain;
        if (!frameObject || !frameObject.url) {
            log("iFrame configuration empty or missing url parameter", logType.ERROR, "addiFrameLocation");
            return added;
        }
        domain = getSubDomain(frameObject.url);
        if (iFramesObj[domain] || iFrameList[domain]) {
            added = false;
        } else {
            iFrameList[domain] = frameObject;
            added = true;
        }
        return added;
    }

    /**
     * Adds the frame to the DOM and queues a listener
     * To know if it has loaded
     * @param src - the URL for the iframe
     * @param defaults  - the default configuration for this iFrame
     * @param success - the validation callback supplied from externally
     * @param context - the execution context for the external callback
     * @param delayLoad - if the frame should be loaded with timeout (for refresh scenarios where other scripts need to run before)
     * @error error - callback in case the iFrame dies
     * @return {*} - returns string if the frame is pending or exists
     */
    function addFrame(iFrameConfiguration) {
        //url, defaults, callback ||  success, context, delayLoad, error
        var domain = getSubDomain(iFrameConfiguration.url);
        if (iFramesObj[domain]) {
            return frameExists(domain, success, context);
        }
        var id = createUId("fr");

        iFramesObj[domain] = {
            elem: createiFrame(id),//The iFrame element on the page
            url: iFrameConfiguration.url,//The iFrame src URL
            validated: validationState.PENDING,//The validation state
            defaults: iFrameConfiguration.defaults || {},//Defaults for this iFrame
            delayLoad: isNaN(iFrameConfiguration.delayLoad) ? 0:  iFrameConfiguration.delayLoad,//Delayload configuration for adding to DOM, default is end of queue
            requestCount: 0,//The number of requests issued to this iFrame
            success: iFrameConfiguration.callback || iFrameConfiguration.success,//The callback when the frame has loaded
            error: iFrameConfiguration.error,//An error callback when the frame is dead
            maxReloadRetries: iFrameConfiguration.maxReloadRetries || 3,//The number of tries to revive this iFrame
            reloadInterval: iFrameConfiguration.reloadInterval * 1000 || 30000//The timeout between reload intervals
        };

        setTimeout(function () {//Always timed out for best compatablity
            addFrameToBodyAndBind(iFrameConfiguration.url , domain);
        }, iFramesObj[domain].delayLoad);
        log("iFrame Queued to load " +  domain , logType.INFO, "addFrame");
        return validationState.PENDING;
    }

    /**
     * Adds the iframe to the DOM, sets teh SRC URL and starts the validation process
     * @param src - the iframe URL
     * @param domain - the domain of this URL
     * @param callback - the callback to run when completed
     * @param context - the context of the callback
     */
    function addFrameToBodyAndBind(src, domain) {
        iFramesObj[domain].loadCallback = function (eventData) {
            if(iFramesObj[domain].iFrameOnloadTimeout){
                clearTimeout(iFramesObj[domain].iFrameOnloadTimeout);
                delete iFramesObj[domain].iFrameOnloadTimeout;
            }
            validateFrame(domain, eventData);
        };
        setIFrameLocation(iFramesObj[domain].elem, src);
        bindEvent(iFramesObj[domain].elem, "load", iFramesObj[domain].loadCallback );
        iFramesObj[domain].iFrameOnloadTimeout = setTimeout(iFramesObj[domain].loadCallback, 5000);
        document.body.appendChild(iFramesObj[domain].elem);
    }

    /**
     * Increments our counters of requests made
     */
    function incrementCallCounters() {
        callCount = callCount + 1;
        pendingCount = pendingCount + 1;
    }

    /**
     * Queues requests for existing iFrames that have not loaded yet
     * @param domain
     * @param msgObj
     * @return {Boolean}
     */
    function queueForFrame(domain, msgObj) {
        pendingFrameReqQueue[domain] = pendingFrameReqQueue[domain] || [];
        pendingFrameReqQueue[domain].push(msgObj);
        bufferedCount = bufferedCount + 1;
        return true;
    }

    /**
     * Default response when an iFrame is being added
     * and one allready exists for that subdomain
     * @param domain - the domain of the iframe
     * @param success - the callback passed in externally
     * @param context - the context to run the callback in
     * @return {*} - returns a string validated state
     */
    function frameExists(domain, success, context) {
        var res = getFrameInfo(domain);
        runCallBack(success, context, res);
        return iFramesObj[domain].validated;
    }

    /**
     * Creates an iFrame in memory and sets the default attributes except the actual URL
     * Does not attach to DOM at this point
     * @param id - a passed in ID for easy lookup later
     * @return {Element} - the detached iFrame element
     */
    function createiFrame(id) {
        var frame = document.createElement("IFRAME");
        frame.setAttribute("id", id);
        frame.setAttribute("name", id);
        frame.style.width = "0px";
        frame.style.height = "0px";
        frame.style.position = "absolute";
        frame.style.top = "-1000px";
        frame.style.left = "-1000px";

        return frame;
    }

    /**
     * Queues a callback for when we get responses from the iFrame
     * @param callId - the UID we sent to the iFrame
     * @param success - the success method passed in
     * @param error - the error method passed in
     * @param progress - the progress method passed in
     * @param context - the execution context for the callbacks
     * @param timeout - the timeout for this request
     * @return {Boolean} - a boolean indicating we queued the request
     */
    function queueCallback(callId, success, error, progress, context, timeout) {
        var msgQueued = false;
        if (callId && success && typeof success === 'function') {
            callbacks[callId] = { success: success, error: error, progress: progress, ctx: context, launchTime: new Date(), timeout: (timeout + 1000) || rDefaults.timeout };
            msgQueued = true;
        }
        return msgQueued;
    }

    /**
     * Removes a request from our callback queue
     * @param callId - the identifier of this request
     * @return {Boolean} - if the request was found and de-queued
     */
    function deQueueCallback(callId) {
        if (callbacks[callId]) {
            callbacks[callId] = null;
            delete callbacks[callId];
            return true;
        }
        return false;
    }

    /**
     * Validation method for an iFrame queued when the iframe fires the load event
     * When this event is triggered it queues the validation request from the internal iFrame
     * with a slight delay, this seems the only way to make it work 100% of the time
     * @param domain - the domain of the iframe
     * @param callback - the extenal callback to run
     * @param context - the external callback execution context
     * @return {Boolean}
     */
    function validateFrame(domain, eventData) {
        log("onload validation called " +  domain , logType.INFO, "validateFrame");
        var callback = function (data) {
            validateFrameCallback(data, domain);
        };
        if(eventData && eventData.error){//This is if a timeout called this method, in that case there is no need to try and talk to the frame - we know it failed
            validateFrameCallback(eventData, domain);
        }else{
            setTimeout(function () { issueCall({ domain: domain, success: callback, error: callback, validation: true, timeout: 100, retries: -1, defaults: iFramesObj[domain].defaults }); }, 500);
        }
        return true;
    }

    /**
     * Callback function to validate a frame has loaded
     * It can also run a success/error function to notify the frame load outcome
     * This also triggers errors or issues any pending calls in the order
     * @param data
     * @param domain
     * @return {*}
     */
    function validateFrameCallback(data, domain) {
        var frameLoaded;
        var frame = iFramesObj[domain];//Reference for callbacks after cleanup
        log("running validation of domain " +  domain , logType.INFO, "validateFrameCallback");
        if (frame) {
            iFramesObj[domain].validated = data && data.error ? validationState.FAILED : validationState.VALIDATED;
            frameLoaded = (iFramesObj[domain].validated === validationState.VALIDATED);
            if(frameLoaded){
                runFrameValidated(domain, data);
            }else if(iFramesObj[domain].reloadObj && iFramesObj[domain].reloadObj.retriesLeft > 0){
                runReloadAttempt(domain);
            }else{
                runFrameFailedToLoad(domain);
            }
        }
        frame = null;
        return frameLoaded;
    }

    /**
     * Executes when a frame has been loaded successfully and can now be used for communication
     * @param domain
     */
    function runFrameValidated(domain, data){
        log("FrameLoaded " +  domain , logType.INFO, "runFrameValidated");
        if(data && data.info && data.info.defaults){//Get back the defaults defined for the XHR instance used in the iFrame
            iFramesObj[domain].defaults = data.info.defaults;
        }
        iFrameLoaded.domain = domain;
        runCallBack(iFramesObj[domain].success, iFramesObj[domain].context, iFrameLoaded);
        cleanUpReloadObject(domain);
        runQueuedRequests(domain, true);
    }

    /**
     * Runs when a frame has failed to load and we need to clean it up along
     * with any pending requests
     * @param domain
     */
    function runFrameFailedToLoad(domain){
        log("iFrame is a teapot " +  domain , logType.ERROR, "runFrameFailedToLoad");
        if(iFramesObj[domain].error){//Work with local pointer
            var errResponse = getErrorResponse(0, iFrameTeapot);
            errResponse.domain = domain;
            runCallBack(iFramesObj[domain].error, iFramesObj[domain].context, errResponse );
        }
        cleanupIFrame(domain);
        runQueuedRequests(domain, false);
    }

    /**
     * Executed in case we have a reload state for this iFrame
     * @param domain
     */
    function runReloadAttempt(domain){
        log("Retry " +  domain , "info", "runReloadAttempt");
        runQueuedRequests(domain, false);
        handleReloadState({ origin: domain});
    }

    /**
     * Runs any queued callbacks before the iFrame loaded
     * In the order they were queued
     * @param domain
     * @param frameLoaded
     */
    function runQueuedRequests(domain,frameLoaded){
        log("Running buffer queue : " + domain + " loaded: " + frameLoaded , logType.INFO , "runQueuedRequests");
        if (pendingFrameReqQueue[domain] && pendingFrameReqQueue[domain].length > 0) {
            do {
                var pending = pendingFrameReqQueue[domain].shift();
                if (frameLoaded) {
                    issueCall(pending);
                } else {
                    runCallBack(pending.error, pending.context, { responseCode: 600, error: "Transport - postmessage - unable to run request: " + domain, body: "ERROR" });
                }
            } while (pendingFrameReqQueue[domain].length > 0);
            pendingFrameReqQueue[domain] = null;
            delete pendingFrameReqQueue[domain];
        }
    }

    function cleanupIFrame(domain){
        log("Cleaning up failed iFrame: " + domain,  logType.INFO , "cleanupIFrame");
        if(iFramesObj[domain]){
            unbindEvent(iFramesObj[domain].elem, "load",iFramesObj[domain].loadCallback);
            iFramesObj[domain].elem.parentNode.removeChild(iFramesObj[domain].elem);
            iFramesObj[domain] = null;//Removes the iFrame from the domain map, before callback in case it re-registers a frame
            delete iFramesObj[domain];
        }
    }

    /**
     * Default callback if no iframe was found that can handle the request
     * @param domain
     * @param callback
     * @param context
     * @return {Boolean}
     */
    function noFrameFound(domain, callback, context) {
        log("Frame not found for domain: " + domain,  logType.ERROR , "noFrameFound");
        runCallBack(callback, { responseCode: 600, error: "Transport - postmessage - unable to run request: " + domain, body: "ERROR" }, context);
        return false;
    }

    /**
     * Validates the request can be handled by this transport
     * Checks that an iframe exists or one is pending validation
     * for the sub-domain of the request
     * @param msgObj
     * @return {Boolean}
     */
    function isValidRequest(msgObj) {
        var validRequest = false;
        if (window['postMessage'] && window.JSON){//we need both to be able to run a request
            if (msgObj && msgObj.success && ((msgObj.domain && msgObj.validation) || msgObj.url)) {
                msgObj.domain = msgObj.domain || getSubDomain(msgObj.url);
                if (iFramesObj[msgObj.domain] || iFrameList[msgObj.domain]) {
                    validRequest = true;
                }
            }
        }
        return validRequest;
    }

    /**
     * Issues a call to the domain requested by passing the request to the child iFrame if a validated iFrame exists
     * If an iFrame was configured but never used it triggers it's addition and queues the callback
     * If an iFrame was started but is pending validation, it queues the request for when the frame is validated
     * @param msgObj
     * @return {Boolean}
     */
    function issueCall(msgObj) {
        var messageSent = false;
        if (initialised && isValidRequest(msgObj)) {
            if (iFramesObj[msgObj.domain]) {
                if (iFramesObj[msgObj.domain].validated === validationState.PENDING && !msgObj.validation) {
                    messageSent = queueForFrame(msgObj.domain, msgObj);
                    bufferedCount = bufferedCount + 1;
                } else {
                    messageSent = sendRequest(msgObj);
                    if (messageSent) {
                        incrementCallCounters();
                    }else{//If message was not sent, we invoke immediate timeout
                        callbacks[msgObj.callId].timeout = 0;
                    }
                }
            } else {
                log("Adding iFrame to DOM - first request: " + msgObj.domain,  logType.INFO , "issueCall");
                messageSent = queueForFrame(msgObj.domain, msgObj);//Queue the callback for this frame
                addFrame(iFrameList[msgObj.domain]);
                delete iFrameList[msgObj.domain];//remove from our pending for use list
            }
        } else {
            messageSent = noFrameFound(msgObj.domain, msgObj.error, msgObj.context);
        }
        return messageSent;
    }

    /**
     * Sends the actual request to the child frame
     * while setting up callbacks
     * @param msgObj
     * @return {Boolean}
     */
    function sendRequest(msgObj) {
        var msgToSend, msgSent = false;
        msgObj = setUpMessageObj(msgObj);
        msgToSend = cloneSimpleObj(msgObj);
        msgToSend = JSON.stringify(msgToSend);
        log("sending msg to domain " +  msgObj.domain, logType.DEBUG, "sendRequest");
        var parentTimeout = (msgObj.timeout * (msgObj.retries + 1)) + 2000;
        queueCallback(msgObj.callId, msgObj.success, msgObj.error, msgObj.progress, msgObj.context, parentTimeout );
        try {
            msgSent = postTheMessage(msgObj.domain, msgToSend);
            errorTimeOutId = setTimeout(checkForErrors, 1000);
        }
        catch (err) {
            log("Error trying to send message " + err? err.message: "" , logType.ERROR, "sendMessageToFrame");
            msgSent = false;
        }
        return msgSent;
    }

    /**
     * Sets up the call to have a callId we use to identify the returning message
     * Sets up the callback domain
     * Sets up triggering of progress events if a progress callback was supplied
     * @param msgObj
     * @return {*}
     */
    function setUpMessageObj(msgObj) {
        msgObj.callId = createUId("call");
        msgObj.returnDomain = docSubDomain;
        if (msgObj.progress) {
            msgObj.fireProgress = true;
        }
        msgObj.headers = msgObj.headers || {};
        msgObj.headers["LP-URL"] = window.location.href;
        return msgObj;
    }

    /**
     * Posts the message to the sub-domain iFrame
     * Increments the counters so we know how many requests were
     * sent to this iFrame
     * @param domain
     * @param msgToSend
     * @return {Boolean}
     */
    function postTheMessage(domain, msgToSend) {
        var messageSent = false;
        try {
            iFramesObj[domain].elem.contentWindow.postMessage(msgToSend, domain);
            iFramesObj[domain].requestCount = iFramesObj[domain].requestCount + 1;
            messageSent = true;
        } catch (err) {
            log("Error trying to send message: " + err? err.message: "" , logType.ERROR, "sendMessageToFrame");
        }
        return messageSent;
    }

    /**
     * Checks for timeout errors on messages we never got replies on
     * @return {Boolean}
     */
    function checkForErrors() {
        if (errorTimeOutId) {
            clearTimeout(errorTimeOutId);
        }
        errorTimeOutId = null;
        var now = new Date();
        var pendReqCount = 0;
        var timedOutCallbacks = [];
        for (var key in callbacks) {//Check for requests taking too long
            if (callbacks.hasOwnProperty(key) && callbacks[key].launchTime) {
                var timeElapsed = now - callbacks[key].launchTime;
                if (timeElapsed > callbacks[key].timeout) {//Queue error callback
                    timedOutCallbacks.push(key);
                } else {
                    pendReqCount = pendReqCount + 1;
                }
            }
        }
        if(timedOutCallbacks.length){
            log("Checking errors found " + timedOutCallbacks.length + " timeout callbacks to call",  logType.DEBUG , "checkForErrors");
            for (var i = 0; i < timedOutCallbacks.length; i++) {//Execute the callbacks
                getCallBack(getErrorResponse(timedOutCallbacks[i], postMessageTimeout));
            }
        }
        if (pendReqCount > 0) {
            errorTimeOutId = setTimeout(checkForErrors, 1000);
        }
        return true;
    }

    /**
     * Flat clone method, only clones data ignoring functions
     * @param obj
     * @return {Object}
     */
    function cloneSimpleObj(obj) {
        var resObj = {};
        if (obj.constructor === Object) {
            for (var key in obj) {
                try {
                    if (obj.hasOwnProperty(key) && typeof obj[key] !== "function") {
                        resObj[key] = obj[key];
                    }
                } catch (err) {
                    log("Error creating request object data clone: " + err? err.message: "" , logType.ERROR, "cloneSimpleObj");
                }
            }
        } else if (obj.constructor === Array) {
            resObj = obj.slice(0) || [];
        } else if (typeof obj !== 'function') {
            resObj = obj;
        }
        return resObj;
    }

    /**
     * Retrieves and triggers the correct callback for
     * the response we got from the iFrame
     * @param data
     * @return {Boolean}
     */
    function getCallBack(data, origin) {
        if ((data.callId && callbacks[data.callId]) || data.responseType === responseTypes.reloading) {
            var cbInfo = callbacks[data.callId];
            var callBack, clearData = false;
            try {
                switch (data.responseType) {
                    case responseTypes.completed:
                        callBack = cbInfo.success;
                        clearData = true;
                        break;
                    case responseTypes.error:
                        callBack = cbInfo.error;
                        clearData = true;
                        errorCount = errorCount + 1;
                        break;
                    case responseTypes.progress:
                        callBack = cbInfo.progress;
                        break;
                    case responseTypes.reloading:
                        data.origin = origin;
                        callBack = handleReloadState;
                        break;
                }

                if (clearData) {
                    deQueueCallback(data.callId);
                    cleanUpPropertiesFromReq(data);
                    pendingCount = pendingCount > 0 ? 0 : pendingCount - 1;
                }

                if (callBack && typeof callBack === 'function') {
                    runCallBack(callBack, (cbInfo && cbInfo.ctx) || null, data);
                }
                callBack = null;
                cbInfo = null;

            } catch (err) {
                log("Error in executing callback: " + err? err.message: "" , "ERROR", "runCallback");
                return false;
            }
        }
        return true;
    }

    /**
     * Handles a case where we identify too
     * many errors from an iframe and need to pause new
     * requests to it
     */
    function handleReloadState(data){
        log("Got reload request from " + data.origin, logType.DEBUG , "handleReloadState");
        iFramesObj[data.origin].validated = validationState.PENDING;
        if(!iFramesObj[data.origin].reloadObj){
            log("Creating reloadObj" + data.origin,  logType.DEBUG , "handleReloadState");
            iFramesObj[data.origin].reloadObj = createReloadObject(data.origin);
        }
        reloadIFrame(data.origin);
    }

    /**
     * Sets the iFrame to reload indicating time and counting down the retries
     * @param domain
     */
    function reloadIFrame(domain){
        log("Reload try for domain "  + domain + " ,retries left "  + iFramesObj[domain].reloadObj.retriesLeft,  logType.DEBUG , "reloadIFrame");
        iFramesObj[domain].reloadObj.retriesLeft = iFramesObj[domain].reloadObj.retriesLeft - 1;
        if(iFramesObj[domain].reloadObj.setLocationTimeout){
            clearTimeout(iFramesObj[domain].reloadObj.setLocationTimeout);
        }
        if(iFramesObj[domain].reloadObj.retry){
            iFramesObj[domain].reloadObj.setLocationTimeout =  setTimeout(createIFrameLocationFunction(domain), iFramesObj[domain].reloadInterval);
        }else{
            iFramesObj[domain].reloadObj.retry = true;
            createIFrameLocationFunction(domain)();
        }
    }

    /**
     * Creates a function that sets the iFrames src and times a timeout for the reload
     * @param domain
     * @return {Function}
     */
    function createIFrameLocationFunction(domain){
        return function(){
            iFramesObj[domain].iFrameOnloadTimeout = setTimeout(function(){
                validateFrame(domain, { error: { code: 404, message: "Frame did not trigger load" }});
            }, 5000);
            setIFrameLocation(iFramesObj[domain].elem,iFramesObj[domain].url);
        };
    }

    /**
     * Sets the iFrame location using a cache bust mechanism,
     * making sure the iFrame is actually loaded and not from cache
     * @param element
     * @param src
     */
    function setIFrameLocation(element, src){
        src += (src.indexOf("?") > 0 ? "&bust=" : "?bust=");
        src += new Date().getTime();
        log("Setting iFrame to URL: " + src, logType.INFO, "setIFrameLocation");
        element.setAttribute("src", src);
    }

    /**
     * Creates the retry object for the retry session
     * @param domain
     * @return {Object}
     */
    function createReloadObject(domain){
        log("Creating reload object " + domain,  logType.INFO , "createReloadObject");
        var retryCount = iFramesObj[domain].maxReloadRetries;
        return {
            retriesLeft : retryCount
        };
    }

    /**
     * Cleans up the transient reload object
     * @param domain
     */
    function cleanUpReloadObject(domain){
        log("Cleaning up reload object for this instance" + domain,  logType.INFO , "cleanUpReloadObject");
        if(iFramesObj[domain].reloadObj){
            if(iFramesObj[domain].reloadObj.setLocationTimeout){
                clearTimeout(iFramesObj[domain].reloadObj.setLocationTimeout);
            }
            iFramesObj[domain].reloadObj = null;
            delete iFramesObj[domain].reloadObj;
        }
    }

    /**
     * Deletes any properties we set on the original request
     * Cleanup
     * @param reqObj
     */
    function cleanUpPropertiesFromReq(reqObj) {
        var properties = ["callId", "responseType"];
        for (var i = 0; i < properties.length; i++) {
            reqObj[properties[i]] = null;
            delete reqObj[properties[i]];
        }
    }

    /**
     * Method for querying info about a specific iFrame state
     * @param domain
     * @return {*}
     */
    function getFrameInfo(domain) {
        var resFrame;
        if (iFramesObj[domain]) {
            resFrame = {
                domain: domain,
                url: iFramesObj[domain].url,
                validated: iFramesObj[domain].validated,
                requestCount: iFramesObj[domain].requestCount,
                defaults: iFramesObj[domain].defaults,
                started: (iFramesObj[domain].validated === validationState.VALIDATED)
            };
        }
        return resFrame;
    }

    /**
     * Gets a list of active iFrames and their state (uses getFrameInfo)
     * @return {Object}
     */
    function getAllFramesInfo() {
        var framesResult = {};
        for (var key in iFramesObj) {
            if (iFramesObj.hasOwnProperty(key)) {
                framesResult[iFramesObj[key].domain] = getFrameInfo(iFramesObj[key].domain);
            }
        }
        return framesResult;
    }

    /**
     * Protected method for executing callbacks
     * @param func
     * @param context
     * @param data
     */
    function runCallBack(func, context, data) {
        if (func && typeof func === 'function') {
            try {
                func.call(context || null, data);
            } catch (err) {
                log("Error in executing callback: " + err? err.message: "" , logType.ERROR, "runCallback");
            }
        }
    }

    /**
     * Handles messages from the iFrames
     * @param messageEvent
     */
    function handleMessageFromFrame(messageEvent) {
        var result, origin;
        try {
            origin = messageEvent.origin;
            if(!iFramesObj[origin]){//This frame isn't ours! we don't want to know what it's doing!
                return;
            }
            result = JSON.parse(messageEvent.data);
            if (result.body && typeof result.body === 'string') {
                try {
                    result.body = JSON.parse(result.body);
                } catch (exc) {
                    log("Error in parsing message body from frame, origin: " + origin, logType.DEBUG, "handleMessageFromFrame");
                }
            }
        } catch (exc) {
            result = null;
            log("Error in handeling message from frame, origin: " + origin,logType.ERROR, "handleMessageFromFrame");
        }
        if (result && (result.callId || result.responseType === responseTypes.reloading)) {
            getCallBack(result, origin);
        }
    }

    /**
     * Method for logging
     * @param msg
     * @param type
     * @param callingMethod
     */
    function log(msg, type, callingMethod) {
//        if(window.console){
//            console.log(new Date().toLocaleTimeString() + " " +  type + " " + callingMethod + " : " + msg);
//        }
        if (window.lpBilling && lpBilling.log) {
            lpBilling.log(msg, type, callingMethod);
        }
    }

    /**
     * Initialising method
     * Sets defaults on the parent transport
     * Allows passing an iFrame objects for later use with configuration as objects, format:
     * frames: { url: IFRAME_LOCATION, defaults: DEFAULT_CONFIGURATION_FOR_XHR }
     * @param configurationObj
     */
    function configure(configurationObj) {
        if (configurationObj) {
            if (configurationObj.frames) {
                configurationObj.frames = configurationObj.frames.constructor === Array ? configurationObj.frames : [configurationObj.frames];
                for (var i = 0; i < configurationObj.frames.length; i++) {
                    addiFrameLocation(configurationObj.frames[i]);
                }
            }
            if (configurationObj.defaults) {
                for (var key in configurationObj.defaults) {
                    if (rDefaults.hasOwnProperty(key) && configurationObj.defaults.hasOwnProperty(key)) {
                        rDefaults[key] = configurationObj.defaults[key];
                    }
                }
            }
        }
        initialised = true;
    }
    //Public methods
    var publicAPI = {
        init: function(){
            if(lpBilling && lpBilling.taglets && lpBilling.taglets.lpAjax){
                try{
                    lpBilling.taglets.lpAjax.addTransport(transportType, publicAPI);
                }catch(exc){}
            }
        },
        issueCall: issueCall,
        isValidRequest: isValidRequest,
        getVersion: function () { return version; },
        getName: function () { return transportType; },
        configure: configure,
        getFrameData: getFrameInfo,
        inspect: function () {
            return {
                name: transportType,
                version: version,
                callsMade: callCount,
                errorsFound: errorCount,
                pending: pendingCount,
                defaults: rDefaults,
                iFrameList: cloneSimpleObj(iFrameList),
                activeFrames: getAllFramesInfo()
            };
        }
    };

    if(lpBilling && lpBilling.taglets && lpBilling.taglets.lpAjax){
        try{
            lpBilling.taglets.lpAjax.addTransport(transportType, publicAPI);
        }catch(exc){}
    }

    return publicAPI;
})(window);

/*
****  lpajax_utils.js  *****
*/
/**
 * @fileOverview Contains utilities for the lpajax system - core and transports
 *
 * @author Efim Dimenstein
 * @version 0.1 - 2012-08-20
 */
/**
 * Contains utilities for the lpajax system - core and transports
 *
 * @namespace - contains the transport logic
 */
lpBilling.taglets.lpajax_utils = {
    /**
     * The name of the object
     * @type String
     */
    _name : 'lpajax_utils',
    /**
     * The version of the object
     * @type String
     */
    _v : '0.1',
    /**
     * An `each` implementation, aka `forEach`<br>
     * Handles objects with the built-in `forEach`, arrays, and raw objects<br>
     * Delegates to **ECMAScript 5**'s native `forEach` if available
     *
     * @param {Object} obj list of elements
     * @param {Object} iterator
     * @param {Object} context
     * @example
     * lpBilling.taglets.lpajax_utils.each([1, 2, 3], function(num){ alert(num); });
     * result: alerts each number in turn...
     * lpBilling.taglets.lpajax_utils.each({one : 1, two : 2, three : 3}, function(num, key){ alert(num); });
     * result: alerts each number in turn...
     */
    each : function(obj, iterator, context) {
        if (obj == null) {return;}
        var nativeForEach = Array.prototype.forEach;

        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        }
        else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (i in obj && iterator.call(context, obj[i], i, obj) === {}) {return;}
            }
        } else {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === {}) {return;}
                }
            }
        }
    },
    /**
     * Copy all of the properties in the source objects over to the destination object, and return the destination object.<br>
     * It's in-order, so the last source will override properties of the same name in previous arguments
     *
     * @param {Object} obj a request object (see lpAjax for detailed description)
     * @example
     * lpBilling.taglets.lpajax_utils.extend(destination, *sources)
     * lpBilling.taglets.lpajax_utils.extend({name : 'moe'}, {age : 50});
     * result: {name : 'moe', age : 50}
     */
    extend : function(obj) {
        this.each(Array.prototype.slice.call(arguments, 1), function(source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        });
        return obj;
    },
    /**
     * Method to check if object is empty<br>
     *
     * @param {Object} o any object
     * @returns true if object is empty and false otherwise
     * @example
     * lpBilling.taglets.lpajax_utils.isEmptyObj({}) - return true
     * lpBilling.taglets.lpajax_utils.isEmptyObj({name : 'moe'}); - return false
     */
    isEmptyObj: function( o ) {
        for (var n in o ) {
            return false;
        }
        return true;
    },

    init : function(){

    }
};

/*
****  postmessage  *****
*/
lpBilling.taglets.postmessage = lpBilling.taglets.postmessage || (function (window) {

    var version = "1.0.5";
    var transportType = "postmessage";
    var initialised = true;
    var iFramesObj = {};
    var callbacks = {};
    var pendingFrameReqQueue = {};
    var callCount = 0;
    var errorCount = 0;
    var pendingCount = 0;
    var bufferedCount = 0;
    var iFrameList = {};
    var errorTimeOutId;
    var logType = { DEBUG: "DEBUG", INFO: "INFO", ERROR:"ERROR"};
    var docSubDomain = getSubDomain(document.location.href);
    var responseTypes  = { progress: "progressLoad", completed: "completeLoad", error: "errorLoad", reloading: "reloading" };
    var postMessageTimeout = { responseType: responseTypes.error, responseCode: 404, message: "Request timed out on parent postMessage layer", name: "TIMEOUT"};
    var iFrameLoaded = { responseType: responseTypes.success, responseCode: 200, message: "iFrame has successfully loaded", name: "OK"};
    var iFrameTeapot = { responseType: responseTypes.error, responseCode: 418, message: "This iFrame is a teapot, not very useful for communication but lovely for earl grey", name: "TEAPOT" };//See rfc http://www.ietf.org/rfc/rfc2324.txt
    var rDefaults = { timeout: 60000 };

    bindEvent(window, "message", handleMessageFromFrame);
    /**
     * Enumeration of the possible iframe states
     * @type {Object}
     */
    var validationState = {
        VALIDATED: "valid",
        PENDING: "pending",
        FAILED: "failed"
    };

    /**
     * Binding function for DOM elements
     * @param elem - the element we're binding to
     * @param eventName - the event we're listening on
     * @param callback - our callback for when it happens
     */
    function bindEvent(elem, eventName, callback) {
        if (elem.addEventListener) {
            elem.addEventListener(eventName, callback, false);
        } else {
            elem.attachEvent("on" + eventName, callback);
        }
    }

    /**
     * Creates a new error response object
     * @param callId
     * @param reponseObj
     * @return {Object}
     */
    function getErrorResponse(callId, responseObj){
        return { callId: callId, responseType: responseObj.responseType, responseCode: responseObj.responseCode, error: { message: responseObj.message, id: responseObj.responseCode, name: responseObj.name}};
    }

    /**
     * Unbinds a DOM event
     * @param elem
     * @param eventName
     * @param callback
     */
    function unbindEvent(elem, eventName, callback) {
        if (elem.removeEventListener) {
            elem.removeEventListener(eventName, callback, false);
        } else if(elem.detachEvent){
            elem.detachEvent("on" + eventName, callback);
        }
    }

    /**
     * Creates a Unique identifier with a prefix
     * @return {String}
     */
    function createUId(preFix) {
        return preFix + "_" + Math.floor(Math.random() * 100000) + "_" + Math.floor(Math.random() * 100000);
    }

    /**
     * Function to extract the sub domain from any URL
     * @param url
     * @return {String}
     */
    function getSubDomain(url) {
        var domainRegEx = new RegExp(/(http{1}s{0,1}?:\/\/)([^\/\?]+)(\/?)/ig);
        var matches, domain = null;
        if (url.indexOf("http") === 0) {
            matches = domainRegEx.exec(url);
        } else {
            matches = domainRegEx.exec(window.location.href);
        }
        if (matches && matches.length >= 3 && matches[2] !== "") {
            domain = matches[1].toLowerCase() + matches[2].toLowerCase(); // 0 - full match 1- HTTPS 2- domain
        }
        return domain;
    }

    /**
     * Adds an iframe to our list of potential iframes
     * Also checks for defaults definition of requests for that iframe
     * If none existent sets the defaults defined for the transport
     * @param frameObject
     * @return {Boolean}
     */
    function addiFrameLocation(frameObject) {
        var added = false, domain;
        if (!frameObject || !frameObject.url) {
            log("iFrame configuration empty or missing url parameter", logType.ERROR, "addiFrameLocation");
            return added;
        }
        domain = getSubDomain(frameObject.url);
        if (iFramesObj[domain] || iFrameList[domain]) {
            added = false;
        } else {
            iFrameList[domain] = frameObject;
            added = true;
        }
        return added;
    }

    /**
     * Adds the frame to the DOM and queues a listener
     * To know if it has loaded
     * @param src - the URL for the iframe
     * @param defaults  - the default configuration for this iFrame
     * @param success - the validation callback supplied from externally
     * @param context - the execution context for the external callback
     * @param delayLoad - if the frame should be loaded with timeout (for refresh scenarios where other scripts need to run before)
     * @error error - callback in case the iFrame dies
     * @return {*} - returns string if the frame is pending or exists
     */
    function addFrame(iFrameConfiguration) {
        //url, defaults, callback ||  success, context, delayLoad, error
        var domain = getSubDomain(iFrameConfiguration.url);
        if (iFramesObj[domain]) {
            return frameExists(domain, success, context);
        }
        var id = createUId("fr");

        iFramesObj[domain] = {
            elem: createiFrame(id),//The iFrame element on the page
            url: iFrameConfiguration.url,//The iFrame src URL
            validated: validationState.PENDING,//The validation state
            defaults: iFrameConfiguration.defaults || {},//Defaults for this iFrame
            delayLoad: isNaN(iFrameConfiguration.delayLoad) ? 0:  iFrameConfiguration.delayLoad,//Delayload configuration for adding to DOM, default is end of queue
            requestCount: 0,//The number of requests issued to this iFrame
            success: iFrameConfiguration.callback || iFrameConfiguration.success,//The callback when the frame has loaded
            error: iFrameConfiguration.error,//An error callback when the frame is dead
            maxReloadRetries: iFrameConfiguration.maxReloadRetries || 3,//The number of tries to revive this iFrame
            reloadInterval: iFrameConfiguration.reloadInterval * 1000 || 30000//The timeout between reload intervals
        };

        setTimeout(function () {//Always timed out for best compatablity
            addFrameToBodyAndBind(iFrameConfiguration.url , domain);
        }, iFramesObj[domain].delayLoad);
        log("iFrame Queued to load " +  domain , logType.INFO, "addFrame");
        return validationState.PENDING;
    }

    /**
     * Adds the iframe to the DOM, sets teh SRC URL and starts the validation process
     * @param src - the iframe URL
     * @param domain - the domain of this URL
     * @param callback - the callback to run when completed
     * @param context - the context of the callback
     */
    function addFrameToBodyAndBind(src, domain) {
        iFramesObj[domain].loadCallback = function (eventData) {
            if(iFramesObj[domain].iFrameOnloadTimeout){
                clearTimeout(iFramesObj[domain].iFrameOnloadTimeout);
                delete iFramesObj[domain].iFrameOnloadTimeout;
            }
            validateFrame(domain, eventData);
        };
        setIFrameLocation(iFramesObj[domain].elem, src);
        bindEvent(iFramesObj[domain].elem, "load", iFramesObj[domain].loadCallback );
        iFramesObj[domain].iFrameOnloadTimeout = setTimeout(iFramesObj[domain].loadCallback, 5000);
		console.log("iframe id=" + iFramesObj[domain].elem);
        document.body.appendChild(iFramesObj[domain].elem);
    }

    /**
     * Increments our counters of requests made
     */
    function incrementCallCounters() {
        callCount = callCount + 1;
        pendingCount = pendingCount + 1;
    }

    /**
     * Queues requests for existing iFrames that have not loaded yet
     * @param domain
     * @param msgObj
     * @return {Boolean}
     */
    function queueForFrame(domain, msgObj) {
        pendingFrameReqQueue[domain] = pendingFrameReqQueue[domain] || [];
        pendingFrameReqQueue[domain].push(msgObj);
        bufferedCount = bufferedCount + 1;
        return true;
    }

    /**
     * Default response when an iFrame is being added
     * and one allready exists for that subdomain
     * @param domain - the domain of the iframe
     * @param success - the callback passed in externally
     * @param context - the context to run the callback in
     * @return {*} - returns a string validated state
     */
    function frameExists(domain, success, context) {
        var res = getFrameInfo(domain);
        runCallBack(success, context, res);
        return iFramesObj[domain].validated;
    }

    /**
     * Creates an iFrame in memory and sets the default attributes except the actual URL
     * Does not attach to DOM at this point
     * @param id - a passed in ID for easy lookup later
     * @return {Element} - the detached iFrame element
     */
    function createiFrame(id) {
        var frame = document.createElement("IFRAME");
        frame.setAttribute("id", id);
        frame.setAttribute("name", id);
        frame.style.width = "0px";
        frame.style.height = "0px";
        frame.style.position = "absolute";
        frame.style.top = "-1000px";
        frame.style.left = "-1000px";

        return frame;
    }

    /**
     * Queues a callback for when we get responses from the iFrame
     * @param callId - the UID we sent to the iFrame
     * @param success - the success method passed in
     * @param error - the error method passed in
     * @param progress - the progress method passed in
     * @param context - the execution context for the callbacks
     * @param timeout - the timeout for this request
     * @return {Boolean} - a boolean indicating we queued the request
     */
    function queueCallback(callId, success, error, progress, context, timeout) {
        var msgQueued = false;
        if (callId && success && typeof success === 'function') {
            callbacks[callId] = { success: success, error: error, progress: progress, ctx: context, launchTime: new Date(), timeout: (timeout + 1000) || rDefaults.timeout };
            msgQueued = true;
        }
        return msgQueued;
    }

    /**
     * Removes a request from our callback queue
     * @param callId - the identifier of this request
     * @return {Boolean} - if the request was found and de-queued
     */
    function deQueueCallback(callId) {
        if (callbacks[callId]) {
            callbacks[callId] = null;
            delete callbacks[callId];
            return true;
        }
        return false;
    }

    /**
     * Validation method for an iFrame queued when the iframe fires the load event
     * When this event is triggered it queues the validation request from the internal iFrame
     * with a slight delay, this seems the only way to make it work 100% of the time
     * @param domain - the domain of the iframe
     * @param callback - the extenal callback to run
     * @param context - the external callback execution context
     * @return {Boolean}
     */
    function validateFrame(domain, eventData) {
        log("onload validation called " +  domain , logType.INFO, "validateFrame");
        var callback = function (data) {
            validateFrameCallback(data, domain);
        };
        if(eventData && eventData.error){//This is if a timeout called this method, in that case there is no need to try and talk to the frame - we know it failed
            validateFrameCallback(eventData, domain);
        }else{
            setTimeout(function () { issueCall({ domain: domain, success: callback, error: callback, validation: true, timeout: 100, retries: -1, defaults: iFramesObj[domain].defaults }); }, 500);
        }
        return true;
    }

    /**
     * Callback function to validate a frame has loaded
     * It can also run a success/error function to notify the frame load outcome
     * This also triggers errors or issues any pending calls in the order
     * @param data
     * @param domain
     * @return {*}
     */
    function validateFrameCallback(data, domain) {
        var frameLoaded;
        var frame = iFramesObj[domain];//Reference for callbacks after cleanup
        log("running validation of domain " +  domain , logType.INFO, "validateFrameCallback");
        if (frame) {
            iFramesObj[domain].validated = data && data.error ? validationState.FAILED : validationState.VALIDATED;
            frameLoaded = (iFramesObj[domain].validated === validationState.VALIDATED);
            if(frameLoaded){
                runFrameValidated(domain, data);
            }else if(iFramesObj[domain].reloadObj && iFramesObj[domain].reloadObj.retriesLeft > 0){
                runReloadAttempt(domain);
            }else{
                runFrameFailedToLoad(domain);
            }
        }
        frame = null;
        return frameLoaded;
    }

    /**
     * Executes when a frame has been loaded successfully and can now be used for communication
     * @param domain
     */
    function runFrameValidated(domain, data){
        log("FrameLoaded " +  domain , logType.INFO, "runFrameValidated");
        if(data && data.info && data.info.defaults){//Get back the defaults defined for the XHR instance used in the iFrame
            iFramesObj[domain].defaults = data.info.defaults;
        }
        iFrameLoaded.domain = domain;
        runCallBack(iFramesObj[domain].success, iFramesObj[domain].context, iFrameLoaded);
        cleanUpReloadObject(domain);
        runQueuedRequests(domain, true);
    }

    /**
     * Runs when a frame has failed to load and we need to clean it up along
     * with any pending requests
     * @param domain
     */
    function runFrameFailedToLoad(domain){
        log("iFrame is a teapot " +  domain , logType.ERROR, "runFrameFailedToLoad");
        if(iFramesObj[domain].error){//Work with local pointer
            var errResponse = getErrorResponse(0, iFrameTeapot);
            errResponse.domain = domain;
            runCallBack(iFramesObj[domain].error, iFramesObj[domain].context, errResponse );
        }
        cleanupIFrame(domain);
        runQueuedRequests(domain, false);
    }

    /**
     * Executed in case we have a reload state for this iFrame
     * @param domain
     */
    function runReloadAttempt(domain){
        log("Retry " +  domain , "info", "runReloadAttempt");
        runQueuedRequests(domain, false);
        handleReloadState({ origin: domain});
    }

    /**
     * Runs any queued callbacks before the iFrame loaded
     * In the order they were queued
     * @param domain
     * @param frameLoaded
     */
    function runQueuedRequests(domain,frameLoaded){
        log("Running buffer queue : " + domain + " loaded: " + frameLoaded , logType.INFO , "runQueuedRequests");
        if (pendingFrameReqQueue[domain] && pendingFrameReqQueue[domain].length > 0) {
            do {
                var pending = pendingFrameReqQueue[domain].shift();
                if (frameLoaded) {
                    issueCall(pending);
                } else {
                    runCallBack(pending.error, pending.context, { responseCode: 600, error: "Transport - postmessage - unable to run request: " + domain, body: "ERROR" });
                }
            } while (pendingFrameReqQueue[domain].length > 0);
            pendingFrameReqQueue[domain] = null;
            delete pendingFrameReqQueue[domain];
        }
    }

    function cleanupIFrame(domain){
        log("Cleaning up failed iFrame: " + domain,  logType.INFO , "cleanupIFrame");
        if(iFramesObj[domain]){
            unbindEvent(iFramesObj[domain].elem, "load",iFramesObj[domain].loadCallback);
            iFramesObj[domain].elem.parentNode.removeChild(iFramesObj[domain].elem);
            iFramesObj[domain] = null;//Removes the iFrame from the domain map, before callback in case it re-registers a frame
            delete iFramesObj[domain];
        }
    }

    /**
     * Default callback if no iframe was found that can handle the request
     * @param domain
     * @param callback
     * @param context
     * @return {Boolean}
     */
    function noFrameFound(domain, callback, context) {
        log("Frame not found for domain: " + domain,  logType.ERROR , "noFrameFound");
        runCallBack(callback, { responseCode: 600, error: "Transport - postmessage - unable to run request: " + domain, body: "ERROR" }, context);
        return false;
    }

    /**
     * Validates the request can be handled by this transport
     * Checks that an iframe exists or one is pending validation
     * for the sub-domain of the request
     * @param msgObj
     * @return {Boolean}
     */
    function isValidRequest(msgObj) {
        var validRequest = false;
        if (window['postMessage'] && window.JSON){//we need both to be able to run a request
            if (msgObj && msgObj.success && ((msgObj.domain && msgObj.validation) || msgObj.url)) {
                msgObj.domain = msgObj.domain || getSubDomain(msgObj.url);
                if (iFramesObj[msgObj.domain] || iFrameList[msgObj.domain]) {
                    validRequest = true;
                }
            }
        }
        return validRequest;
    }

    /**
     * Issues a call to the domain requested by passing the request to the child iFrame if a validated iFrame exists
     * If an iFrame was configured but never used it triggers it's addition and queues the callback
     * If an iFrame was started but is pending validation, it queues the request for when the frame is validated
     * @param msgObj
     * @return {Boolean}
     */
    function issueCall(msgObj) {
        var messageSent = false;
        if (initialised && isValidRequest(msgObj)) {
            if (iFramesObj[msgObj.domain]) {
                if (iFramesObj[msgObj.domain].validated === validationState.PENDING && !msgObj.validation) {
                    messageSent = queueForFrame(msgObj.domain, msgObj);
                    bufferedCount = bufferedCount + 1;
                } else {
                    messageSent = sendRequest(msgObj);
                    if (messageSent) {
                        incrementCallCounters();
                    }else{//If message was not sent, we invoke immediate timeout
                        callbacks[msgObj.callId].timeout = 0;
                    }
                }
            } else {
                log("Adding iFrame to DOM - first request: " + msgObj.domain,  logType.INFO , "issueCall");
                messageSent = queueForFrame(msgObj.domain, msgObj);//Queue the callback for this frame
                addFrame(iFrameList[msgObj.domain]);
                delete iFrameList[msgObj.domain];//remove from our pending for use list
            }
        } else {
            messageSent = noFrameFound(msgObj.domain, msgObj.error, msgObj.context);
        }
        return messageSent;
    }

    /**
     * Sends the actual request to the child frame
     * while setting up callbacks
     * @param msgObj
     * @return {Boolean}
     */
    function sendRequest(msgObj) {
        var msgToSend, msgSent = false;
        msgObj = setUpMessageObj(msgObj);
        msgToSend = cloneSimpleObj(msgObj);
        msgToSend = JSON.stringify(msgToSend);
        log("sending msg to domain " +  msgObj.domain, logType.DEBUG, "sendRequest");
        var parentTimeout = (msgObj.timeout * (msgObj.retries + 1)) + 2000;
        queueCallback(msgObj.callId, msgObj.success, msgObj.error, msgObj.progress, msgObj.context, parentTimeout );
        try {
            msgSent = postTheMessage(msgObj.domain, msgToSend);
            errorTimeOutId = setTimeout(checkForErrors, 1000);
        }
        catch (err) {
            log("Error trying to send message " + err? err.message: "" , logType.ERROR, "sendMessageToFrame");
            msgSent = false;
        }
        return msgSent;
    }

    /**
     * Sets up the call to have a callId we use to identify the returning message
     * Sets up the callback domain
     * Sets up triggering of progress events if a progress callback was supplied
     * @param msgObj
     * @return {*}
     */
    function setUpMessageObj(msgObj) {
        msgObj.callId = createUId("call");
        msgObj.returnDomain = docSubDomain;
        if (msgObj.progress) {
            msgObj.fireProgress = true;
        }
        msgObj.headers = msgObj.headers || {};
        msgObj.headers["LP-URL"] = window.location.href;
        return msgObj;
    }

    /**
     * Posts the message to the sub-domain iFrame
     * Increments the counters so we know how many requests were
     * sent to this iFrame
     * @param domain
     * @param msgToSend
     * @return {Boolean}
     */
    function postTheMessage(domain, msgToSend) {
        var messageSent = false;
        try {
            iFramesObj[domain].elem.contentWindow.postMessage(msgToSend, domain);
            iFramesObj[domain].requestCount = iFramesObj[domain].requestCount + 1;
            messageSent = true;
        } catch (err) {
            log("Error trying to send message: " + err? err.message: "" , logType.ERROR, "sendMessageToFrame");
        }
        return messageSent;
    }

    /**
     * Checks for timeout errors on messages we never got replies on
     * @return {Boolean}
     */
    function checkForErrors() {
        if (errorTimeOutId) {
            clearTimeout(errorTimeOutId);
        }
        errorTimeOutId = null;
        var now = new Date();
        var pendReqCount = 0;
        var timedOutCallbacks = [];
        for (var key in callbacks) {//Check for requests taking too long
            if (callbacks.hasOwnProperty(key) && callbacks[key].launchTime) {
                var timeElapsed = now - callbacks[key].launchTime;
                if (timeElapsed > callbacks[key].timeout) {//Queue error callback
                    timedOutCallbacks.push(key);
                } else {
                    pendReqCount = pendReqCount + 1;
                }
            }
        }
        if(timedOutCallbacks.length){
            log("Checking errors found " + timedOutCallbacks.length + " timeout callbacks to call",  logType.DEBUG , "checkForErrors");
            for (var i = 0; i < timedOutCallbacks.length; i++) {//Execute the callbacks
                getCallBack(getErrorResponse(timedOutCallbacks[i], postMessageTimeout));
            }
        }
        if (pendReqCount > 0) {
            errorTimeOutId = setTimeout(checkForErrors, 1000);
        }
        return true;
    }

    /**
     * Flat clone method, only clones data ignoring functions
     * @param obj
     * @return {Object}
     */
    function cloneSimpleObj(obj) {
        var resObj = {};
        if (obj.constructor === Object) {
            for (var key in obj) {
                try {
                    if (obj.hasOwnProperty(key) && typeof obj[key] !== "function") {
                        resObj[key] = obj[key];
                    }
                } catch (err) {
                    log("Error creating request object data clone: " + err? err.message: "" , logType.ERROR, "cloneSimpleObj");
                }
            }
        } else if (obj.constructor === Array) {
            resObj = obj.slice(0) || [];
        } else if (typeof obj !== 'function') {
            resObj = obj;
        }
        return resObj;
    }

    /**
     * Retrieves and triggers the correct callback for
     * the response we got from the iFrame
     * @param data
     * @return {Boolean}
     */
    function getCallBack(data, origin) {
        if ((data.callId && callbacks[data.callId]) || data.responseType === responseTypes.reloading) {
            var cbInfo = callbacks[data.callId];
            var callBack, clearData = false;
            try {
                switch (data.responseType) {
                    case responseTypes.completed:
                        callBack = cbInfo.success;
                        clearData = true;
                        break;
                    case responseTypes.error:
                        callBack = cbInfo.error;
                        clearData = true;
                        errorCount = errorCount + 1;
                        break;
                    case responseTypes.progress:
                        callBack = cbInfo.progress;
                        break;
                    case responseTypes.reloading:
                        data.origin = origin;
                        callBack = handleReloadState;
                        break;
                }

                if (clearData) {
                    deQueueCallback(data.callId);
                    cleanUpPropertiesFromReq(data);
                    pendingCount = pendingCount > 0 ? 0 : pendingCount - 1;
                }

                if (callBack && typeof callBack === 'function') {
                    runCallBack(callBack, (cbInfo && cbInfo.ctx) || null, data);
                }
                callBack = null;
                cbInfo = null;

            } catch (err) {
                log("Error in executing callback: " + err? err.message: "" , "ERROR", "runCallback");
                return false;
            }
        }
        return true;
    }

    /**
     * Handles a case where we identify too
     * many errors from an iframe and need to pause new
     * requests to it
     */
    function handleReloadState(data){
        log("Got reload request from " + data.origin, logType.DEBUG , "handleReloadState");
        iFramesObj[data.origin].validated = validationState.PENDING;
        if(!iFramesObj[data.origin].reloadObj){
            log("Creating reloadObj" + data.origin,  logType.DEBUG , "handleReloadState");
            iFramesObj[data.origin].reloadObj = createReloadObject(data.origin);
        }
        reloadIFrame(data.origin);
    }

    /**
     * Sets the iFrame to reload indicating time and counting down the retries
     * @param domain
     */
    function reloadIFrame(domain){
        log("Reload try for domain "  + domain + " ,retries left "  + iFramesObj[domain].reloadObj.retriesLeft,  logType.DEBUG , "reloadIFrame");
        iFramesObj[domain].reloadObj.retriesLeft = iFramesObj[domain].reloadObj.retriesLeft - 1;
        if(iFramesObj[domain].reloadObj.setLocationTimeout){
            clearTimeout(iFramesObj[domain].reloadObj.setLocationTimeout);
        }
        if(iFramesObj[domain].reloadObj.retry){
            iFramesObj[domain].reloadObj.setLocationTimeout =  setTimeout(createIFrameLocationFunction(domain), iFramesObj[domain].reloadInterval);
        }else{
            iFramesObj[domain].reloadObj.retry = true;
            createIFrameLocationFunction(domain)();
        }
    }

    /**
     * Creates a function that sets the iFrames src and times a timeout for the reload
     * @param domain
     * @return {Function}
     */
    function createIFrameLocationFunction(domain){
        return function(){
            iFramesObj[domain].iFrameOnloadTimeout = setTimeout(function(){
                validateFrame(domain, { error: { code: 404, message: "Frame did not trigger load" }});
            }, 5000);
            setIFrameLocation(iFramesObj[domain].elem,iFramesObj[domain].url);
        };
    }

    /**
     * Sets the iFrame location using a cache bust mechanism,
     * making sure the iFrame is actually loaded and not from cache
     * @param element
     * @param src
     */
    function setIFrameLocation(element, src){
        src += (src.indexOf("?") > 0 ? "&bust=" : "?bust=");
        src += new Date().getTime();
        log("Setting iFrame to URL: " + src, logType.INFO, "setIFrameLocation");
        element.setAttribute("src", src);
    }

    /**
     * Creates the retry object for the retry session
     * @param domain
     * @return {Object}
     */
    function createReloadObject(domain){
        log("Creating reload object " + domain,  logType.INFO , "createReloadObject");
        var retryCount = iFramesObj[domain].maxReloadRetries;
        return {
            retriesLeft : retryCount
        };
    }

    /**
     * Cleans up the transient reload object
     * @param domain
     */
    function cleanUpReloadObject(domain){
        log("Cleaning up reload object for this instance" + domain,  logType.INFO , "cleanUpReloadObject");
        if(iFramesObj[domain].reloadObj){
            if(iFramesObj[domain].reloadObj.setLocationTimeout){
                clearTimeout(iFramesObj[domain].reloadObj.setLocationTimeout);
            }
            iFramesObj[domain].reloadObj = null;
            delete iFramesObj[domain].reloadObj;
        }
    }

    /**
     * Deletes any properties we set on the original request
     * Cleanup
     * @param reqObj
     */
    function cleanUpPropertiesFromReq(reqObj) {
        var properties = ["callId", "responseType"];
        for (var i = 0; i < properties.length; i++) {
            reqObj[properties[i]] = null;
            delete reqObj[properties[i]];
        }
    }

    /**
     * Method for querying info about a specific iFrame state
     * @param domain
     * @return {*}
     */
    function getFrameInfo(domain) {
        var resFrame;
        if (iFramesObj[domain]) {
            resFrame = {
                domain: domain,
                url: iFramesObj[domain].url,
                validated: iFramesObj[domain].validated,
                requestCount: iFramesObj[domain].requestCount,
                defaults: iFramesObj[domain].defaults,
                started: (iFramesObj[domain].validated === validationState.VALIDATED)
            };
        }
        return resFrame;
    }

    /**
     * Gets a list of active iFrames and their state (uses getFrameInfo)
     * @return {Object}
     */
    function getAllFramesInfo() {
        var framesResult = {};
        for (var key in iFramesObj) {
            if (iFramesObj.hasOwnProperty(key)) {
                framesResult[iFramesObj[key].domain] = getFrameInfo(iFramesObj[key].domain);
            }
        }
        return framesResult;
    }

    /**
     * Protected method for executing callbacks
     * @param func
     * @param context
     * @param data
     */
    function runCallBack(func, context, data) {
        if (func && typeof func === 'function') {
            try {
                func.call(context || null, data);
            } catch (err) {
                log("Error in executing callback: " + err? err.message: "" , logType.ERROR, "runCallback");
            }
        }
    }

    /**
     * Handles messages from the iFrames
     * @param messageEvent
     */
    function handleMessageFromFrame(messageEvent) {
        var result, origin;
        try {
            origin = messageEvent.origin;
            if(!iFramesObj[origin]){//This frame isn't ours! we don't want to know what it's doing!
                return;
            }
            result = JSON.parse(messageEvent.data);
            if (result.body && typeof result.body === 'string') {
                try {
                    result.body = JSON.parse(result.body);
                } catch (exc) {
                    log("Error in parsing message body from frame, origin: " + origin, logType.DEBUG, "handleMessageFromFrame");
                }
            }
        } catch (exc) {
            result = null;
            log("Error in handeling message from frame, origin: " + origin,logType.ERROR, "handleMessageFromFrame");
        }
        if (result && (result.callId || result.responseType === responseTypes.reloading)) {
            getCallBack(result, origin);
        }
    }

    /**
     * Method for logging
     * @param msg
     * @param type
     * @param callingMethod
     */
    function log(msg, type, callingMethod) {
//        if(window.console){
//            console.log(new Date().toLocaleTimeString() + " " +  type + " " + callingMethod + " : " + msg);
//        }
        if (window.lpBilling && lpBilling.log) {
            lpBilling.log(msg, type, callingMethod);
        }
    }

    /**
     * Initialising method
     * Sets defaults on the parent transport
     * Allows passing an iFrame objects for later use with configuration as objects, format:
     * frames: { url: IFRAME_LOCATION, defaults: DEFAULT_CONFIGURATION_FOR_XHR }
     * @param configurationObj
     */
    function configure(configurationObj) {
        if (configurationObj) {
            if (configurationObj.frames) {
                configurationObj.frames = configurationObj.frames.constructor === Array ? configurationObj.frames : [configurationObj.frames];
                for (var i = 0; i < configurationObj.frames.length; i++) {
                    addiFrameLocation(configurationObj.frames[i]);
                }
            }
            if (configurationObj.defaults) {
                for (var key in configurationObj.defaults) {
                    if (rDefaults.hasOwnProperty(key) && configurationObj.defaults.hasOwnProperty(key)) {
                        rDefaults[key] = configurationObj.defaults[key];
                    }
                }
            }
        }
        initialised = true;
    }
    //Public methods
    var publicAPI = {
        init: function(){
            if(lpBilling && lpBilling.taglets && lpBilling.taglets.lpAjax){
                try{
                    lpBilling.taglets.lpAjax.addTransport(transportType, publicAPI);
                }catch(exc){}
            }
        },
        issueCall: issueCall,
        isValidRequest: isValidRequest,
        getVersion: function () { return version; },
        getName: function () { return transportType; },
        configure: configure,
        getFrameData: getFrameInfo,
        inspect: function () {
            return {
                name: transportType,
                version: version,
                callsMade: callCount,
                errorsFound: errorCount,
                pending: pendingCount,
                defaults: rDefaults,
                iFrameList: cloneSimpleObj(iFrameList),
                activeFrames: getAllFramesInfo()
            };
        }
    };

    if(lpBilling && lpBilling.taglets && lpBilling.taglets.lpAjax){
        try{
            lpBilling.taglets.lpAjax.addTransport(transportType, publicAPI);
        }catch(exc){}
    }

    return publicAPI;
})(window);



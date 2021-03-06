//Service to handle WebSocket protocol 
app.factory('WebSocketService', function($window) {
	
	var service = {};
	service.ws = new Object();

	service.connect = function(idAdoc) {
		if (service.ws[idAdoc]
				&& service.ws[idAdoc].readyState == WebSocket.OPEN) {
			return;
		}
		
		var appPath = $window.location.pathname.split('/')[1];
		var host = $window.location.hostname;
		var port = "8080";
		var protocol = "ws";
		if (angular.equals(host, 'wildfly-mgreau.rhcloud.com') ){
			port = '8000';
		}
		if (angular.equals($window.location.protocol,'https:')){
			port = '8443';
			protocol = "wss";
		}
			
		var wsUrl = protocol + '://'+ host + ':'+ port + '/' + appPath + '/adoc/' + idAdoc;
		var websocket = new WebSocket(wsUrl);

		websocket.onopen = function() {
			service.callback(idAdoc,"CONNECTED");
		};

		websocket.onerror = function() {
			service.callback(idAdoc,"Failed to open a connection" );
		};

		websocket.onclose = function() {
			service.callback(idAdoc,"DISCONNECTED");
		};

		websocket.onmessage = function(message) {
			service.callback(idAdoc, message.data);
		};

		service.ws[idAdoc] = websocket;
	};

	// Send an adoc source to see the generated html back
	service.sendAdocSource = function(idAdoc, source, writer) {
		var jsonObj = {"type" : "adoc", "source" : source, "writer": writer};
		service.ws[idAdoc].send(JSON.stringify(jsonObj));
	};
	
	// Send 2 adoc source to see the diff
	service.sendAdocSourceForDiff = function(idAdoc, source, writer, sourceToMerge) {
		var jsonObj = {"type" : "adoc-for-diff", "source" : source, "writer": writer, "sourceToMerge" : sourceToMerge};
		service.ws[idAdoc].send(JSON.stringify(jsonObj));
	};
	
	// Send the adoc source and the patch to apply 
	service.sendAdocSourceToApplyPatch = function(idAdoc, source, writer, patch) {
		var jsonObj = {"type" : "adoc-for-patch", "source" : source, "writer": writer, "patch" : patch};
		service.ws[idAdoc].send(JSON.stringify(jsonObj));
	};
	

	// Close the WebSocket connection
	service.disconnect = function(idAdoc) {
		service.ws[idAdoc].close();
	};
	
	// WebSocket connection status
	service.status = function(idAdoc) {
		if (service.ws == null || angular.isUndefined(service.ws[idAdoc])){
			return WebSocket.CLOSED;
		}
		return service.ws[idAdoc].readyState;
	};
	
	service.statusAsText = function(idAdoc) {
		var readyState = service.status(idAdoc);
		if (readyState == WebSocket.CONNECTING){
			return "CONNECTING";
		} else if (readyState == WebSocket.OPEN){
			return "OPEN";
		} else if (readyState == WebSocket.CLOSING){
			return "CLOSING";
		} else if (readyState == WebSocket.CLOSED){
			return "CLOSED";
		} else {
			return "UNKNOW";
		}
	};

	// handle callback
	service.subscribe = function(callback) {
		service.callback = callback;
	};

	return service;
});


app.factory('DocRESTService', function($http, $window) {
	var appPath = $window.location.pathname.split('/')[1];
	var myService = {
		    async: function() {
		      // $http returns a promise, which has a then function, which
				// also returns a promise
		      var promise = $http.get('/'+ appPath + '/rest/documents/sample-adoc').then(function (response) {
		        // The then function here is an opportunity to modify the
				// response
		        console.log(response);
		        // The return value gets picked up by the then in the
				// controller.
		        return response.data;
		      });
		      // Return the promise to the controller
		      return promise;
		    }
		  };
	return myService;
});

app.factory('WriterService', function($window, WebSocketService) {
	var service = {};

 
    return service;
	
});


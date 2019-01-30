let huejay = require('huejay');
var pushlametric = require("pushlametric");

let client = new huejay.Client({
	host:     '',
	port:     80,               // Optional
	username: '', // Optional
	timeout:  15000,            // Optional, timeout in milliseconds (15000 is the default)
    });
client.bridge.ping()
    .then(() => {
	    console.log('Successful connection');
	})
    .catch(error => {
	    console.log('Could not connect');
	});

client.bridge.isAuthenticated()
    .then(() => {
	    console.log('Successful authentication');
	})
    .catch(error => {
	    console.log('Could not authenticate');
	});
client.bridge.get()
    .then(bridge => {
	    console.log(`Retrieved bridge ${bridge.name}`);
	    console.log('  Id:', bridge.id);
	    console.log('  Model Id:', bridge.modelId);
	    console.log('  Model Name:', bridge.model.name);
	});

setTimeout(getMotionSensorsLastUpdated,2000);

function sendMessage (textToDisplay) {

    

    var frames = {
	"frames": [
    {
	"index": 0,
	"text": textToDisplay,
	"icon": null
    }
    ]
    };

    // both could be found on your app page (https://developer.lametric.com/)
    var accessToken = "";
    var widgetID = "com.lametric.id"; // basicly a URL of the Widget (app) without https://developer.lametric.com/api/V1/dev/widget/update/
    pushlametric.pushFrames(frames, accessToken, widgetID, function(httpstate) { 
	    if (httpstate == 200) { 
		console.log("message send");
	    } else {
		console.log("error"); 
	    }
	});

}

function getMotionSensorsLastUpdated() {
client.sensors.scan()
    .then(() => {
		var currentDate = new Date();
	    console.log(` Started new sensor scan ${currentDate} `);
	});
client.sensors.getAll()
    .then(sensors => {
	    var overallString="";
	    var cntUnderanHour=0;
	    for (let sensor of sensors) {

		var currentDate = new Date();
		if ( sensor.type == "ZLLPresence" && sensor.name != "Pepper" )
		    {
			var currentLastUpdated = new Date(sensor.state.lastUpdated+"Z");
		       	var diffMs= Math.floor((currentDate.getTime()-currentLastUpdated.getTime())/60000);
			if(diffMs>30)
			    {
				console.log(` ${sensor.name} >  30min `);

			    }
			else
			    {
				cntUnderanHour=cntUnderanHour+1;
				console.log(` ${sensor.name} ${diffMs}m ago`);
				overallString+=` ${sensor.name} ${diffMs}m`;
			    }
		    }
	    }
	    if(cntUnderanHour>0)
		{
		   
		     sendMessage(overallString);
		}
	    else
		{
	           sendMessage(currentDate.getHours()+":"+currentDate.getMinutes());
		}

console.log(overallString);
	})
    .catch(error => {
	    setTimeout(getMotionSensorsLastUpdated,2000);
	    console.log(error.stack);
	});

setTimeout(getMotionSensorsLastUpdated,2000);
}
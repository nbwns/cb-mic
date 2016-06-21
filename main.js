var restify = require('restify');
var builder = require('botbuilder');
var drivers = require('./drivers.json').Availabilities;

var _ = require('underscore');
var chrono = require('chrono-node');
var moment = require("moment");

// Create LUIS Dialog that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=55a4b1cc-68ae-4f7c-a24f-48bedcad9950&subscription-key=52ee0f06b6484151a597ac50909ea697';
var dialog = new builder.LuisDialog(model);
var bot = new builder.BotConnectorBot({ appId: 'CBMIC', appSecret: '7f1e0a1a1bf84c49b88b56f35c146a2e' });
bot.add('/', dialog);

server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
 server.listen(process.env.port || 3978, function () {
     console.log('%s listening to %s', server.name, server.url); 
 });
});


function findDriversByDay(dayToCheck){
	dayToCheck = dayToCheck.toLowerCase();
	return day = driversByDay[dayToCheck];
}

function findDriversPerHour(dayToCheck, starttime){
	let availableDrivers = [];

	for (let driver in dayToCheck){

		if (dayToCheck.hasOwnProperty(driver)){
			dayToCheck[driver].some(ride => {
				if (ride.Start < starttime && ride.Finish > starttime){
					let tmp = {};
					tmp[driver] = ride;
					availableDrivers.push(tmp);
				}
			});
		}
	}

	return availableDrivers;
}

function sortDriversByDay(){
	let daysWithDrivers = {};
	let daysNames = [];
	drivers[0].Driver1.forEach(dayItem => daysNames.push(Object.keys(dayItem)));
	daysNames = daysNames.reduce(function(a, b) {
	    return a.concat(b);
	});
	
	daysNames.map(day =>daysWithDrivers[day.toLowerCase()] = {});

	drivers.forEach((driver, i) => {
		let driverName = Object.keys(drivers[i])[0];
		let driverUsable = driver[driverName];

		daysNames.forEach((day, d) => {
			if (driverUsable[d][day].length){
				daysWithDrivers[day.toLowerCase()][driverName] = driverUsable[d][day];
			}
		})
	})

	return daysWithDrivers;
}

var driversByDay = sortDriversByDay();

// console.log('DRIVERS FOR WEDNESDAY:', findDriversByDay('Wednesday'));

console.log(findDriversPerHour(findDriversByDay('wednesday'), '1100'));



// Add intent handlers
dialog.on('needdriver', function (session, args, next) {
    console.log(session);    
    // Resolve and store any entities passed from LUIS.
    console.log(args.entities);
    var date = builder.EntityRecognizer.findEntity(args.entities, 'day');
    var start = builder.EntityRecognizer.findAllEntities(args.entities, 'starthour');
    var compiledStart = _.map(start,function(item){ return item.entity}).join(' ');
    console.log("start", date.entity + " " + compiledStart);
    var end = builder.EntityRecognizer.findAllEntities(args.entities, 'endhour');
    var compiledEnd = _.map(end,function(item){ return item.entity}).join(' ');
    console.log("end", date.entity + " " + compiledEnd);
    var startDate = chrono.parseDate(date.entity + " at " + compiledStart);
    var endDate = chrono.parseDate(date.entity + " at " + compiledEnd);
    
    
    
    
    /*console.log("date",date);
    console.log("start",start);
    console.log("end",end);*/
    console.log("startDate",startDate);
    console.log("endDate",endDate);
    
    var cleanedStartDate=moment(startDate);
    var cleanedEndDate=moment(endDate);
    var drivers = findDriversPerHour(findDriversByDay(date.entity), cleanedStartDate.format("HHmm"))
    console.log(drivers);
    session.send("ok on " + date.entity + " from " + cleanedStartDate.format("HHmm") + " to " + cleanedEndDate.format("HHmm")) ;
    });


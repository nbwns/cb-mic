var restify = require('restify');
var builder = require('botbuilder');
var drivers = require('./drivers.json').Availabilities;

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'CBMIC', appSecret: '7f1e0a1a1bf84c49b88b56f35c146a2e' });
bot.add('/', function (session) {

	console.log(session.message);

    session.send(session.message.text);
});

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

function findDriversByDay(dayToCheck){
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
	
	daysNames.map(day =>daysWithDrivers[day] = {});

	drivers.forEach((driver, i) => {
		let driverName = Object.keys(drivers[i])[0];
		let driverUsable = driver[driverName];

		daysNames.forEach((day, d) => {
			if (driverUsable[d][day].length){
				daysWithDrivers[day][driverName] = driverUsable[d][day];
			}
		})
	})

	return daysWithDrivers;
}

var driversByDay = sortDriversByDay();

// console.log('DRIVERS FOR WEDNESDAY:', findDriversByDay('Wednesday'));

console.log(findDriversPerHour(findDriversByDay('Wednesday'), '1100'));

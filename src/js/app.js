import Handlebars from 'handlebars/dist/handlebars'
import xr from 'xr'

import mainTemplate from '../templates/main.html'
import groupsAllTemplate from '../templates/groupsAllTemplate.html'
import groupTemplate from '../templates/groupTemplate.html'

import {groupBy, sortByKeys, shuffle } from './libs/arrayUtils'

const dataurl = "https://interactive.guim.co.uk/docsdata-test/1mINILM6lN7p0soJ2eHKEd08bW-0Hw3bpf3nhfng2jrA.json";

var groupsOriginal = [
	{
		"group": "A",
		"teams": [{"name":"Russia", "no": 0, "pot": 0},"","",""]
	},
	{
		"group": "B",
		"teams": ["","","",""]
	},
	{
		"group": "C",
		"teams": ["","","",""]
	},
	{
		"group": "D",
		"teams": ["","","",""]
	},
	{
		"group": "E",
		"teams": ["","","",""]
	},
	{
		"group": "F",
		"teams": ["","","",""]
	},
	{
		"group": "G",
		"teams": ["","","",""]
	},
	{
		"group": "H",
		"teams": ["","","",""]
	}
];




function init(){
	xr.get(dataurl).then((resp) => {
		let newObj = formatData(resp.data);
		let compiledHTML = compileHTML(newObj);

		document.querySelector(".gv-interactive-container").innerHTML = compiledHTML;
	})	
}
    

function compileHTML(newObj){

	let dataIn = newObj;

	Handlebars.registerHelper('html_decoder', function(text) {
        var str = unescape(text).replace(/&amp;/g, '&');
        return str;
    });

    Handlebars.registerPartial({
        'group': groupTemplate
    });

    var content = Handlebars.compile(
        groupsAllTemplate, {
            compat: true
        }
    );
	console.log(dataIn)
	
    var newHTML = content(dataIn);

    return newHTML
}


function formatData(data){
	let newObj = {};
	let teams = [];

	data.sheets.testTeams.map((team) => {
		team.teamName = team.Team;
		team.drawPot = team["Draw pot"];
		team.fifaRank = team["november-rank"];
		teams.push(team);
	})

	let pots = groupBy(teams, 'drawPot');
    pots = sortByKeys(pots);
    newObj.pots = pots;

    var draw = makeDraw(pots)
    newObj.drawArr = draw;
	newObj.teams = teams;

	return newObj;
}


function makeDraw(pots){
	let drawCount = groupsOriginal.length;

	pots.map((pot,k) => {
		pot.shuffleArr = shuffle(pot.objArr);
		populateGroups(pot.shuffleArr)
	})

	return groupsOriginal;
	
}

function populateGroups(a){
	a.map((team,k) => {	
		groupsOriginal[k].teams[team.drawPot-1] = team;
	})	
}


// var simulatorTemplate = Handlebars.compile( 
//     require('./html/simulator-template.html'), 
//     { compat: true }
// );

// function createDraw(first) {
// 	if(nextPotTime){
// 		clearTimeout(nextPotTime);
// 		nextPotTime = null;
// 	}
// 	if(nextTeamTime){
// 		clearTimeout(nextTeamTime);
// 		nextTeamTime = null;
// 	}
// 	groups = JSON.parse(JSON.stringify(groupsOriginal));
// 	var order = 1;
// 	document.querySelector('#current-pot p').innerHTML = "";
// 	if(first){
// 		document.querySelector('#current-pot p').innerHTML = "<span>Ready to start</span>";
// 	}
// 	document.querySelector('#current-pot #current-flags').innerHTML = "";
// 	document.querySelector('#current-pot').className -= " draw-ended";

// 	pots.forEach(function(pot,potNumber){
// 		var range = (potNumber === 0) ? [1,2,3,4,5] : [0,1,2,3,4,5];

// 		pot.teams.forEach(function(team, teamNumber){
// 			var randomNumber = Math.floor(Math.random()*range.length);
// 			var randomGroup = groups[range[randomNumber]];
// 			range.splice(randomNumber,1);

// 			team.no = order;


// 			if(potNumber === 0){
// 				randomGroup.teams[0] = team;
// 			}else{
// 				var availableSlots = [];

// 				randomGroup.teams.forEach(function(teamSlot,i){
// 					if(!teamSlot){
// 						availableSlots.push(i);
// 					}
// 				})

// 				var randomPositionNumber = Math.floor(Math.random() * availableSlots.length);
// 				var randomSlot = availableSlots[randomPositionNumber];

// 				randomGroup.teams[randomSlot] = team;
// 			}

// 			order++;
// 		})
// 	})

	

// 	groups.forEach(function(group){
// 		var groupDifficulty = 0;
// 		group.teams.forEach(function(team){
// 			groupDifficulty += team.points;
// 		})
// 		group.difficulty = (groupDifficulty - 14);
// 	})
// 	if(first){
// 		groups = groupsOriginal;
// 	}
	
	
// 	var simulatorHTML = simulatorTemplate({groups:groups, selectedCountry: selectedCountry});
// 	document.querySelector('#draw-container').innerHTML = simulatorHTML;


// 	animateDraw(first);
// }

// function animateDraw(first){
// 	var currentPot = 1;
// 	if(!first){
// 		updatePot(currentPot);
// 	}
	
// 	function animateTeam(no,newPot){
// 		var teamEl = document.querySelector('.team-order-' + no);
// 		var currentFlagEl = document.querySelector('.current-flag-' + teamEl.getAttribute('data-team-id'));

// 		teamEl.className += " drawn";
// 		if(currentFlagEl){
// 			currentFlagEl.className += " drawn";
// 		}

// 		if(no < 23){
// 			var testspeed = false;
// 			if(no === 5 || no === 11 || no === 17){
// 				no++;
// 				currentPot++;
// 				setTimeout(function(){
// 					updatePot(currentPot);
// 				},testspeed || 500)
// 				nextPotTime = setTimeout(function(){
// 					animateTeam(no,currentPot);
// 				},testspeed || 1500)
// 			}else{
// 				no++;
// 				nextTeamTime = setTimeout(function(){
// 					animateTeam(no,false);
// 				},testspeed || 200)
// 			}
// 		}else if(no === 23){
// 			onAnimationEnd(groups);
// 		}
// 	}
// 	if(!first){
// 		animateTeam(0,currentPot);
// 	}else{
// 		var teamEls = document.querySelectorAll('.group-container ul li');
// 		for( var i=0; i<teamEls.length; i++){
// 			teamEls[i].className += " drawn";
// 		}
// 	}
	
// }

// function updatePot(pot){
// 	var statusEl = document.querySelector('#current-pot');
// 	statusEl.querySelector('p').innerHTML = "Seeding pot " + pot;

// 	var statusFlagsEl = statusEl.querySelector('#current-flags');
// 	statusFlagsEl.innerHTML = "";

// 	pots[pot-1].teams.forEach(function(team){
// 		var flagEl = document.createElement('div');
// 		flagEl.className = "current-flag-container current-flag-" + team.id;
// 		flagEl.innerHTML = "<img src='" + team.flag + "' />";

// 		statusFlagsEl.appendChild(flagEl);
// 	})
// }

// function onAnimationEnd(){
// 	var odometerValues = {
// 		0: 4,
// 		1: 4,
// 		2: -11,
// 		3: -26,
// 		4: -41,
// 		5: -56,
// 		6: -71,
// 		7: -86,
// 		8: -101,
// 		9: -116,
// 		10: -131
// 	}

// 	var groupContainers = document.querySelectorAll('.group-container');

// 	for(var i = 0; i<groupContainers.length; i++){
// 		var diffValue = odometerValues[groups[i].difficulty];

// 		groupContainers[i].querySelector('h3 .odometer').style.backgroundPosition = "0 " + (diffValue) + "px";
// 	}

// 	document.querySelector('#current-pot').className += " draw-ended";
// }


init();
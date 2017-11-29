import Handlebars from 'handlebars/dist/handlebars'
import xr from 'xr'

import mainTemplate from '../templates/main.html'
import potTemplate from '../templates/potTemplate.html'
import groupsAllTemplate from '../templates/groupsAllTemplate.html'
import teamTemplate from '../templates/teamTemplate.html'
import roundTeamTemplate from '../templates/roundTeamTemplate.html'
import qfTeamTemplate from '../templates/qfTeamTemplate.html'
import sfTeamTemplate from '../templates/sfTeamTemplate.html'
import roundsTemplate from '../templates/roundsTemplate.html'

import {groupBy, sortByKeys, shuffle, compareValues, changeFirstObj, dedupe } from './libs/arrayUtils'

import { buildTourney } from './libs/tourneySim'

import _sortBy from 'lodash.sortby'

import _remove from 'lodash.remove'

const dataurl = "https://interactive.guim.co.uk/docsdata-test/1mINILM6lN7p0soJ2eHKEd08bW-0Hw3bpf3nhfng2jrA.json";

const groupAniTime = 10;
var compiledHTML;
var pots;
var globalData;
var teams;
var groups = {};

var arrSlot = 0;

var groupKeys = ['groupA', 'groupB', 'groupC','groupD', 'groupE', 'groupF', 'groupG', 'groupH'];

var compiledHTMLArr = [];

var startButtons;


function init(){
	xr.get(dataurl).then((resp) => {
		let newObj = formatData(resp.data, true);
		compiledHTML = compileHTML(newObj);

		document.querySelector(".gv-wrapper").innerHTML = compiledHTML;

		let h = document.querySelector(".gv-wrapper").offsetHeight;

		startButtons = document.querySelectorAll('.gv-start-button');


		startButtons.forEach((el) => {
			 el.addEventListener('click', function(){ animateDraw(newObj) });
		})

		window.resize();

		// push different compiled HTML strings into array
		// enables much faster reDraw() function
		

		// Array.from(document.querySelectorAll('.gv-group-table')).forEach((table,k) => {
		// 	 table.classList.add(table.getAttribute("data-strength"));
		// })

		// Array.from(document.querySelectorAll('.gv-table-col-head')).forEach((el,k) => {
		// 	el.innerHTML = el.getAttribute("data-strength");					
		// })	



	})	
}


function formatData(data, firstRun){
	//console.log("run", firstRun)
	groups = {
		groupA: { groupName: 'Group A', teams: [], strengthScore:0, strengthRating: 'weak', firstGroup:true},
		groupB: { groupName: 'Group B', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupC: { groupName: 'Group C', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupD: { groupName: 'Group D', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupE: { groupName: 'Group E', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupF: { groupName: 'Group F', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupG: { groupName: 'Group G', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupH: { groupName: 'Group H', teams: [], strengthScore:0, strengthRating: 'weak'}
	};

	let newObj = {};
	teams = [];
	pots = [];
	
	data.sheets.testTeams.map((team) => {
		team.teamName = team.Team;
		if (team.teamShort){ team.teamShortName = team.teamShort }
		if (!team.teamShort){ team.teamShortName = team.teamName }
		team.drawPot = team["Draw pot"];
		team.fifaRank = team["october-rank"];
		team.rank  = Number(team["guardian-rank"]);
		if(team.rank > 4 && team.rank < 17){ team.rank = Math.ceil(team.rank * 2) }; //weighting in favour
		if(team.rank > 16 ){ team.rank = team.rank * 3 };
		team.association = team.Association;
		if(team.cont == 'Europe'){ team.europeanException = true}
		if(team.drawPot == 1) { team.seeded = true };
		if(team.drawPot == 1 && team.teamName == "Russia" && firstRun) { team.hostTeam = true };

		teams.push(team);

	})

	pots = groupBy(teams, 'drawPot');
    pots = sortByKeys(pots);
    
    pots.map((pot) => {
	    	if(pot.sortOn == 1){
	    		pot.objArr = (changeFirstObj(pot.objArr, e => e.Team === 'Russia') )
	    	}
    	pot.teams = pot.objArr;
    	pot.potName = pot.sortOn;
    })

    let generatedGroups = generateGroups();

	Object.keys(generatedGroups).forEach(key => {
	    var s = 0;
	    generatedGroups[key].teams.map(o => {
	    	s+= Number(o.rank);    	
	    })

	    generatedGroups[key].strengthScore = s;	
	});

	var strengthScores = [];

	Object.keys(generatedGroups).forEach(key => {
	    var s = 0;
	    generatedGroups[key].teams.map((o, num) => {

	    	s+= Number(o.rank);    	
	    })

	    generatedGroups[key].strengthScore = s;	

	    strengthScores.push(s);

	});


	strengthScores.sort(sortNumber);

	Object.keys(generatedGroups).forEach(key => {
	   
	
		strengthScores.map((n, k) => {
			if(generatedGroups[key].strengthScore == n){
				generatedGroups[key].groupRank = k; 
				generatedGroups[key].strengthRating = assignStrength(k);
			}

		})


	});

    newObj.groups = generatedGroups;
	newObj.pots = pots;

	var fullTourney = buildTourney(teams,generatedGroups);

	newObj.roundOf16 = fullTourney.roundOf16;
	newObj.quarter = fullTourney.quarter;
	newObj.semi = fullTourney.semi;
	newObj.final = fullTourney.final;
	newObj.winner = fullTourney.winner;
	newObj.finalist = fullTourney.finalist;

	return newObj;

}

function sortNumber(a,b) {
    return a - b;
}


function generateGroups() {
      
		pots.forEach((pot,i) => {
		 	var randomGroupPot = [];
			 	pot.teams.forEach((team,j) => {
						assignToGroup(team, randomGroupPot, i);
	    		});
    	 });

		var rankedGroups = rankGroups(groups);

		return rankedGroups;

}

// OLD function generateGroups() {
      
// 		 pots.forEach((pot,i) => {
// 		 	var randomGroupPot = [];
// 			 	pot.teams.forEach((team,j) => {
// 						assignToGroup(team, randomGroupPot, i);
// 	    		});
//     	 });

// 		return groups;

// }

function rankGroups(newGroups){
	
    //Clear winners for new draw
		teams.forEach((team,i) => {
			 team.winner = "";
		     team.groupStatus = "";
		     team.roundOf16Status = "";
		     team.quarterFinalStatus = "";
		     team.semiFinalStatus = "";
		})

		for (var key in newGroups) {
		    if (newGroups.hasOwnProperty(key)) {


		   
		        var group = newGroups[key];

				if(group.teams.length > 4){
					var tempGroup  = [];

					group.teams.map((o,k) => {
						if(k < 4){
							tempGroup.push(o)
						}
					})
		

					group.teams = tempGroup;
					
				}

		        var randomUpset = Math.random();

		        var orderedGroup = group.teams;

				       if(randomUpset <= 0.1875){
				       
				         orderedGroup = shuffle(orderedGroup)
					        orderedGroup[0].winner = "winner";
					        orderedGroup[0].groupStatus = "Winner of " + group.groupName;
					        orderedGroup[0].groupClass = "winner";
					        orderedGroup[1].winner = "winner";
					        orderedGroup[1].groupStatus = "Runner-up " + group.groupName;
					        orderedGroup[1].groupClass = "runner-up";
					        group.teamsOrdered = orderedGroup;

				      	} else {
					        orderedGroup = orderedGroup.slice().sort(function(a,b){ return a.rank-b.rank });					       
					        orderedGroup[0].winner = "winner";
					        orderedGroup[0].groupStatus = "Winner of " + group.groupName;
					        orderedGroup[0].groupClass = "winner";
					        orderedGroup[1].winner = "winner";
					        orderedGroup[1].groupStatus = "Runner-up " + group.groupName;
					        orderedGroup[1].groupClass = "runner-up";
					        group.teamsOrdered = orderedGroup;
				      }
				      group.teams = orderedGroup;
				      group.teams  = group.teams.slice().sort(function(a,b){ return a.drawPot-b.drawPot });


				
		    }
		}

    return groups;

}


function assignToGroup(team, randomGroupPot, currentPot){

		var selectgroup = 'group'+team.draw_group;
		groups[selectgroup].teams.push(team);


 }


function reGenerateGroups(){
	groups = {
		groupA: { groupName: 'Group A', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupB: { groupName: 'Group B', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupC: { groupName: 'Group C', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupD: { groupName: 'Group D', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupE: { groupName: 'Group E', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupF: { groupName: 'Group F', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupG: { groupName: 'Group G', teams: [], strengthScore:0, strengthRating: 'weak'},
		groupH: { groupName: 'Group H', teams: [], strengthScore:0, strengthRating: 'weak'}
	};

	generateGroups();
}


    
function fadeInTableBGs(){
	 Array.from(document.querySelectorAll('.gv-group-table')).forEach(el => {
        //el.classList.add( el.getAttribute("data-strength"))
    });
}

function populateTeamFields(){
	Array.from(document.querySelectorAll('.gv-row-team')).forEach((el,k) => {
        //console.log(el.getAttribute("data-team"), k);
        //el.classList.add( el.getAttribute("data-strength"))
    });
}


function compileHTML(newObj){

	let dataIn = newObj;

	Handlebars.registerHelper('html_decoder', function(text) {
        var str = unescape(text).replace(/&amp;/g, '&');
        return str;
    });

    Handlebars.registerPartial({
        'team': teamTemplate,
        'pot': potTemplate,
        'roundTeam' : roundTeamTemplate,
        'qfTeam' : qfTeamTemplate,
        'sfTeam' : sfTeamTemplate,
        'roundsTemplate' : roundsTemplate
    });

    var content = Handlebars.compile(
        groupsAllTemplate, {
            compat: true
        }
    );

    var newHTML = content(dataIn);
    return newHTML;

}

function animateDraw(a){
	

//document.querySelector(".gv-pot-div-intro").classList.add("display-none");

	Array.from(a.pots).forEach((pot,k) => {
		
		var currentPotNum = pot.sortOn
		
		let nextPotTime = setTimeout(function(){

			Array.from(document.querySelectorAll('.gv-pot-div')).forEach((el) => {
				
				if(el.getAttribute("potRef") == currentPotNum){
					el.classList.remove("display-none");
					//document.querySelector(".gv-pot-header").innerHTML = "Seeding pot "+currentPotNum;
				}

				// if(el.getAttribute("potRef") != currentPotNum){
				// 	el.classList.add("display-none");
				// }
			})

			animateTeams(pot, groupAniTime);

		}, k * groupAniTime);


   });


	




	

	setTimeout(function(){
		document.querySelectorAll(".host-item").forEach((el) => {
			el.classList.add("display-none");
		})
	}, 2000);

	

	addOutcome();

}


function addOutcome(){

	if (compiledHTMLArr.length < 60){
		compiledHTMLArr.push(compileHTML(formatData(globalData)));
	}
	

}

function reDraw(){
		document.querySelectorAll(".host-item").forEach((el) => {
			el.classList.add("display-none");
		});


		document.querySelectorAll(".none-header-team-row").forEach((el) => {
			//el.classList.add("display-none");
		});

		var randomSlot = Math.floor(Math.random() * compiledHTMLArr.length);
		
		var newHTMLStr = compiledHTMLArr[randomSlot];

		document.querySelector(".gv-wrapper").innerHTML = newHTMLStr;

		setTimeout(function(){ 
			document.querySelectorAll(".host-item").forEach((el) => {
				el.classList.add("display-none");
			}) 
		}, 500 );

		document.querySelectorAll(".none-header-team-row").forEach((el,k) => {
			var timeOut = k * 1000;
			//console.log(timeOut)
				setTimeout(function(){
					el.classList.remove("display-none");
				}, timeOut);

		});

		document.querySelectorAll(".qualified").forEach((el,k) => {
			var timeOut = k * 30;
			//console.log(timeOut)
				setTimeout(function(){
					el.classList.add("check");
				}, timeOut);

		});

	

}

function animateTeams(a,groupAniTime){

	document.querySelectorAll(".host-item").forEach((el) => {
		el.classList.add("display-none");
	});

	const teamAniTime = groupAniTime / 8;
	a.teams.map((team,k) => {

		let currentTeamName = team.Team;
		let nextTeamTime = setTimeout(function(){

			Array.from(document.querySelectorAll('.gv-team-row')).forEach((el) => {
				if(el.getAttribute("data-team") == currentTeamName){
					Array.from(el.children).forEach((child) => {
						if(child.tagName == "span" || child.tagName == "SPAN"){
							child.classList.remove("display-none");
						}
					})	

					
				}
			})

			Array.from(document.querySelectorAll('.gv-pot-item')).forEach((el) => {
				if(el.getAttribute("data-team") == currentTeamName){
					el.classList.add("fifty-pc");
				}
			})

		}, k * teamAniTime);

	})

	animateKnockouts();

	let tables = Array.from(document.querySelectorAll('.gv-group-table'));

	

}

function animateKnockouts(){

	setTimeout(function(){ Array.from(document.querySelectorAll('.r16-team')).forEach((el, k) => {
				el.classList.remove("display-none");
			})
	
	}, 700)

	setTimeout(function(){ Array.from(document.querySelectorAll('.gv-mobile-battleline')).forEach((el, k) => {
				el.classList.remove("display-none");
			})
	
	}, 700)

	setTimeout(function(){ Array.from(document.querySelectorAll('.qf-team')).forEach((el, k) => {
				el.classList.remove("display-none");
			})
	
	}, 800)

	setTimeout(function(){ Array.from(document.querySelectorAll('.sf-team')).forEach((el, k) => {
				el.classList.remove("display-none");
			})
	
	}, 900)

	setTimeout(function(){ Array.from(document.querySelectorAll('.gv-finalist')).forEach((el, k) => {
				el.classList.remove("display-none");
			})
	
	}, 1000)


}


function assignStrength(k){
	var strengthRating = "weak";
			if(k == 0){ strengthRating = "strongest"}
			if(k > 0 && k < 3){ strengthRating = "strong"}
			if(k > 2 && k < 5){ strengthRating = "balanced"}
			if(k > 5 && k < 7){ strengthRating = "weak"}
			if(k == 7){ strengthRating = "weakest"}
	return strengthRating;
}
	

init();


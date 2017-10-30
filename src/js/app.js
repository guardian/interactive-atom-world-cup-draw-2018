import Handlebars from 'handlebars/dist/handlebars'
import xr from 'xr'

import mainTemplate from '../templates/main.html'
import potTemplate from '../templates/potTemplate.html'
import groupsAllTemplate from '../templates/groupsAllTemplate.html'
import teamTemplate from '../templates/teamTemplate.html'

import {groupBy, sortByKeys, shuffle, compareValues, changeFirstObj } from './libs/arrayUtils'

const dataurl = "https://interactive.guim.co.uk/docsdata-test/1mINILM6lN7p0soJ2eHKEd08bW-0Hw3bpf3nhfng2jrA.json";

const groupAniTime = 1000;

var groupsOriginal = [
	{
		"group": "A",
		"teams": ["","","",""],
		"strengthScore": 0,
		"strengthRating" : "weak",
		"associationOne": "",
		"associationTwo": "",
		"associationThree": "",
		"associationFour": ""
	},
	{
		"group": "B",
		"teams": ["","","",""],
		"strengthScore": 0,
		"strengthRating" : "weak",
		"associationOne": "",
		"associationTwo": "",
		"associationThree": "",
		"associationFour": ""
	},
	{
		"group": "C",
		"teams": ["","","",""],
		"strengthScore": 0,
		"strengthRating" : "weak",
		"associationOne": "",
		"associationTwo": "",
		"associationThree": "",
		"associationFour": ""
	},
	{
		"group": "D",
		"teams": ["","","",""],
		"strengthScore": 0,
		"strengthRating" : "weak",
		"associationOne": "",
		"associationTwo": "",
		"associationThree": "",
		"associationFour": ""
	},
	{
		"group": "E",
		"teams": ["","","",""],
		"strengthScore": 0,
		"strengthRating" : "weak",
		"associationOne": "",
		"associationTwo": "",
		"associationThree": "",
		"associationFour": ""
	},
	{
		"group": "F",
		"teams": ["","","",""],
		"strengthScore": 0,
		"strengthRating" : "weak",
		"associationOne": "",
		"associationTwo": "",
		"associationThree": "",
		"associationFour": ""
	},
	{
		"group": "G",
		"teams": ["","","",""],
		"strengthScore": 0,
		"strengthRating" : "weak",
		"associationOne": "",
		"associationTwo": "",
		"associationThree": "",
		"associationFour": ""
	},
	{
		"group": "H",
		"teams": ["","","",""],
		"strengthScore": 0,
		"strengthRating" : "weak",
		"associationOne": "",
		"associationTwo": "",
		"associationThree": "",
		"associationFour": ""
	}
];


function init(){
	xr.get(dataurl).then((resp) => {
		let newObj = formatData(resp.data);
		let compiledHTML = compileHTML(newObj);

		document.querySelector(".gv-wrapper").innerHTML = compiledHTML;

		let h = document.querySelector(".gv-wrapper").offsetHeight;

		buildView(newObj);

		window.resize();
		
	})	
}

function buildView(newObj){
	//populatePots(newObj.pots)
	shufflePots();
	fadeInTableBGs();
	populateTeamFields();

	document.querySelector('.gv-start-button').addEventListener('click', function(){ animateDraw(newObj) });
	

	
}


function shufflePots(){

	Array.from(document.querySelectorAll('.gv-pot-div')).forEach((el) => {
		let childArr = [];
		Array.from(el.children).forEach((child) => {
			if(child.tagName == "span" || child.tagName == "SPAN"){
				childArr.push(child);
			}
		})	
		childArr.map((child, k) => {
			el.appendChild(el.children[Math.random() * k | 0]);
		})
	});


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
        'pot': potTemplate
    });

    var content = Handlebars.compile(
        groupsAllTemplate, {
            compat: true
        }
    );

    var newHTML = content(dataIn);

    

    return newHTML;

}


function formatData(data){
	let newObj = {};
	let teams = [];

	data.sheets.testTeams.map((team) => {
		team.teamName = team.Team;
		team.drawPot = team["Draw pot"];
		team.fifaRank = team["october-rank"];
		teams.push(team);
	})

	let pots = groupBy(teams, 'drawPot');
    pots = sortByKeys(pots);
    newObj.pots = pots;

    let buckets = pots;
    buckets.map((bucket,k) => {
			bucket.shuffleArr = shuffle(bucket.objArr);
			if (bucket.sortOn == 1){ 
				bucket.shuffleArr = (changeFirstObj(bucket.shuffleArr, e => e.Team === 'Russia') )
				bucket.objArr = (changeFirstObj(bucket.objArr, e => e.Team === 'Russia') )
				bucket.firstPot = true;
			};


		})


    //add a  nother shuffle here

    var draw = setDrawData(pots)
    newObj.drawArr = draw;
	newObj.teams = teams;
	newObj.buckets = buckets;

	return newObj;

}


function setDrawData(pots){
	let drawCount = groupsOriginal.length;

		pots.map((pot,k) => {
			pot.shuffleArr = shuffle(pot.objArr);
			if (pot.sortOn == 1){ 
				pot.shuffleArr = (changeFirstObj(pot.shuffleArr, e => e.Team === 'Russia') )
				pot.objArr = (changeFirstObj(pot.objArr, e => e.Team === 'Russia') )
				pot.firstPot = true;
			};
			if (pot.sortOn != 1){ 
				pot.hidePot = true;
			}

			populateGroups(pot.shuffleArr);

		})

	groupsOriginal.sort(compareValues('strengthScore')); 

		groupsOriginal.map((o,k) => {
			if(k == 0){ o.strengthRating = "strongest"}
			if(k > 0 && k < 3){ o.strengthRating = "strong"}
			if(k > 2 && k < 5){ o.strengthRating = "balanced"}
			if(k > 4 && k < 7){ o.strengthRating = "weak"}
			if(k > 6){ o.strengthRating = "weakest"}
		});

	groupsOriginal.sort(compareValues('group'));

	return groupsOriginal;	
}

function populateGroups(a){
	a.map((team,k) => {	

		groupsOriginal[k].teams[team.drawPot-1] = team;
		groupsOriginal[k].strengthScore += Number(team.fifaRank);
		
	})	
	
}

function animateDraw(a){
	


	document.querySelector(".gv-pot-div-intro").classList.add("display-none");



	Array.from(a.pots).forEach((pot,k) => {
		
		var currentPotNum = pot.sortOn
		
		let nextPotTime = setTimeout(function(){

			Array.from(document.querySelectorAll('.gv-pot-div')).forEach((el) => {
				
				if(el.getAttribute("potRef") == currentPotNum){
					el.classList.remove("display-none");
					document.querySelector(".gv-pot-header").innerHTML = "Seeding pot "+currentPotNum;


				}

				if(el.getAttribute("potRef") != currentPotNum){
					el.classList.add("display-none");
				}
			})

			animateTeams(pot.shuffleArr, groupAniTime);

		}, k * groupAniTime);

    });


	let drawDone = setTimeout(function(){

		Array.from(document.querySelectorAll('.gv-group-table')).forEach((table,k) => {
			 table.classList.add(table.getAttribute("data-strength"));
		})

		Array.from(document.querySelectorAll('.gv-table-col-head')).forEach((el,k) => {
			el.innerHTML = el.getAttribute("data-strength");					
		})	

	}, 4*groupAniTime);
}

function animateTeams(a,groupAniTime){
	const teamAniTime = groupAniTime / (Math.floor(a.length));
	a.map((team,k) => {
		let currentTeamName = team.Team;
		let nextTeamTime = setTimeout(function(){

			Array.from(document.querySelectorAll('.gv-team-row')).forEach((el) => {
				if(el.getAttribute("data-team") == currentTeamName){
					el.classList.remove("display-none");
				}
			})

			Array.from(document.querySelectorAll('.gv-pot-item')).forEach((el) => {
				if(el.getAttribute("data-team") == currentTeamName){
					el.classList.add("fifty-pc");
				}
			})

		}, k * teamAniTime);

		

	})
	//fire this function after compiling html to size iframe correctly
		
}



init();
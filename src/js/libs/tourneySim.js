export function buildTourney(teams,groups) {

    teams.forEach((team,i) => {
      team.winRoundOf16 = "";
      team.winSemiFinal = "";
      team.winQuarterFinal = "";
      team.winFinal = "";
    });
    var roundOf16 = {
      r1: {name: "round of 16: match 1", teams: [groups.groupA.teamsOrdered[0], groups.groupB.teamsOrdered[1]]}, //winner group A against second group B
      r2: {name: "round of 16: match 2", teams: [groups.groupA.teamsOrdered[1], groups.groupB.teamsOrdered[0]]}, //winner group B against second group A
      r3: {name: "round of 16: match 3", teams: [groups.groupC.teamsOrdered[0], groups.groupD.teamsOrdered[1]]}, //winner group C against second group D
      r4: {name: "round of 16: match 4", teams: [groups.groupC.teamsOrdered[1], groups.groupD.teamsOrdered[0]]}, //winner group D against second group C
      r5: {name: "round of 16: match 5", teams: [groups.groupE.teamsOrdered[0], groups.groupF.teamsOrdered[1]]}, //winner group A against second group B
      r6: {name: "round of 16: match 6", teams: [groups.groupE.teamsOrdered[1], groups.groupF.teamsOrdered[0]]}, //winner group B against second group A
      r7: {name: "round of 16: match 7", teams: [groups.groupG.teamsOrdered[0], groups.groupH.teamsOrdered[1]]}, //winner group C against second group D
      r8: {name: "round of 16: match 8", teams: [groups.groupG.teamsOrdered[1], groups.groupH.teamsOrdered[0]]}    //winner group D against second group C
    };

    var quarterFinals = {
      q1: {name: "quarter-final 1", teams: []},
      q2: {name: "quarter-final 2", teams: []},
      q3: {name: "quarter-final 3", teams: []},
      q4: {name: "quarter-final 4", teams: []}
    };

    var semiFinals = {
      s1: {name: "semi-final 1", teams: []}, //winner q1 against winner q2
      s2: {name: "semi-final 2", teams: []} //winner q3 against winner q4
    };

    var final = {
      f1: [], //winner s1 against winner s2
    };
    var winner;


for (var key in roundOf16) {
    
    if (roundOf16.hasOwnProperty(key)) {
       
      var round = roundOf16[key];
      var index = key;

      var differenceRank = round.teams[0].rank - round.teams[1].rank;

      var chanceToWin = calculateChanceToWin(differenceRank)
      //var chanceToWin = 50 + differenceRank*1.3; //Chance that team 2 wins

      var randomNumber = Math.random()*100;
      //Team 2 loses, team 1 wins and will be pushed in semifinals
      if(randomNumber >= chanceToWin){
        //Winners of q1 and q2 will go to s1
        if(index == "r1" || index == "r3"){
          quarterFinals.q1.teams.push(round.teams[0]);
          round.teams[0].winRoundOf16 = "winner";
          round.teams[0].roundOf16Status = "Won " + round.name;
        } else if(index == "r2" || index == "r4"){
          quarterFinals.q2.teams.push(round.teams[0]);
          round.teams[0].winRoundOf16 = "winner";
          round.teams[0].roundOf16Status = "Won " + round.name;
        } else if(index == "r5" || index == "r7"){
          quarterFinals.q3.teams.push(round.teams[0]);
          round.teams[0].winRoundOf16 = "winner";
          round.teams[0].roundOf16Status = "Won " + round.name;
        } else if(index == "r6" || index == "r8"){
          quarterFinals.q4.teams.push(round.teams[0]);
          round.teams[0].winRoundOf16 = "winner";
          round.teams[0].roundOf16Status = "Won " + round.name;
        }
      }else{
        if(index == "r1" || index == "r3"){
          quarterFinals.q1.teams.push(round.teams[1]);
          round.teams[1].winRoundOf16 = "winner";
          round.teams[1].roundOf16Status = "Won " + round.name;
        } else if(index == "r2" || index == "r4"){
          quarterFinals.q2.teams.push(round.teams[1]);
          round.teams[1].winRoundOf16 = "winner";
          round.teams[1].roundOf16Status = "Won " + round.name;
        } else if(index == "r5" || index == "r7"){
          quarterFinals.q3.teams.push(round.teams[1]);
          round.teams[1].winRoundOf16 = "winner";
          round.teams[1].roundOf16Status = "Won " + round.name;
        } else if(index == "r6" || index == "r8"){
          quarterFinals.q4.teams.push(round.teams[1]);
          round.teams[1].winRoundOf16 = "winner";
          round.teams[1].roundOf16Status = "Won " + round.name;
        }
      }

   // $.each(roundOf16, function(index, round) {



   }

}
     
    // });

    for (var key in quarterFinals) {
    
    if (quarterFinals.hasOwnProperty(key)) {
       
      var quarterFinal = quarterFinals[key];
      var index = key;
      var differenceRank = quarterFinal.teams[0].rank - quarterFinal.teams[1].rank;

      var chanceToWin = calculateChanceToWin(differenceRank)

      //var chanceToWin = 50 + differenceRank*1.3; //Chance that team 2 wins

      var randomNumber = Math.random()*100;
      //Team 2 loses, team 1 wins and will be pushed in semifinals
      if(randomNumber >= chanceToWin){
        //Winners of q1 and q2 will go to s1
        if(index == "q1" || index == "q3"){
          semiFinals.s1.teams.push(quarterFinal.teams[0]);
          quarterFinal.teams[0].winQuarterFinal = "winner";
          quarterFinal.teams[0].quarterFinalStatus = "Winner of " + quarterFinal.name;
        } else{
          semiFinals.s2.teams.push(quarterFinal.teams[0]);
          quarterFinal.teams[0].winQuarterFinal = "winner";
          quarterFinal.teams[0].quarterFinalStatus = "Winner of " + quarterFinal.name;
        }
      }else{
        if(index == "q1" || index == "q3"){
          semiFinals.s1.teams.push(quarterFinal.teams[1]);
          quarterFinal.teams[1].winQuarterFinal = "winner";
          quarterFinal.teams[1].quarterFinalStatus = "Winner of " + quarterFinal.name;
        } else{
          semiFinals.s2.teams.push(quarterFinal.teams[1]);
          quarterFinal.teams[1].winQuarterFinal = "winner";
          quarterFinal.teams[1].quarterFinalStatus = "Winner of " + quarterFinal.name;
        }
      }
    }
}



// //Deciding who goest to final
for (var key in semiFinals) {
    
  if (semiFinals.hasOwnProperty(key)) {
       
      var semiFinal = semiFinals[key];
      var index = key;
      var differenceRank = semiFinal.teams[0].rank - semiFinal.teams[1].rank;
      var chanceToWin = calculateChanceToWin(differenceRank);

      var randomNumber = Math.random()*100;

      if(randomNumber >= chanceToWin){
        final.f1.push(semiFinal.teams[0]);
        semiFinal.teams[0].winSemiFinal = "winner";
        semiFinal.teams[0].semiFinalStatus = "Winner of " + semiFinal.name;
      }else{
        final.f1.push(semiFinal.teams[1]);
        semiFinal.teams[1].winSemiFinal = "winner";
        semiFinal.teams[1].semiFinalStatus = "Winner of " + semiFinal.name;
      }
    }
  }

    //Deciding who wins the final
    var differenceRank = final.f1[0].rank - final.f1[1].rank;
    var chanceToWin = calculateChanceToWin(differenceRank);
    var randomNumber = Math.random()*100;
    if(randomNumber >= chanceToWin){
      winner = final.f1[0];
      final.f1[0].winFinal = "winner";
    }else{
      winner = final.f1[1];
      final.f1[1].winFinal = "winner";
    }

    //Put all the data into one object
    var fullKnockout = {
      "roundOf16" : roundOf16,
       "quarter" : quarterFinals,
       "semi" : semiFinals,
       "final" : final,
       "winner": winner
    }


    return fullKnockout;

    //return teams;
  }



  function calculateChanceToWin(differenceRank){
    if(differenceRank < -20){
      return 14;
    }else if(differenceRank >= -20 && differenceRank < -15){
      return 20;
    }else if(differenceRank >= -15 && differenceRank <= -10){
      return 35;
    }else if(differenceRank >= -10 && differenceRank <= -5){
      return 40;
    }else if(differenceRank >= -5 && differenceRank <= 0){
      return 45;
    }

    else if(differenceRank > 0 && differenceRank <= 5){
      return 55;
    }else if(differenceRank > 5 && differenceRank <= 10){
      return 60;
    }else if(differenceRank > 10 && differenceRank <= 15){
      return 65;
    }else if(differenceRank > 15 && differenceRank <= 20){
      return 80;
    }else if(differenceRank > 20){
      return 86;
    }
  }
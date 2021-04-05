// format time for leaderboard display
function formatScore(seconds)
{
	const time = parseInt(seconds);
	if (!time)
		return "";
	const sec = time % 60;
	const min = Math.floor(time / 60);
	if (min  == 0)
		return sec + "sec";
	else
		return min + "mn " + sec + "sec";
}
// create an object podium that hold the 3 best times for a level
function createPodium(lastName, lastTime, level, bestScores)
{
	console.log("CREATE TABLE");
	if (bestScores == null)
		bestScores = {"easy": null, "medium": null, "hard": null}
	bestScores[level] = {
		"1": {"name": lastName, "time": lastTime},
		"2" :{ "name": "", "time": ""},
		"3" :{ "name": "", "time": ""}
	}
	return bestScores;
}

// add a score to a podium for a specific level
function addToPodium(lastName, lastTime, level, bestScores)
{
	console.log("ADD TO TABLE");
	console.log(bestScores[level]);
	let i = 1;
	for (i; i <= 3; i++)
	{
		if (parseInt(bestScores[level][i]["time"]) >= parseInt(lastTime) || bestScores[level][i]['time'] === "")
		{
			//lower the scores in the ranking
			for (let y = 2 ; y >= i; --y)
			{
				bestScores[level][y + 1]["name"] = bestScores[level][y]["name"];
				bestScores[level][y + 1]["time"] = bestScores[level][y]["time"]; 
			}
			bestScores[level][i]["name"] = lastName;
			bestScores[level][i]["time"] = lastTime;
			break ;
		}
	}
	return bestScores;
}

// display scores on page
function displayPodium()
{
	let scores = JSON.parse(localStorage.getItem("highscores"));
	let sct = document.querySelector(".highscores .leaderboard");
	let classment = document.querySelector(".highscores ul");
	let clone = classment.cloneNode(true);
	classment.remove();
	for (let level in scores)
	{
		let place = clone.querySelectorAll("li");
		if (scores[level] == null || Object.keys(scores[level]).length === 0)
		{
			place[0].innerHTML = "1.&nbsp;&nbsp; " + "xxxxx" + " <span class='time'>99min99sec</span>";
			place[1].innerHTML = "2.&nbsp;&nbsp; " + "xxxxx" + " <span class='time'>99min99sec</span>";
			place[2].innerHTML = "3.&nbsp;&nbsp; " + "xxxxx" + " <span class='time'>99min99sec</span>";
		}
		else{
			place[0].innerHTML = "1.&nbsp;&nbsp; " + scores[level]["1"]["name"] + " <span class='time'>" + formatScore(scores[level]["1"]["time"]) + "</span>";
			place[1].innerHTML = "2.&nbsp;&nbsp; " + scores[level]["2"]["name"] + " <span class='time'>" + formatScore(scores[level]["2"]["time"]) + "</span>";
			place[2].innerHTML = "3.&nbsp;&nbsp; " + scores[level]["3"]["name"] + " <span class='time'>" + formatScore(scores[level]["3"]["time"]) + "</span>";
		}
		let title = document.createElement("h3");
		title.textContent = level;
		sct.appendChild(title);
		sct.appendChild(clone.cloneNode(true));
	}
}

// Save the last score for a level
function saveScore(lastName, lastTime, level)
{
	let bestScores = JSON.parse(localStorage.getItem('highscores'));
	console.log("saveScore");
	console.log("-", lastName, lastTime, level);
	if (bestScores == null || bestScores[level] == null || Object.keys(bestScores[level]).length === 0)
		bestScores = createPodium(...arguments, bestScores);
	else
		scores = addToPodium(...arguments, bestScores);
	localStorage.setItem('highscores', JSON.stringify(bestScores));
}

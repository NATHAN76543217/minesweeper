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

function createPodium(lastName, lastTime)
{
	if (lastName)
		var podium = {
			"1": {"name": lastName, "time": lastTime},
			"2" :{ "name": "", "time": ""},
			"3" :{ "name": "", "time": ""}
		}
	else
		var podium = {
			"1": {"name": "", "time": ""},
			"2" :{ "name": "", "time": ""},
			"3" :{ "name": "", "time": ""}
		}
	return podium;
}

function addToPodium(lastName, lastTime)
{
	let podium = JSON.parse(localStorage.getItem("highscores"));
	console.log(podium);
	let i = 1;
	for (i; i <= 3; i++)
	{
		if (parseInt(podium[i]["time"]) >= parseInt(lastTime) || podium[i]['time'] === "")
		{
			//lower the scores in the ranking
			for (let y = 2 ; y >= i; --y)
			{
				podium[y + 1]["name"] = podium[y]["name"];
				podium[y + 1]["time"] = podium[y]["time"]; 
			}
			podium[i]["name"] = lastName;
			podium[i]["time"] = lastTime;
			break ;
		}
	}
	return podium;
}

function displayPodium()
{
	let podium = localStorage.getItem("highscores");
	let place = document.querySelectorAll(".highscores li");
	if (podium == null)
	{
		place[0].innerHTML = "1. " + "xxxxx" + " <span class='time'>99min99sec</span>";
		place[1].innerHTML = "2. " + "xxxxx" + " <span class='time'>99min99sec</span>";
		place[2].innerHTML = "3. " + "xxxxx" + " <span class='time'>99min99sec</span>";
	}
	else{
		podium = JSON.parse(podium);
		place[0].innerHTML = "1. " + podium["1"]["name"] + " <span class='time'>" + formatScore(podium["1"]["time"]) + "</span>";
		place[1].innerHTML = "2. " + podium["2"]["name"] + " <span class='time'>" + formatScore(podium["2"]["time"]) + "</span>";
		place[2].innerHTML = "3. " + podium["3"]["name"] + " <span class='time'>" + formatScore(podium["3"]["time"]) + "</span>";
	}
}

function saveScore(lastName, lastTime)
{
	let podium = null;
	if (localStorage.getItem('highscores') == null)
		podium = createPodium(lastName, lastTime);
	else
		podium = addToPodium(lastName, lastTime);
	localStorage.setItem('highscores', JSON.stringify(podium));
}

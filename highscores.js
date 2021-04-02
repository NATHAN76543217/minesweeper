const lastTime = localStorage.getItem("lastTime");
const lastName = localStorage.getItem("lastName");

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

function createPodium()
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
    localStorage.setItem('highscores', JSON.stringify(podium));
    return podium;
}

function addToPodium()
{
    let podium = JSON.parse(localStorage.getItem("highscores"));
    console.log(podium);
    if (lastTime == null || lastTime == "")
        return podium;
    let i = 1;
    for (i; i <= 3; i++)
    {
        if (podium[i]["time"] >= lastTime || podium[i]['time'] === "")
        {
            console.log("in i ==", i);
            if (podium[i]["time"] != lastTime)
            {
                for (let y = 2 ; y >= i; --y)
                {
                    console.log("w i ==", i);
                    podium[y + 1]["name"] = podium[y]["name"];
                    podium[y + 1]["time"] = podium[y]["time"]; 
                }
            }
            console.log("out i ==", i);
            podium[i]["name"] = lastName;
            podium[i]["time"] = lastTime;
            break ;
        //TODO ajouter enter your name in <input>
        }
    }
    localStorage.setItem('highscores', JSON.stringify(podium));
    return podium;
}

function displayPodium(podium)
{
    if (podium)
    {
        let place = document.querySelectorAll(".highscores li");
        place[0].innerHTML = "1. " + podium["1"]["name"] + " <span class='time'>" + formatScore(podium["1"]["time"]) + "</span>";
        place[1].innerHTML = "2. " + podium["2"]["name"] + " <span class='time'>" + formatScore(podium["2"]["time"]) + "</span>";
        place[2].innerHTML = "3. " + podium["3"]["name"] + " <span class='time'>" + formatScore(podium["3"]["time"]) + "</span>";
    }
}

if (localStorage.getItem('highscores') == null)
    var podium = createPodium();
else
    var podium = addToPodium();

console.log("podium", podium);
displayPodium(podium);


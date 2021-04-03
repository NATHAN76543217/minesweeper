let context = {};
let map = [];
let bomblist = [];

//TODO Question sur section/aside

const mapSize = [{width:10, height:10}, {width:12, height:12}, {width:15, height:15}];
let level = 0;
let nbBomb = 10;
let timer = 0;
let iTimer = 0;

function gameInProgress()
{
	if (localStorage.getItem("state") != null && localStorage.getItem("html") != null)
		return true;
	else
		return false;
}

function resumeGame()
{
	console.log("resume game");
	//get saved data
	const state = JSON.parse(localStorage.getItem("state"));
	const content = localStorage.getItem("html");
	const endMenu = document.querySelector(".endMenu");

	//fill variables with data
	if(content && state) {
		timer	= state["time"];
		map		= state["map"];
		nbBomb	= state["nbBomb"];
		level	= state["level"];
		document.body.innerHTML = content
		endMenu.style.visibility = "hidden";
		loadAudio();
	}
	loadContext();

	//restore listener and interval
	initTimer(timer);
	map.forEach((box, ndx) => {
		box.sqr = context["boxes"].shift();
		addListener(box);
	});
	//check game state
	if (checkWin())
		endGame("win");

}

function saveGame()
{
	// console.log("save game");
	const state = {
		"time": timer,
		"map": map,
		"nbBomb": nbBomb,
		"level": level
	}
	localStorage.setItem("html", document.body.innerHTML)
	localStorage.setItem("state", JSON.stringify(state));
}

function enterName()
{

	if (checkWin())
	{
		const name = context["inputName"].value;
		console.log("Name =", name);
		if (name.length > 0 && name.length <= 10)
		{
			localStorage.setItem("lastName", name);
			localStorage.removeItem("html");
			localStorage.removeItem("state");
			return true;
		}
		context["menuTxt"].innerHTML = "<strong>Enter beetween 1 and 10 characters.<Strong>";
		return false
	}
	else
	{
		localStorage.removeItem("html");
		localStorage.removeItem("state");
		return true;	
	}
}

function endGame(result)
{
	console.log("You "  + result + " !!!!");
	clearInterval(iTimer);
	const endMenu = document.querySelector(".endMenu");
	endMenu.style.visibility = "visible";
	if (result === "win")
	{
		context["menuTxt"].innerHTML = "<h2>You&nbsp;win&nbsp;in&nbsp;" + timer + "&nbsp;seconds</h2>";
		localStorage.setItem("lastTime", timer);
	}
	else
	{
		context["inputName"].style.display = "none";
		//disable label
		const label = document.querySelector(".endMenu label");
		label.textContent = "";
		// document.querySelector(".endMenu a").onClick = null;
		context["menuTxt"].innerHTML += "<h1>You&nbsp;Loose!</h1>";
		localStorage.removeItem("html");
		localStorage.removeItem("state");
		
	}
}

function checkWin()
{
	if (nbBomb != 0)
		return false;
	for (let bomb of bomblist)
	{
		if (!bomb.sqr.classList.contains('flagged'))
			return false;
	}
	return true;
}

function triggerEvent(el, type){
	if ('createEvent' in document) {
		 // modern browsers, IE9+
		 var e = document.createEvent('HTMLEvents');
		 e.initEvent(type, false, true);
		 e.button = 0;
		 el.dispatchEvent(e);
	 } else {
		 // IE 8
		 var e = document.createEventObject();
		 e.eventType = type;
		 e.button = 0;
		 el.fireEvent('on'+e.eventType, e);
	 }
}

function addListener(box)
{
	box.sqr.addEventListener('contextmenu', event => event.preventDefault());
	box.sqr.addEventListener('mouseup', function (event) {
		event.preventDefault();
		switch (event.button){
			case 0:
				if (rightClick(box) === "loose")
					return ;
				break;
			case 2:
				leftClick(box);
				break;
			default:
				console.log("Not handled mouseup event");
				break;
		}
		saveGame();
		if (checkWin())
			endGame("win");
	});
}

function applyNear(box, func)
{
	for (let i = -1; i <= 1; i++)
	{
		for (let t = -1; t <= 1; t++)
		{
			let h = box.y + i;
			let w = box.x + t;
			if (h >= 0 && h < mapSize[level].height && w >= 0 && w < mapSize[level].width)
			{
				let near = (h * mapSize[level].width) + w;
				func(near);
			}
		}
	}
}

function rightClick(box)
{
	if (box.hide)
	{
		if (!box.sqr.classList.contains('flagged'))
		{
			box.hide = false;
			box.sqr.classList.add('uncovered');
			if (box.isBomb)
			{
				map.audios["boom"].currentTime = 0; // if want to play it a 2nd time before first is over
				map.audios["boom"].play();
				box.sqr.classList.add('mined');
				endGame("loose");
				return "loose";
			}
			else
			{
				map.audios["shovel"].currentTime = 0; // if want to play it a 2nd time before first is over
				map.audios["shovel"].play();
				box.sqr.classList.add("has-indicator")
				if (box.near != 0)
					box.sqr.dataset.mineCount = box.near;
				else
				{
					applyNear(box, (near) => {
						if (map[near].hide == true)
							triggerEvent(map[near].sqr, 'mouseup');
					});
				}
			}
		}
	}
}

function leftClick(box)
{
	if (box.sqr.classList.contains('flagged'))
	{
		box.sqr.classList.remove('flagged');
		box.flagged = false;
		context["flags"].innerHTML = "<img src=\"img/flag.png\">" + ++nbBomb;
	}
	else if (box.hide && nbBomb > 0)
	{
		box.sqr.classList.add('flagged');
		box.flagged = true;
		context["flags"].innerHTML = "<img src=\"img/flag.png\">" + --nbBomb;
	}	
}

function loadAudio()
{
	map.audios = {
		"shovel" : document.querySelector("Audio#shovel"),
		"boom" : document.querySelector("Audio#boom")
	}
}

function loadContext()
{
	context["flags"] = document.querySelector(".flags");
	context["boxes"] = [...document.getElementsByClassName('box')];
	context["eTimer"] = document.querySelector(".time");
	context["menuTxt"] = document.querySelector(".endMenu span");
	context["inputName"] = document.querySelector(".endMenu input");
	context["board"] = document.querySelector(".board");
}

function initMap()
{
	map = context["boxes"].map(box=>{return {
		sqr:box, 
		x:0,
		y:0,
		hide:true,
		isBomb:false,
		near:0,
		audios: null,
		flagged: false
	}});
    map.forEach((box, ndx) => {
		box.x = ndx % mapSize[level].width;
		box.y = Math.floor(ndx / mapSize[level].width);
        box.sqr.classList.remove('mined', 'uncovered', "has-indicator", "flagged");
        box.sqr.removeAttribute('data-mine-count');
        addListener(box);
    });
}

function initBomb()
{
    let i = 0;
    while ( i < nbBomb)
    {
		let ndx = Math.floor(Math.random() * map.length);
        let box = map[ndx];
        if (!box.isBomb)
        {
			console.log("Bomb on ", box.x, box.y);
            box.isBomb = true;
			bomblist.push(box);
			applyNear(box, (near) => {
				map[near].near += 1;
			});
            i++;
        }
    }
	context["flags"].innerHTML = "<img src=\"img/flag.png\">" + nbBomb;
}

function initTimer(elapsed)
{
	function startTimer(){
		const start = Date.now();
		iTimer = setInterval(() => {
			if (elapsed)
			{
				timer = Math.floor((Date.now() - start) / 1000) + elapsed; // in seconds
				console.log("time = " +  elapsed + " + "  + Math.floor((Date.now() - start)/1000));
			}
			else
				timer = Math.floor((Date.now() - start) / 1000); // in seconds
			context["eTimer"].innerHTML = "<img src=\"img/time.png\">" + timer ;
		}, 1000);
		context["board"].removeEventListener('mouseup', startTimer);
	}
	context["board"].addEventListener('mouseup', startTimer);
}

function init()
{
	console.log("init");
	loadContext();
    initMap();
	loadAudio();
    initBomb();
	initTimer();
}

//TODO plusieurs difficultés
//TODO reduce stack utilisation
//TODO don't save game state when propagation

if (gameInProgress())
	resumeGame();
else
	init();

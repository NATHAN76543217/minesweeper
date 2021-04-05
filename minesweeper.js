let context = {};
let map = [];
let bomblist = [];

//TODO Question sur les balises section/aside dans highsxores.html

const mapSize = {"easy": {width:10, height:10, bomb: 10}, "medium": {width:12, height:12, bomb: 15}, "hard":{width:15, height:15, bomb:20}};
let level = "easy";
let nbBomb = 0;
let g_timer = 0;
let iTimer = 0;

// PERSISTENCE 

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
		g_timer	= state["time"];
		map		= state["map"];
		nbBomb	= state["nbBomb"];
		level	= state["level"];
		document.body.innerHTML = content
		endMenu.style.visibility = "hidden";
		loadAudio();
	}
	loadContext();

	//restore listener and interval
	initTimer(g_timer);
	map.forEach((box, ndx) => {
		box.sqr = context["boxes"].shift();
		addListener(box);
	});
	//check game state
	if (checkWin())
		endGame("win");

}

function saveGameState()
{
	// console.log("save game");
	const state = {
		"time": g_timer,
		"map": map,
		"nbBomb": nbBomb,
		"level": level
	}
	localStorage.setItem("html", document.body.innerHTML)
	localStorage.setItem("state", JSON.stringify(state));
}

// GAME END

function enterName()
{

	if (checkWin())
	{
		const name = context["inputName"].value;
		console.log("Name =", name);
		if (name.length > 0 && name.length <= 10)
		{
			saveScore(name, g_timer, level);
			localStorage.removeItem("html");
			localStorage.removeItem("state");
			return true;
		}
		else
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
		context["menuTxt"].innerHTML = "<h2>You&nbsp;win&nbsp;in&nbsp;" + g_timer + "&nbsp;seconds</h2>";
	else // if loose
	{
		//disable input and label
		const label = document.querySelector(".endMenu label");
		label.textContent = "";
		context["inputName"].style.display = "none";
		context["menuTxt"].innerHTML += "<h1>You&nbsp;Loose!</h1>";
		// for restarting a new game on refresh
		localStorage.removeItem("html");
		localStorage.removeItem("state");
		
	}
}

function checkWin()
{
	// check if only bomb remains
	let allBomb = true;
	const hiddenBox = map.filter(function(box) {
		return (box.hide === true);
	});
	for (let box of hiddenBox)
		if (box.isBomb !== true)
			allBomb = false;
	if (allBomb)
		return true;
	// check if all bomb have a flag
	if (nbBomb != 0)
		return false;
	for (let bomb of bomblist)
		if (!bomb.sqr.classList.contains('flagged'))
			return false;
	return true;
}

// GAMEPLAY

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

function applyNear(box, func)
{
	//Apply a function to every neighbouring box
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
// OnClick
function rightClick(box)
{
	if (box.hide === false || box.sqr.classList.contains('flagged'))
		return ;
	box.hide = false;
	box.sqr.classList.add('uncovered');
	if (box.isBomb)
	{
		box.sqr.classList.add('mined');
		playAudio("boom");
		endGame("loose");
		return "loose";
	}
	else
	{
		playAudio("shovel");
		box.sqr.classList.add("has-indicator")
		if (box.near != 0)
			box.sqr.dataset.mineCount = box.near; // set number on case
		else
		{
			// open box propagation 
			applyNear(box, (near) => {
				if (map[near].hide == true)
					triggerEvent(map[near].sqr, 'mouseup');
			});
			return "propagate";
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
	else if (box.hide)
	{
		// cap nb flag to nb bomb
		// if (nbBomb <= 0)
		// 	return ;
		box.sqr.classList.add('flagged');
		box.flagged = true;
		context["flags"].innerHTML = "<img src=\"img/flag.png\">" + --nbBomb;
	}	
}

function addListener(box)
{
	box.sqr.addEventListener('contextmenu', event => event.preventDefault());
	box.sqr.addEventListener('mouseup', function (event) {
		event.preventDefault();
		switch (event.button){
			case 0:
				const ret = rightClick(box);
				if (ret === "loose" || ret === "propagate")
					return ;
				break;
			case 2:
				leftClick(box);
				break;
			default:
				console.log("Not handled mouseup event");
				break;
		}
		console.log("SAVE");
		saveGameState();
		if (checkWin())
			endGame("win");
	});
}

// AUDIO

function playAudio(track)
{
	map.audios[track].currentTime = 0; // if want to play it a 2nd time before first is over
	map.audios[track].play();
}

function loadAudio()
{
	map.audios = {
		"shovel" : document.querySelector("Audio#shovel"),
		"boom" : document.querySelector("Audio#boom")
	}
}

// TIME

function initTimer(elapsed)
{
	function startTimer(){
		const start = Date.now();
		iTimer = setInterval( updateTime, 1000, start, elapsed);
		context["board"].removeEventListener('mouseup', startTimer);
	}
	context["board"].addEventListener('mouseup', startTimer);
}

function formatTime(time)
{
	const sec = time % 60;
	const min = Math.floor(time / 60);
	return min + ":" + sec;
}

function updateTime(start, elapsed)
{
	if (elapsed)
		g_timer = Math.floor((Date.now() - start) / 1000) + elapsed; // in seconds
	else
		g_timer = Math.floor((Date.now() - start) / 1000); // in seconds
	context["eTimer"].innerHTML = "<img src=\"img/time.png\">" + formatTime(g_timer);
}

// INIT

function init()
{
	console.log("init:", level);
	document.querySelector("main .grid").style.display = "block";
	createMap();
	loadContext();
    initMap();
	loadAudio();
    initBomb();
	initTimer();
}


function createMap()
{
	const size = mapSize[level];
	nbBomb = size.bomb;
	let board = document.querySelector(".board .grid");
	let firstLine = document.createElement("div");
	firstLine.classList.add("row");
	for (let i = 0; i < size.width; i++)
	{
		let sqr = document.createElement("button");
		sqr.classList.add("box");
		firstLine.appendChild(sqr);
	}
	for(let i = 0; i < size.height; i++)
	{
		board.appendChild(firstLine.cloneNode(true));
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
        box.sqr.removeAttribute('data-mine-count');
        box.sqr.classList.remove('mined', 'uncovered', "has-indicator", "flagged");
        addListener(box);
    });
}

function initBomb()
{
    let i = 0;
    while ( i < nbBomb)
    {
		const ndx = Math.floor(Math.random() * map.length);
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

// LEVELING
function saveLevel()
{
	level = this.getAttribute("data-value");
	localStorage.setItem("level", level);
	document.getElementById("levelSelector").style.display = "none";
	init();
}

function levelSelector()
{
	const	difficulties = ["easy", "medium", "hard"];
	let		ls = document.createElement('div');
	
	localStorage.removeItem("level");
	ls.classList.add( "highscores", "levelSelector");
	ls.innerHTML += "<h2 style='margin-bottom:30px;'>Select your difficulty</h2>";
	ls.id = "levelSelector";
	for (let diff of difficulties)
	{
		let btn = document.createElement('a');
		btn.textContent = diff;
		btn.setAttribute("data-value", diff);
		btn.classList.add('btn');
		btn.addEventListener('click', saveLevel);
		ls.appendChild(btn);
	}	
	return ls;
}

function selectLevelBox()
{
	const main = document.querySelector("main.board");
	document.querySelector("main .grid").style.display = "none";
	main.appendChild(levelSelector());
}

//TODO reduce stack utilisation

// Start
if (gameInProgress())
	resumeGame();
else
	selectLevelBox();

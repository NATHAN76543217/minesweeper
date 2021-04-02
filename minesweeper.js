const flags = document.querySelector(".flags");
const boxes = [...document.getElementsByClassName('box')];
const eTimer = document.querySelector(".time");
const menuTxt = document.querySelector(".endMenu span");
const inputName = document.querySelector(".endMenu input");

//TODO Question sur section/aside

let bomblist = [];
const size = {width:10, height:10};
let map = boxes.map(box=>{return {
	sqr:box, 
	x:0,
	y:0,
    hide:true,
    isBomb:false,
	near:0,
	audios: null
}});
let nbBomb = 10;
let timer = 0;
let iTimer = 0;

function enterName()
{
	if (checkWin())
	{
		
		const name = inputName.value;
		console.log("Name =", name);
		if (name.length > 0 && name.length <= 10)
		{
			localStorage.setItem("lastName", name)
			return true;
		}
		menuTxt.innerHTML = "<strong>Enter beetween 1 and 10 characters.<Strong>";
		return false
	}
	else
		return true;
}

function endGame(result)
{
	console.log("You "  + result + " !!!!");
	clearInterval(iTimer);
	const endMenu = document.querySelector(".endMenu");
	endMenu.style.visibility = "visible";
	if (result === "win")
	{
		menuTxt.innerHTML = "<h2>You&nbsp;win&nbsp;in&nbsp;" + timer + "&nbsp;seconds</h2>";
		localStorage.setItem("lastTime", timer);
	}
	else
	{
		inputName.style.display = "none";
		//disable label
		const label = document.querySelector(".endMenu label");
		label.textContent = "";
		document.querySelector(".endMenu a").onClick = null;
		menuTxt.innerHTML += "<h1>You&nbsp;Loose!</h1>";
		
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

function applyNear(box, func)
{
	for (let i = -1; i <= 1; i++)
	{
		for (let t = -1; t <= 1; t++)
		{
			let h = box.y + i;
			let w = box.x + t;
			if (h >= 0 && h < size.height && w >= 0 && w < size.width)
			{
				let near = (h * size.width) + w;
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
		flags.innerHTML = "<img src=\"img/flag.png\">" + ++nbBomb;
	}
	else if (box.hide && nbBomb > 0)
	{
		box.sqr.classList.add('flagged');
		flags.innerHTML = "<img src=\"img/flag.png\">" + --nbBomb;
	}	
}

function loadAudio()
{
	map.audios = {
		"shovel" : document.querySelector("Audio#shovel"),
		"boom" : document.querySelector("Audio#boom")
	}
}

function initMap()
{
    map.forEach((box, ndx) => {
		box.x = ndx % size.width;
		box.y = Math.floor(ndx / size.width);
        box.sqr.classList.remove('mined', 'uncovered', "has-indicator", "flagged");
        box.sqr.removeAttribute('data-mine-count');
        box.sqr.addEventListener('contextmenu', event => event.preventDefault());
		box.sqr.addEventListener('mouseup', event => {
			event.preventDefault();
			// event.stopPropagation();
			console.log(event.button);
            switch (event.button){
                case 0:
					rightClick(box);
					break;
				case 2:
					leftClick(box);
					break;
				default:
					console.log("Not handled mouseup event");
					break;
            }
			if (checkWin())
				endGame("win");
        })
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
	flags.innerHTML = "<img src=\"img/flag.png\">" + nbBomb;
}

function initTimer()
{
	const board = document.querySelector(".board");
	function startTimer(){
		const start = Date.now();
		iTimer = setInterval(() => {
			timer = Math.floor((Date.now() - start) / 1000); // in seconds
			eTimer.innerHTML = "<img src=\"img/time.png\">" + timer ;
		});
		board.removeEventListener('mouseup', startTimer);
	}
	board.addEventListener('mouseup', startTimer);
}

function init()
{
    initMap();
    initBomb();
	initTimer();
	loadAudio();
}

console.log("init");
init();


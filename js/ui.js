/**
 * Game speed slider
 */
$(function() {
	let currentValue = $('#speedValue');
	$('#speedSlider').change(function() {
        speed = this.value;
        // currentValue.html(speed);
        send(inGameAction.TYPING, this.id, speed);
	});
	$('#speedSlider').change();
});
/**
 * Make settings visible/invisible
 */
function settingsStatus() {
    let style = window.getComputedStyle(menue);
    let visibility = style.getPropertyValue('display');
    if (visibility === 'none') {
        visibility = 'block';
    } else {
        visibility = 'none';
    }
    menue.style.display = visibility;
}

/**
 * Make helpPanel visible/invisible
 */
function helpStatus() {
    let style = window.getComputedStyle(helpPanel);
    let visibility = style.getPropertyValue('display');
    if (visibility === 'none') {
        visibility = 'block';
    } else {
        visibility = 'none';
    }
    helpPanel.style.display = visibility;
}
  /*    ========================= AUTO NAVIGATION ========================= */
const autoNavigate = function() {
    theta += sens*0.009;
    phi = 0.5;
    let depth = Math.max(zDim, xDim, yDim);
    cameraZ = (depth) * size;
    if (autoNav) {
        setTimeout(autoNavigate, 1);
    }
};

const triggerAutoNav = function() {
    autoNav = !autoNav;
    if (autoNav) {
        autoNavigate();
    }
};
  /*    ========================= GAME STATUS ========================= */

/**
 * Parses a string to an array of integers(range)
 * @param {String} rangeString
 *
 * @return {Array} The range
 */
const parse = function(rangeString) {
    let validNumbers = [];
    let ranges = rangeString.split(',');
    let numbers = ranges.map(function(arr) {
			return arr.split('-');
		});
    if (numbers[0][0] === '') {
        return false;
    }
    numbers.forEach(function(range) {
        switch (range.length) {
            case 1:
            validNumbers.push(Number(range[0]));
            break;
            case 2:
            let intervalStart = Number(range[0]);
            let intervalEnd = Number(range[1]);
            for(let i = intervalStart; i < intervalEnd; i++) {
                 validNumbers.push(i);
            }
            break;
            default:
            break;
        }
    });
    resetGameRules();
    return validNumbers;
};

/**
 * Clears the gameRules used array
 */
function resetGameRules() {
    myGame.resetStatus();
    rulesUsed = [];
}
/**
 * Pauses/resumes the game
 */
const pause = function() {
    paused = !paused;
    if (paused) {
        statusButton.innerHTML = 'Resume';
    } else {
        statusButton.innerHTML = 'Pause';
    }
};

const start3DGameEvent = function() {
    myGame.produceRange = parse(productionRange.value);
    myGame.deathRange = parse(deathRange.value);
    if (myGame.produceRange === false
     || myGame.deathRange === false
    ) {
        alert('Can\'t accept Empty Values');
    } else {
        rulesUsed.push(gameRules.thirdD);
    }
};

/**
 * Starts a new game
 */
const newGameEvent = function() {
	let xDim = xDimInput.value;
	let yDim = yDimInput.value;
	let zDim = zDimInput.value;
    newGame(xDim, yDim, zDim, false);
};

/**
 * Loads a game
 */
const loadGameEvent = function() {
	let gameSelected = availableGamesSelect.value;
    $.getJSON('gameList.json', function(json) {
        newGame(0, 0, 0, json[gameSelected]);
    });
    resetGameRules();
};

const dragStart = function(event) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('Text', event.target.getAttribute('id'));
    event.dataTransfer.setDragImage(event.target, 0, 0);
    return true;
};

const dragEnter = function(event) {
   event.preventDefault();
   return true;
};

const dragOver = function(event) {
     event.preventDefault();
};

const dragDrop = function(event) {
    let rule = event.dataTransfer.getData('Text');
    if (gameRules.hasOwnProperty(rule)) {
        event.target.appendChild(document.getElementById(rule));
        event.stopPropagation();
        return false;
   }
};

/**
 * Add a rule to the game rules
 * @param {*} event
 */
const addRule = function(event) {
    let rule = event.dataTransfer.getData('Text');
    if (gameRules.hasOwnProperty(rule) && !rulesUsed.includes(rule)) {
        rulesUsed.push(rule);
    }
};

/**
 * Remove a rule in the game
 * @param {*} event
 */
const removeRule = function(event) {
    let rule = event.dataTransfer.getData('Text');
    let index = rulesUsed.indexOf(rule);
    if (gameRules.hasOwnProperty(rule)) {
        rulesUsed.splice(index, 1);
    }
};

/**
 * Sets each generation status
 */
function setGameStatus() {
    generation.innerHTML = myGame.generation;
    produced.innerHTML = myGame.produced;
    died.innerHTML = myGame.died;
    stayedAlive.innerHTML = myGame.stayedAlive;
    stayedDead.innerHTML = myGame.stayedDead;
}


const sharedInput = function(event) {
    switch(event.target.typeInput) {
        case inputType.range:
        if (!range.includes(event.key)) {
            return false;
        }
        break;
        case inputType.number:
        if (!numbers.includes(event.key)) {
            return false;
        }
        break;
    }
    send(inGameAction.TYPING, this.id, this.value);
};

const sharedClick = function(event) {
    if (event.isTrusted) {
        send(inGameAction.CLICK, this.id);
    }
};

const inputType = {
    range: 0,
    number: 1,
};
const range = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '-', ',', 'Backspace',
];
const numbers = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace',
];


/**
 * GLOBAL letIABLES
 */
let settingsButton = document.getElementById('settings');
let helpButton = document.getElementById('helpButton');
let statusButton = document.getElementById('status');
let helpPanel = document.getElementById('helpPanel');
let menue = document.getElementById('menue');
let newGameButton = document.getElementById('newGameButton');
let loadGameButton = document.getElementById('loadGameButton');
let availableGamesSelect = document.getElementById('availableGamesSelect');
availableGamesSelect.addEventListener('change', function(event) {
    send(inGameAction.TYPING, this.id, this.value);
});
// Input to generate new map
let xDimInput = document.getElementById('xDim');
let yDimInput = document.getElementById('yDim');
let zDimInput = document.getElementById('zDim');
// 2D planes drag/drop
let usedRules = document.getElementById('usedRules');
let notUsedRules = document.getElementById('notUsedRules');
let xyRule = document.getElementById('XY');
let xzRule = document.getElementById('XZ');
let yzRule = document.getElementById('YZ');
// Game inforamtion
let generation = document.getElementById('generation');
let produced = document.getElementById('produced');
let died = document.getElementById('died');
let stayedAlive = document.getElementById('stayedAlive');
let stayedDead = document.getElementById('stayedDead');
// 3D range
let productionRange = document.getElementById('productionRange');
let deathRange = document.getElementById('deathRange');
let start3D = document.getElementById('start3D');
// Auto navigation
let autoNavigateButton = document.getElementById('autoNavigateButton');





/**
 * EVENT HANDLERS
 */
settingsButton.addEventListener('click', settingsStatus, false);
// helpButton.addEventListener('click', helpStatus, false);
statusButton.addEventListener('click', pause, false);
newGameButton.addEventListener('click', newGameEvent, false);
loadGameButton.addEventListener('click', loadGameEvent, false);
start3D.addEventListener('click', start3DGameEvent, false);
autoNavigateButton.addEventListener('click', triggerAutoNav, false);



// Sharing button clicks via websocket
const buttons = document.getElementsByTagName('button');
Array.from(buttons).forEach(function(element) {
    element.addEventListener('click', sharedClick);
});

// Sharing user input via websocket
const dimInput = document.getElementsByClassName('dimInput');
Array.from(dimInput).forEach(function(element) {
    element.addEventListener('keyup', sharedInput, false);
    element.onkeypress = sharedInput;
    element.typeInput = inputType.number;
});

const rangeInput = document.getElementsByClassName('rangeInput');
Array.from(rangeInput).forEach(function(element) {
    element.addEventListener('keyup', sharedInput, false);
    element.onkeypress = sharedInput;
    element.typeInput = inputType.range;
});


// Dragging EventListener
usedRules.addEventListener('drop', dragDrop, false);
usedRules.addEventListener('drop', addRule, false);
usedRules.addEventListener('dragenter', dragEnter, false);
usedRules.addEventListener('dragover', dragOver, false);
notUsedRules.addEventListener('drop', dragDrop, false);
notUsedRules.addEventListener('drop', removeRule, false);
notUsedRules.addEventListener('dragenter', dragEnter, false);
notUsedRules.addEventListener('dragover', dragOver, false);
xyRule.addEventListener('dragstart', dragStart, false);
xzRule.addEventListener('dragstart', dragStart, false);
yzRule.addEventListener('dragstart', dragStart, false);

/**
 * Populate select element with saved games
 */
window.onload=function() {
    $.getJSON('gameList.json', function(gamesSaved) {
        for(let gameSaved in gamesSaved) {
            availableGamesSelect.options[availableGamesSelect.options.length] =
                new Option(gameSaved, gameSaved);
        }
    });
};

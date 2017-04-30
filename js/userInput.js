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
function setInGameSettVisi() {
    const menue = document.getElementById('menue');
    setVisibility(menue);
}

/**
 * Sets the passes element visibility
 * @param {any} element DOM element
 */
function setVisibility(element) {
    let style = window.getComputedStyle(element);
    let visibility = style.getPropertyValue('display');
    if (visibility === 'none') {
        visibility = 'block';
    } else {
        visibility = 'none';
    }
    element.style.display = visibility;
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
    let depth = Math.max(userInput.z, userInput.x, userInput.y);
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
        stopButton.innerHTML = 'Resume';
    } else {
        stopButton.innerHTML = 'Pause';
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
    userInput.generateWay = document.querySelector(
                  'input[name="generateWay"]:checked'
                ).id;
    userInput.x = xInput.value;
    userInput.y = yInput.value;
    userInput.z = zInput.value;
    userInput.gameSelected = false;
    newGame(userInput);
};

/**
 * Loads a game
 */
const loadGameEvent = function() {
	let gameSelected = availableGamesSelect.value;
    $.getJSON('gameList.json', function(json) {
        let userInput = {
            gameSelected: json[gameSelected],
            generateWay: generateWay.LOAD,
        };
        newGame(userInput);
    });
    resetGameRules();
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
const settingsButton = document.getElementById('settingsButton');
const helpButton = document.getElementById('helpButton');
const stopButton = document.getElementById('stopButton');
const helpPanel = document.getElementById('helpPanel');

// Loading
const loadGameButton = document.getElementById('loadGameButton');
const availableGamesSelect = document.getElementById('availableGamesSelect');
availableGamesSelect.addEventListener('change', function(event) {
    send(inGameAction.TYPING, this.id, this.value);
});
// Input to generate new map
const xInput = document.getElementById('xDim');
const yInput = document.getElementById('yDim');
const zInput = document.getElementById('zDim');
// Game inforamtion
const generation = document.getElementById('generation');
const produced = document.getElementById('produced');
const died = document.getElementById('died');
const stayedAlive = document.getElementById('stayedAlive');
const stayedDead = document.getElementById('stayedDead');
// 3D range
const productionRange = document.getElementById('productionRange');
const deathRange = document.getElementById('deathRange');
const start3D = document.getElementById('start3D');
// Auto navigation
const autoNavigateButton = document.getElementById('autoNavigateButton');


/**
 * EVENT HANDLERS
 */
settingsButton.addEventListener('click', setInGameSettVisi, false);
// helpButton.addEventListener('click', helpStatus, false);
stopButton.addEventListener('click', pause, false);
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

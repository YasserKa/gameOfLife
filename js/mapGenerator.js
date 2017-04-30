function mapStart() {
    page.checkRight();
    page.checkDown();
    setGeneVisi();
    makePage();
}

let page = {
    xStart: 0,
    yStart: 0,
    yEnd: 0,
    xEnd: 0,
    xFull: false,
    yFull: false,
    size: 10,
    checkDown: function() {
        if (this.xEnd + this.size< userInput.x) {
            this.xEnd += this.size;
            this.xFull = true;
        } else {
            this.xEnd = userInput.x;
            this.xFull = false;
        }
    },
    goUp: function() {
        this.xFull = true;
        if (this.xEnd % this.size === 0) {
            this.xEnd -= this.size;
        } else {
           this.xEnd -= (this.xEnd % this.size);
        }
    },
    checkRight: function() {
        if (this.yEnd + this.size < userInput.y) {
            this.yEnd += this.size;
            this.yFull = true;
        } else {
            this.yEnd = userInput.y;
            this.yFull = false;
        }
    },
    goLeft: function() {
        this.yFull = true;
         if (this.yEnd % this.size === 0) {
            this.yEnd -= this.size;
        } else {
           this.yEnd -= (this.yEnd % this.size);
        }
    },
};

function tableMapGenerator(planeNum) {
    let z = planeNum;
    let table = '<tr><td></td>';
    if (page.yStart > 0) {
        table += '<td><button id="leftArrow"/><</button></td>';
    }
    table += '<th>Y</th>';

    // Initializing the header eg. X 1 2 3 4
    for (let y = page.yStart; y < page.yEnd; y++) {
        table += '<th>' + y + '</th>';
    }
    if(page.yEnd % page.size === 0 && page.yEnd != userInput.y) {
        table += '<td><button id="rightArrow"/>></button></td>';
    }
    // Adding Y
    table += '</tr> <tr>';
    if (page.xStart > 0) {
        table += '<td><button id="upArrow"/>^</button></td>';
    }
    table += `</tr>
        <tr>
        <th>X</th>
    </tr>`;
    // Adding the rest components
    for (let x = page.xStart; x < page.xEnd; x++) {
        table += '<th>' + x + '</th>' + '<td></td>';
        if (page.yStart > 0) {
            table += '<td></td>';
        }
        for (let y = page.yStart; y < page.yEnd; y++) {
            table += `  
            <td>
                <input class="cell"  
                title="X` + x + 'Y' + y +
                '" id="X' + x + 'Y' + y +`" type="checkbox"`;
            if (myGame.map[z][y][x]) {
                table += 'checked';
            }
            table += '> </td>';
        }
        table += '</tr>';
    }
    if(page.xFull && page.xEnd != userInput.x) {
        table += '<td><button id="downArrow"/>V</button></td>';
    }
    return table;
}
/**
 * Set the eventlistener for the checboxes to get connected with the map
 */
function setEvents() {
    let checkboxes = document.getElementsByClassName('cell');
    Array.from(checkboxes).forEach(function(element) {
        element.addEventListener('click', setCell);
    });
    if (page.xFull && page.xEnd != userInput.x) {
        let downArrow = document.getElementById('downArrow');
        downArrow.addEventListener('click', function() {
            page.xStart += page.size;
            page.checkDown();
            makePage();
        });
    }
    if (page.xStart > 0) {
        let upArrow = document.getElementById('upArrow');
        upArrow.addEventListener('click', function() {
            page.xStart -= page.size;
            page.goUp();
            makePage();
        });
    }

    if (page.yFull && page.yEnd != userInput.y) {
        let rightArrow = document.getElementById('rightArrow');
        rightArrow.addEventListener('click', function() {
            page.yStart += page.size;
            page.checkRight();
            makePage();
        });
    }
    if (page.yStart > 0) {
        let leftArrow = document.getElementById('leftArrow');
        leftArrow.addEventListener('click', function() {
            page.yStart -= page.size;
            page.goLeft();
            makePage();
        });
    }
}

function makePage() {
    mapGenerateTable.innerHTML = tableMapGenerator(mapPlaneInput.value);
    setEvents();
}
/**
 * Sets a cell in the map
 */
function setCell() {
    let positions = this.id.substring(1);
    positions = positions.split('Y');
    let x = positions[0];
    let y = positions[1];
    let z = mapPlaneInput.value;
    myGame.setCell(x, y, z);
}

const planeValidate = function(event) {
    if(isNaN(this.value) || this.value === '') {
        this.value = 0;
    }
    if(this.value.charAt(0) === '0' && this.value.length > 1) {
        this.value = this.value.charAt(1);
    }
    if(Number(this.value) > userInput.z - 1) {
        this.value = userInput.z - 1;
    }
    mapGenerateTable.innerHTML = tableMapGenerator(this.value);
    setEvents();
};


function setGeneSettVisi() {
    setVisibility(generatingSettings);
}
/**
 * Make generatePanel visible/invisible
 */
function setGeneVisi() {
    setVisibility(generatingSettings);
    setVisibility(generateButton);
    setVisibility(mapGeneratePanel);
}

// Generation
const generateSubmit = document.getElementById('generateSubmit');
const submitMap = document.getElementById('submitMap');
const generateButton = document.getElementById('generateButton');
const mapGeneratePanel = document.getElementById('mapGeneratePanel');
const generatingSettings = document.getElementById('generatingSettings');
const mapGenerateTable = document.getElementById('mapGenerate');
const mapPlaneInput = document.getElementById('mapPlane');

function doneGenerating() {
    myMode = mode.PLAYING;
    setVisibility(mapGeneratePanel);
    setVisibility(document.getElementById('menue'));
}
// EventListener
generateSubmit.addEventListener('click', newGameEvent, false);
submitMap.addEventListener('click', doneGenerating, false);
generateButton.addEventListener('click', setGeneSettVisi, false);
mapPlaneInput.onkeyup = planeValidate;

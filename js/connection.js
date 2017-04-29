

let action = {
    CONNECT: 1,
    SEND_MESS: 2,
    CLOSE: 3,
};

let inGameAction = {
    NEW_GAME: 1,
    NAVIGATE: 2,
    TYPING: 3,
    CLICK: 4,
};

let url = window.location.href;
let urlBroken = url.split('/');

let gameId = urlBroken[urlBroken.length-1];
let conn;
if(gameId !== '' && urlBroken[urlBroken.length-2] === 'FinalProject') {
    conn = new WebSocket('ws://' + config.webServer + ':8080');
    connect();
    // wsReady = true;
}

let send = function(inGameActionShared, inputId, inputValue) {
    let sharedData = {
            action: action.SEND_MESS,
            inGameAction: inGameActionShared,
            gameId: gameId,
            cameraZ: cameraZ,
            cameraY: cameraY,
            cameraX: cameraX,
            phi: phi,
            theta: theta,
            speed: speed,
    };
    switch(inGameActionShared) {
        case inGameAction.CLICK:
        case inGameAction.TYPING:
            sharedData.inputId = inputId;
        case inGameAction.TYPING:
            sharedData.inputValue = inputValue;
        break;
    }
    let msg = JSON.stringify(sharedData);
    if (wsReady) {
        conn.send(msg);
    }
};

function modify(obj, newObj) {
  Object.keys(obj).forEach(function(key) {
    if (typeof obj[key] !== 'function') {
        delete obj[key];
    }
  });

  Object.keys(newObj).forEach(function(key) {
        obj[key] = newObj[key];
  });
}

let wsReady = false;

function connect() {
    conn.onopen = function(e) {
        let details = {
            action: action.CONNECT,
            gameId: gameId,
        };
        wsReady = true;
        let msg = JSON.stringify(details);
        conn.send(msg);
    };

    conn.onmessage = function(e) {
        let sharedData = JSON.parse(e.data);
        switch(sharedData['inGameAction']) {
            case inGameAction.NAVIGATE:
                theta = sharedData['theta'];
                phi = sharedData['phi'];
                cameraZ = sharedData['cameraZ'];
                cameraY = sharedData['cameraY'];
                cameraX = sharedData['cameraX'];
            break;
            case inGameAction.TYPING:
                document.getElementById(sharedData['inputId']).value =
                sharedData['inputValue'];
                if(sharedData['inputId'] === 'speedSlider') {
                    speed = sharedData['speed'];
                }
            case inGameAction.CLICK:
                document.getElementById(sharedData['inputId']).click();
        }
    };

    window.onbeforeunload = function() {
        let details = {
                action: action.CLOSE,
                gameId: gameId,
        };
        let msg = JSON.stringify(details);
        conn.send(msg);
        wsReady = false;
        conn.close();
    };
}

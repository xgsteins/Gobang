'use strict'

const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

'use strict'

let board = new Array(15);
let moveInd = 0;
const position = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
    '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14
};

function inBoard(x, y) {
    return x >= 0 && x < 15 && y >= 0 && y < 15;
}

function move(x, y, nowColor) {
    if (moveInd % 2 + 1 == nowColor && board[x][y] == 0) {
        moveInd++;
        board[x][y] = nowColor;
        if (judge(x, y, nowColor)) {
            return 1;
        } else if (moveInd == 225) {
            return 2;
        } else {
            return 0;
        }
    } else {
        return -1;
    }
}

function judge(x, y, nowColor) {
    let cnt1 = 0, cnt2 = 0, cnt3 = 0, cnt4 = 0;
    for (let i = -5; i <= 5; i++) {
        let nx1 = x + i, ny1 = y + i;
        let nx2 = x + i, ny2 = y;
        let nx3 = x + i, ny3 = y - i;
        let nx4 = x, ny4 = y + i;
        if (inBoard(nx1, ny1) && board[nx1][ny1] == nowColor) {
            cnt1++;
        } else {
            cnt1 = 0;
        }
        if (inBoard(nx2, ny2) && board[nx2][ny2] == nowColor) {
            cnt2++;
        } else {
            cnt2 = 0;
        }
        if (inBoard(nx3, ny3) && board[nx3][ny3] == nowColor) {
            cnt3++;
        } else {
            cnt3 = 0;
        }
        if (inBoard(nx4, ny4) && board[nx4][ny4] == nowColor) {
            cnt4++;
        } else {
            cnt4 = 0;
        }
        if (cnt1 >= 5 || cnt2 >= 5 || cnt3 >= 5 || cnt4 >= 5) {
            return true;
        }
    }
    return false;
}

function init() {
    board = new Array();
    for (let i = 0; i < 15; i++) {
        board[i] = new Array(15);
        for (let j = 0; j < 15; j++) {
            board[i][j] = 0;
        }
    }
    players = new Set();
    playerColor = new Array();
    playerSockets = new Array();
    moveInd = 0;
}

let players = new Set();
let playerColor = new Array();
let clientSockets = new Array();
let playerSockets = new Array();
let clientIdIndex = new Map();
let clientIdNum = new Array();

const clientId = [
    "先辈", "奥尔加", "田所浩二", "蛤", "苟", "利", "国", "家", "生", "死", "以",
    "长门大明神", "团长", "泉此方", "阿虚", "射命丸·搞个大新·文", "博丽灵梦", "雾雨魔理沙", "恋💙恋",
    "Devil Man", "⑨", "路过的Otaku", "咕咕咕", "复读机", "杰哥"
]

server.on('connection', function connection(ws, req) {

    const ip = req.connection.remoteAddress;
    const port = req.connection.remotePort;
    const clientName = ip + ":" + port;
    console.log('%s is connected', clientName);

    ws.on('open', function open() {
        console.log('connected');
    });

    ws.on('close', function close() {
        console.log('disconnected');
        clientIdNum.splice(clientIdNum.indexOf(clientIdIndex[clientName]), 1);
        clientIdIndex.delete[clientName];
    });

    /*
        生成聊天id
    */
    clientSockets.push([ws, req]);
    console.log(clientId.length);
    let idMakeNum = Math.floor(Math.random() * clientId.length);
    while (clientIdNum.indexOf(idMakeNum) != -1) {
        idMakeNum = Math.floor(Math.random() * clientId.length);
    }
    clientIdNum.push(idMakeNum);
    clientIdIndex.set(clientName, idMakeNum);

    ws.on('message', function incoming(message) {
        switch (message[0]) {
            case 'S':
                if (players.size == 0) {
                    init();
                }
                if (!players.has(clientName) && players.size < 2) {
                    playerColor[clientName] = players.size + 1;
                    players.add(clientName);
                    playerSockets.push(ws);
                    if (players.size == 2) {
                        playerSockets[0].send('S1');
                        playerSockets[1].send('S2');
                    }
                }
                break;

            case 'M':
                if (!players.has(clientName)) {
                    break;
                }
                let x = position[message[1]], y = position[message[2]], nowColor = message[3];
                let status = move(x, y, nowColor);
                if (status == -1) {
                    break;
                } else {
                    server.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(message);
                        }
                    });
                    if (status == 1) {
                        server.clients.forEach(function each(client) {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send('R' + nowColor);
                            }
                        });
                        init();
                    } else if (status == 2) {
                        server.clients.forEach(function each(client) {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send('R3');
                            }
                        });
                        init();
                    }
                }
                break;

            case 'B':
                if (!players.has(clientName)) {
                    break;
                }
                server.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send('B' + String(playerColor[clientName] ^ 3));
                    }
                });
                init();
                break;

            case ':':
                clientSockets.forEach(value => {
                    let nowClientName = value[1].connection.remoteAddress + ":" + value[1].connection.remotePort;
                    console.log(nowClientName);
                    console.log(clientIdIndex);
                    if (nowClientName != clientName && value[0].readyState === WebSocket.OPEN) {
                        value[0].send(":" + clientId[clientIdIndex.get(clientName)] +
                            ":" + message.substring(1, message.size));
                    }
                });
                break;

            default:
                break;
        }

    });
});



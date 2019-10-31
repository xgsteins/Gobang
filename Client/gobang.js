class Gobang {
    constructor(options) {
            this.options = options
                // 获取棋盘
            this.chessboard = document.getElementById(options.canvas || 'chess')
                // 获取结果
            this.result = document.getElementById('result')
            this.connection = document.getElementById('connection')

            // 初始化
            this.init()
                // 棋盘元素
            this.lattice = {
                width: options.gobangStyle.padding,
                height: options.gobangStyle.padding
            }
        }
        // 初始化
    init() {
        const { options } = this
        // 角色 ，1黑色棋子 2白色棋子
        this.role = 0
            // 是否已经分出了胜负
        this.win = false

        this.started = false
        this.lastx = 0
        this.lasty = 0
            // 画出棋盘
        this.drawChessBoard()
            // 落子
        this.listenDownChessman()
            //  初始棋盘矩阵
        this.initChessboardMatrix()
    }

    // 画出棋盘
    drawChessBoard() {
            const { options } = this
            const context = this.chessboard.getContext('2d')
            const { count, padding, borderColor } = options.gobangStyle
            this.chessboard.width = this.chessboard.height = padding * count
            context.strokeStyle = borderColor
            context.lineWidth = 2

            for (var i = 0; i < count; i++) {
                context.moveTo(15 + i * padding, 15)
                context.lineTo(15 + i * padding, count * padding - 15)
                context.stroke()
                context.moveTo(15, 15 + i * padding)
                context.lineTo(count * padding - 15, 15 + i * padding)
                context.stroke()
            }
        }
        // 初始棋盘矩阵
    initChessboardMatrix() {
            const { options } = this
            const checkerboard = []
            for (let x = 0; x < options.gobangStyle.count; x++) {
                checkerboard[x] = []
                for (let y = 0; y < options.gobangStyle.count; y++) {
                    checkerboard[x][y] = 0
                }
            }
            this.checkerboard = checkerboard
        }
        // 判断下输赢
    checkReferee(role, r) {
            this.win = true
            let msg = ''
            if (r == 1)
                if (role == this.role)
                    msg = '对手认输，'
                else
                    msg = '你认输了，'
            if (role != 3)
                msg = msg + (role == 1 ? '黑' : '白') + '子胜利'
            else
                msg = '平局'
                // 提示信息
            this.result.innerText = msg
                // 不允许再操作
            this.chessboard.onclick = null
                // }

        }
        // 刻画棋子
    drawChessman(x, y, isBlack) {
        const context = this.chessboard.getContext('2d')
        context.beginPath()
        context.arc(15 + x * 30, 15 + y * 30, 13, 0, 2 * Math.PI) // 画圆
        context.closePath()
            //渐变
        var gradient = context.createRadialGradient(15 + x * 30 + 2, 15 + y * 30 - 2, 13, 15 + x * 30 + 2, 15 + y * 30 - 2, 0)
        if (isBlack) { // 黑子
            gradient.addColorStop(0, '#685454')
            gradient.addColorStop(1, '#636766')
        } else { // 白子
            gradient.addColorStop(0, '#ffc4c4')
            gradient.addColorStop(1, '#f9f9f9')
        }
        context.fillStyle = gradient
        context.fill()
    }
    drawLastChessman(x, y, isBlack) {
            const context = this.chessboard.getContext('2d')
            context.beginPath()
            context.arc(15 + x * 30, 15 + y * 30, 13, 0, 2 * Math.PI) // 画圆
            context.closePath()
                //渐变
            var gradient = context.createRadialGradient(15 + x * 30 + 2, 15 + y * 30 - 2, 13, 15 + x * 30 + 2, 15 + y * 30 - 2, 0)
            if (isBlack) { // 黑子
                gradient.addColorStop(0, '#0a0a0a')
                gradient.addColorStop(1, '#636766')
            } else { // 白子
                gradient.addColorStop(0, '#d1d1d1')
                gradient.addColorStop(1, '#f9f9f9')
            }
            context.fillStyle = gradient
            context.fill()
        }
        // 落子
    listenDownChessman() {
        this.chessboard.onclick = event => {
            if (gobangGame.role != 1 && gobangGame.role != 2) {
                console.log("game not started")
            } else {
                // 获取棋子的位置(x,y) => (0,1)
                let {
                    offsetX: x,
                    offsetY: y
                } = event
                x = Math.round((x - 15) / this.lattice.width)
                y = Math.round((y - 15) / this.lattice.height)
                Move(x, y)

            }
        }
    }
    gochessman(x, y, r) {
        // console.log('luo ' + x + ',' + y)
        // console.log("luozi",x , y)
        // 空的位置才可以落子
        if (this.checkerboard[x][y] !== undefined && Object.is(this.checkerboard[x][y], 0)) {
            // 落子后更新矩阵,切换角色，并且记录
            this.checkerboard[x][y] = r
                // 刻画棋子
            this.drawChessman(x, y, Object.is(r, 1))
            if (this.started)
                this.drawLastChessman(this.lastx, this.lasty, Object.is(r, 2))
            this.started = true
            this.lastx = x
            this.lasty = y
        }
    }
    fixchessboard(a, b, c, d, e, f, g, h) {
        const context = this.chessboard.getContext('2d')
        context.beginPath()
        context.lineWidth = 2
        context.moveTo(a, b)
        context.lineTo(c, d)
        context.moveTo(e, f)
        context.lineTo(g, h)
        context.stroke()
    }
}

let ifconnected = false
    // let ws = new WebSocket("ws://47.100.110.75:14560")
    // 实例化游戏
let gobangGame = new Gobang({
    canvas: 'chess', // 画布的id
    role: 0, // 角色 1黑色棋子 2白色棋子 ，这里是白色棋子先下
    gobangStyle: {
        // padding不允许改变哦
        padding: 30, // 边和边之间的距离 ,不可修改，这里没考虑到边距的问题
        count: 15, // 正方体的边数
        borderColor: '#111111' // 描边的颜色
    }
})

let beF = document.getElementById('befrance')
beF.onclick = () => {
    beFrance()
}

// 重新开始
let start = document.getElementById("start")
start.onclick = () => {
    Start()
}

let ws = new WebSocket("ws://47.100.110.75:8080")
ws.onopen = function() {
    //当WebSocket创建成功时，触发onopen事件
    // console.log("open")
    ifconnected = true
    ws.send("hello") //将消息发送到服务端
    gobangGame.connection.innerText = 'connected'
}
ws.onclose = function() {
    ifconnected = false
    gobangGame.connection.innerText = 'connection lost'
}
ws.onmessage = function(evt) {
        var received_msg = evt.data
        console.log(received_msg)
        if (received_msg[0] == 'S') {
            gobangGame.init()
            if (received_msg[1] == '1') {
                gobangGame.role = 1
                gobangGame.result.innerText = "你是黑子"
            } else {
                gobangGame.role = 2
                gobangGame.result.innerText = "你是白子"
            }
        } else if (received_msg[0] == 'M') {
            let x = 0,
                y = 0
            for (let i = 0; i < 20; i++) {
                if (received_msg[1] == xy[i])
                    x = i
                if (received_msg[2] == xy[i])
                    y = i
            }
            gobangGame.gochessman(x, y, received_msg[3] == '1' ? 1 : 2)
        } else if (received_msg[0] == 'R') {
            if (received_msg[1] == '1')
                gobangGame.checkReferee(1, 0)
            else if (received_msg[1] == '2')
                gobangGame.checkReferee(2, 0)
            else
                gobangGame.checkReferee(3, 0)
        } else if (received_msg[0] == 'B') {
            if (received_msg[1] == '1')
                gobangGame.checkReferee(1, 1)
            else
                gobangGame.checkReferee(2, 1)
        } else if (received_msg[0] == ':') {
            let str = '<div class="atalk"><span>' + received_msg.substr(1) + '</span></div>'
            Words.innerHTML = Words.innerHTML + str
            Words.scrollTop = Words.scrollHeight
        }
        // ........
    }
    /*
        client:
            commands:
                Start: Array[0] == S
                Move: Array[0] == M
                beFrance: Array[0] == 'B'
                message: Array[0] == ':'
            others:
            Move: Array[1] == x, Array[2] == y

        server:
            commands:
                Start: Array[0] == S
                Move: Array[0] == M
                beFrance: Array[0] == 'B'
                result: Array[0] == 'R'
                message: Array[0] == ':'
            others:
                Start:  Array[1] == {black == 'B' || white == 'W'}
                Move: Array[1] == x, Array[2] == y
                result: Array[1] == {win == 'W' || lose == 'L'}
                beFrance: Array[1] == {win == 'W' || lose == 'L'}
    */
function Start() {
    let msg = '已准备'
        // 提示信息
    gobangGame.result.innerText = msg
    ws.send("S2")
}
let xy = "0123456789ABCDEFGHIJKLMNOPQRST"

function Move(a, b) {
    // console.log(a, b)
    ws.send('move:' + String(a) + ',' + String(b))
        // console.log("gamerole == " + gobangGame.role)
    let msg = "M" + xy[a] + xy[b] + gobangGame.role
    ws.send(msg)
}

function Mes(s) {
    ws.send(':' + s)
}

function beFrance() {
    let msg = 'B'
        // console.log(msg)
    msg = msg + (gobangGame.role == 1 ? '2' : '1')
        // console.log(msg)
    ws.send(msg)
}


var Words = document.getElementById("words")
var Who = document.getElementById("who")
var TalkWords = document.getElementById("talkwords")
var TalkSub = document.getElementById("talksub")

function Enter(e) { //传入 event
    // var e = e || window.event
    if (e.keyCode == 13) { //13代表回车符
        //定义空字符串
        // console.log('enter')
        var str = ""
        if (TalkWords.value == "") {
            // 消息为空时弹窗
            alert("消息不能为空")
            return
        }
        str = '<div class="btalk"><span>' + TalkWords.value + '</span></div>'
        ws.send(':' + TalkWords.value)
        TalkWords.value = ''
        Words.innerHTML = Words.innerHTML + str
        Words.scrollTop = Words.scrollHeight
    }
}
window.onload = function() {
    TalkSub.onclick = function() {
        //定义空字符串
        var str = ""
        if (TalkWords.value == "") {
            // 消息为空时弹窗
            alert("消息不能为空")
            return
        }
        str = '<div class="btalk"><span>' + TalkWords.value + '</span></div>'
        ws.send(':' + TalkWords.value)
        TalkWords.value = ''
        Words.innerHTML = Words.innerHTML + str
        Words.scrollTop = Words.scrollHeight
    }

}
const WebSocket = require('ws');

const Server = new WebSocket.Server({port: 3030});

let clients = 0;

const broadcast = data => {
    Server.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(data));
        }
    });
};

Server.on('connection', socket => {
    let identity = "Anonymous (ID: " + clients++ + ")"

    broadcast({
        event: 'joined',
        content: identity + ' joined the chat.'
    })

    socket.on('message', data => {
        data = JSON.parse(data);

        let event = data.event;
        let content = data.content;

        switch(event){
            case 'set-identity':
                broadcast({
                    event: event,
                    content: identity + ' set his identity to \'' + content + '\''
                })
                identity = content;
            break;

            case 'reply':
                broadcast({
                    event: event,
                    content: '[' + new Date().toString() + '] ' + identity + ': ' + content
                })
            break;
        }
    });

    
});
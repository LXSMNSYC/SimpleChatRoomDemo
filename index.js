const WebSocket = require('ws');

const Server = new WebSocket.Server({port: 3030});

let clients = 0;

let messages = [];

const broadcast = data => {
    Server.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(data));
        }
    });
};

function messageIterator(){
    let index = 0;

    return () => {
        console.log(index);
        if(index < messages.length){
            return messages[index++];
        }
        return false;
    }
}


Server.on('connection', socket => {
    let identity = "Anonymous (ID: " + clients++ + ")"
    let iterator = messageIterator();

    broadcast({
        event: 'joined',
        content: identity + ' joined the chat.'
    })

    socket.on('message', data => {
        data = JSON.parse(data);

        let event = data.event;
        let content = data.content;

        let message;


        switch(event){
            case 'set-identity':
                message = identity + ' set his identity to \'' + content + '\'';
                broadcast({
                    event: event,
                    content: message
                })
                identity = content;

                messages.push(message);
            break;

            case 'reply':
                message = '[' + new Date().toString() + '] ' + identity + ': ' + content;
                broadcast({
                    event: event,
                    content: message
                })

                messages.push(message);
            break;

            case 'messages':
                message = iterator();

                if(message){
                    socket.send(JSON.stringify({
                        event: event,
                        content: message
                    }));
                } else {
                    socket.send(JSON.stringify({
                        event: 'message-load-done',
                        content: ''
                    }));
                }
            break;


        }
    });

    
});
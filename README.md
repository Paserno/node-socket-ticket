> __Elemento Anterior 👀:__ __[Socket Server Basico](https://github.com/Paserno/node-socket-server-basic)__
#
# Aplicación de Colas con Socket.io

Un servidor de Websockets usando Node, Express y Socket.io, pequeña aplicación de colas para el uso de __Socket__. Elementos utilizados:

* __[Socket Server Basico](https://github.com/Paserno/node-socket-server-basic)__ 


#
Para reconstruir los modulos de node ejecute el siguiente comando.

````
npm install
````

# 

### 1.- Inicio del Proyecto
Se reutilizo el Websocket anterior, ademas de elementos HTML y CSS extraida de 214[.](https://www.udemy.com/course/node-de-cero-a-experto/learn/lecture/24884186)

En `sockets/contoller.js`
* El controlador se simplifico.
````
const socketController = (socket) => {
    
    socket.on('enviar-mensaje', ( payload, callback ) => {
        const id = 123456789;
        callback( id );
        socket.broadcast.emit('enviar-mensaje', payload );
    })
}
````
Se agregaron los elementos que se descargaron a la 📂carpeta `public/`
#
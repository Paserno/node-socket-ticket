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
### 2.- Clase TicketControl 
En este punto se creará la logica de los ticket de que manerá funcionará. Para esto creamos lo siguiente:

* Creamos el archivo `models/ticket-control.js`.
* Creamos el archivo `db/data.json` para almacenar los datos del ticket

En `models/ticket-control.js`
* Importamos estos elementos de node.js para luego guardar los datos en el archivo `db/data.json`.
````
const path = require('path');
const fs   = require('fs');
````
* Creamos la clase `TicketControl` con su contrsuctor.
* Agregamos la propiedad `this.ultimo` que corresponde al ultimo ticket que se esta atendiendo, `this.hoy` que corresponde a la fecha de hoy, `this.tickets` que corresponde a todos los tickets y `this.ultimos4` que seran los ultimos 4 tickets que se muestran por pantalla.
````
class TicketControl {

    constructor() {
        this.ultimo   = 0;
        this.hoy      = new Date().getDate(); // 10
        this.tickets  = [];
        this.ultimos4 = [];

        this.init();
    }
    ...
}
````
* Creamos un metodo llamado `toJson()` para llamar esta intucción posteriormente y generar la data que se guardará
````
get toJson() {
        return {
            ultimo: this.ultimo,
            hoy: this.hoy,
            tickets: this.tickets,
            ultimos4: this.ultimos4,
        }
    }
````
* Creamos el metodo `init()` para tomar los datos que se encuentren en `db/data.json` y luego hacer una validación.
* En el caso que estemos en el mismo día el registro de `db/data.json` se guardará en las propiedades de la clase `TicketControl`, en el caso que no, solo se llamará al metodo `guardarDB()`.
````
init(){
        const {hoy ,tickets, ultimo, ultimos4} = require('../db/data.json');
        if( hoy === this.hoy){
            this.tickets  = tickets;
            this.ultimo   = ultimo;
            this.ultimos4 = ultimos4;
        }else{
            this.guardarDB();
        }
    }
````
* El metodo `guardarDB()` localiza el path de la `db/data.json` para luego sobrescribir en la data.
````
guardarDB(){

        const dbPath = path.join( __dirname, '../db/data.json' );
        fs.writeFileSync( dbPath, JSON.stringify( this.toJson ));
    }
````
#
### 3.- Clase Ticket - Siguiente y atender nuevo ticket
Creamos la clase de ticket, ademas de algunos metodos

En `models/ticket-control.js`
* Con la nueva clase `Ticket` con su constructor numero y escritorio, facilitando de que todo los ticket sean iguales.
````
class Ticket {
    constructor(numero, escritorio){
        this.numero = numero;
        this.escritorio= escritorio;
    }
}
````
* Creamos el metodo `siguiente()`.
* Le asignamos `this.ultimo` y le sumamos 1.
* Nueva instancia de la clase recien creada que pedirá el numero y escritorio.
* Almacenamos el nuevo ticket en el arreglo de `this.tickets`.
* Luego lo guardamos en `this.guardarDB()` y finalmente retonramos un String con el ticket.
````
siguiente(){
        this.ultimo += 1;
        const ticket = new Ticket( this.ultimo, null );
        this.tickets.push( ticket );

        this.guardarDB();
        return 'Ticket ' + ticket.numero;
    }
````
* En nuestro nuevo metodo `atenderTicket()` recibimos el `escritorio`, el cual atenderá el ticket.
* Realizamos una validación, en el caso que no haya tickets se enviará un `null`.
* Usando el `.shift()` cortamos el primer elemento y lo recibe nuestra constante `ticket`.
* Ahora podemos asignarle un escritorio el ultimo ticket que fue removido de `this.tickets`.
* Le asignamos a `this.ultimos4` el ticket extraido con `.unshift()`.
* Hacemos una validación, en el caso que existan mas de 4 ticket en `this.utilimos4` se removerá con `.splice(-1,1)`.
* Se guardar en `this.guardarDB()` y retornamos ticket.
````
atenderTicket( escritorio ){
        if (this.tickets.length === 0){
            return null;
        }

        const ticket = this.tickets.shift(); 
        ticket.escritorio = escritorio;
        
        this.ultimos4.unshift( ticket );

        if( this.ultimos4.length > 4){
            this.ultimos4.splice(-1,1)
        }

        this.guardarDB();
        return ticket;
    }
````
#
### 4.- Socket Frontend - Siguiente ticket
Se hará la pantalla de ticket nuevo, creando la conexiones a taves de los socket que se crearán
En `public/nuevo-ticket.html`
* Hacemos la referencia en el `HTML` de socket.io.
````
<script src="./socket.io/socket.io.js"></script>
<script src="./js/nuevo-ticket.js"></script>
````
En `public/js/nuevo-ticket.js`
* Realizamos la referencias a los elementos que tenmos, al spam  y al boton `Generar nuevo ticket`.
````
const lblNuevoTicket = document.querySelector('#lblNuevoTicket');
const btnCrear       = document.querySelector('button');
````
* Realizamos la conexión y desconexión de socket, cuando se tendra el boton activado y cuando no se desabilitará.
````
const socket = io();

socket.on('connect', () => {
    btnCrear.disabled = false;
});

socket.on('disconnect', () => {
    btnCrear.disabled = true;
});
````
* Se escuchará el socket `ultimo-ticket`, en el caso que se recargue la pagina mostrar por pantalla cual fue el ultimo ticket.
* Creamos el evento clic del boton, que emitirá el socket `siguiente-ticket` que en el payload enviará un `null` pero recibirá como respuesta el propio ticket y lo mostrará por el spam. 
````
socket.on('ultimo-ticket', (ultimo) => {
    lblNuevoTicket.innerText = 'Ticket ' + ultimo;
});

btnCrear.addEventListener( 'click', () => {

    socket.emit( 'siguiente-ticket', null, ( ticket ) => {
        lblNuevoTicket.innerText = ticket;
    });

});
````
En `sockets/controller.js`
* Emitiremos el ultimo ticket que se encuentra en la clase `ticketControl` en la propiedad `this.ultimo`.
````
socket.emit( 'ultimo-ticket', ticketControl.ultimo );
````
* Escucharemos el socket `siguiente-ticket` que es emitodo por el __Frontend__ y no haremos nada con el payload pero si con el callback.
* Tomamos el metodo `siguiente()` de la clase `ticketControl` para crear un nuevo ticket y enviarlo como respuesta al socket que lo emitio.
````
socket.on('siguiente-ticket', ( payload, callback ) => {
        
        const siguiente = ticketControl.siguiente();
        callback( siguiente );
    })
````
Creamos un nuevo archivo en la raiz del proyecto llamado `nodemon.json`
* Esto servirá para que cuando se emita el evento en el frontend y se cree un nuevo ticket no se "caiga" la aplicación con el uso de nodemon.
````
{
    "ignore": ["db/*.json"]
}
````
#
### 5.- Socket Frontend - Atender un Ticket
Primero se hará la referencia a los elementos html para luego crear los socket que se utilizarán
En `public/escritorio.html`
* Referencia a socket.io en el html.
````
<script src="./socket.io/socket.io.js"></script>
````
En `public/js/escritorio.js`
* Referencia a los elementos html que se utilizarán
````
const lblEscritorio = document.querySelector('h1');
const btnAtender    = document.querySelector('button');
const lblTicket     = document.querySelector('small');
const divAlerta     = document.querySelector('.alert');
````
* Se hará una lectura de los parametros del url, para esto creamos una constante que le asignamos `new URLSearchParams()` con `window.location.search`. _(Esto funciona en Chrome y Firefox)_
* Realizamos una validación si en los parametros de URL no viene `escritorio` que se devuelva al `index.html` con `window.location` y enviamos un error.
````
const searchParams = new URLSearchParams( window.location.search );

if( !searchParams.has('escritorio') ){
    window.location = 'index.html';
    throw new Error('El escritorio es obligatorio');
}
````
* Creamos una constante y le enviamos el escritorio.
* Se lo insertamos en el label.
* Ocultamos la alerta de que no existen ticket `divAlerta`.
````
const escritorio = searchParams.get('escritorio');
lblEscritorio.innerText = 'Escritorio '+ escritorio;

divAlerta.style.display = 'none'
````
* Realizamos la conexión y desconexión de socket.
* Cuando el socket este conectado el boton activado y cuando no se desabilitará.
````
const socket = io();

socket.on('connect', () => {
    btnCrear.disabled = false;
});

socket.on('disconnect', () => {
    btnCrear.disabled = true;
});
````
* Creamos el evento del boton clic.
* Emitimos un socket `atender-ticket`, le enviamos como un objeto el escritorio que lo atenderá, recibimos un callback, de un `ok` y `ticket` que se enviará del servidor.
* En el caso que se envie un `false` en el ok, entrará a la condición, que agregamos en el label `Nadie.` _(para que diga: "Atendiendo a Nadie.")_ y mostramos que "Ya no hay más tickets".
* En el caso que sea un __ok = `true`__, se mostará el ticket que se esta atendiendo en el label.
````
btnAtender.addEventListener( 'click', () => {

    socket.emit( 'atender-ticket', { escritorio }, ( {ok, ticket} ) => {
        if( !ok ){
            lblTicket.innerText = 'Nadie.'
            return divAlerta.style.display = '';
        }
        lblTicket.innerText = `Ticket ${ticket.numero}`
    });
});
````
En `sockets/controller.js`
* En el servidor, escuchamos el socket `atender-ticket` el cual recibimos el objeto `escritorio` y un __callback__.
* En el caso que no recibamos el `escritorio` se mandará un ok `false` y con un mensaje.
* Usamos el metodo `atenderTicket()` enviandole el escritorio, en el caso que no haya tickets pendientes, se enviará un ok `false` con su mensaje.
* En el caso que hayan ticket se enviará el ticket y un ok `true`.
````
socket.on('atender-ticket', ({ escritorio }, callback) => {
        
        if( !escritorio ){
            return callback({
                ok: false,
                msg: 'El Escritorio es obligatorio'
            });
        }

        const ticket = ticketControl.atenderTicket( escritorio );
        if( !ticket ){
            callback({
                ok:false,
                msg: 'Ya no hay tickets pendiente'
            });
        }else{
            callback({
                ok: true,
                ticket
            });
        }
});
````
#
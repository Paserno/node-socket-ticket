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
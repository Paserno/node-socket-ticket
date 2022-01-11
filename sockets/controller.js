const TicketControl = require("../models/ticket-control");

const ticketControl = new TicketControl()


const socketController = (socket) => {
    
    socket.emit( 'ultimo-ticket', ticketControl.ultimo );

    socket.on('siguiente-ticket', ( payload, callback ) => {
        
        const siguiente = ticketControl.siguiente();
        callback( siguiente );

        //TODO: notificar que hay un nuevo ticket pendeinte de asignar
    });

    socket.on('atender-ticket', ({ escritorio }, callback) => {
        
        if( !escritorio ){
            return callback({
                ok: false,
                msg: 'El Escritorio es obligatorio'
            });
        }

        const ticket = ticketControl.atenderTicket( escritorio );
        // TODO: Notificar Cambio en los ultimos4
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
}



module.exports = {
    socketController
}


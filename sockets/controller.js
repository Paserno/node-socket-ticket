const TicketControl = require("../models/ticket-control");

const ticketControl = new TicketControl()


const socketController = (socket) => {
    
    socket.emit( 'ultimo-ticket', ticketControl.ultimo );

    socket.on('siguiente-ticket', ( payload, callback ) => {
        
        const siguiente = ticketControl.siguiente();
        callback( siguiente );

        //TODO: notificar que hay un nuevo ticket pendeinte de asignar

    })

}



module.exports = {
    socketController
}


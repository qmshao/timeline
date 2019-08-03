var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

    start: function() {
        
        console.log("Starting node helper for: " + this.name);

        this.oAuth2Client;
        this.service;
    },

    socketNotificationReceived: function(notification, payload) {

        if (notification === "MODULE_READY") {
            console.log("module ready in " + this.name );
        } else if (notification === "REQUEST_UPDATE") {
            console.log("request update in " + this.name)
        } 
    },

});
Module.register("timeline", {
    // Default module config.
    defaults: {
        listID: "", // List ID (see authenticate.js)
        maxResults: 10,
        showCompleted: false, //set showCompleted and showHidden true
        ordering: "myorder", // Order by due date or by 'my order' NOT IMPLEMENTED
        dateFormat: "MMM Do", // Format to display dates (moment.js formats)
        updateInterval: 10000, // Time between content updates (millisconds)
        animationSpeed: 2000, // Speed of the update animation (milliseconds)
        tableClass: "small", // Name of the classes issued from main.css
		strlen: 24,
		zoom: 1.0,
		xoff: 0,
		yoff: 0,

        // Pointless for a mirror, not currently implemented
        /* 
		dueMax: "2040-07-11T18:30:00.000Z", // RFC 3339 timestamp 
		dueMin: "1970-07-11T18:30:00.000Z", // RFC 3339 timestamp 
		completedMax: "2040-07-11T18:30:00.000Z", //only if showCompleted true (RFC 3339 timestamp)
		completedMin: "1970-07-11T18:30:00.000Z", //only if showCompleted true (RFC 3339 timestamp)
		 */
    },

    // Define required scripts
    getScripts: function() {
        return ["moment.js"];
    },

    // Define required scripts.
    getStyles: function() {
        return ["font-awesome.css", "timeline.css"];
    },

    // Define start sequence
    start: function() {
        this.updateDom();
		this.days = 20;
		this.timelinedata = {};
    },

    notificationReceived: function(notification, payload, sender) {
        if (notification === "UPDATE_TIMELINE") {
			let data = this.processData(payload);
			if (!this.isEquivalent(data, this.timelinedata)){
				this.timelinedata = data;
				this.updateDom();
			}
        }
    },

    processData: function(raw) {
        let today = moment().startOf("day");
        let data = {};

        for (let item of raw) {
            if (item.parent || !item.due) continue;

            let idx = moment(item.due.slice(0, -1)).diff(today, "days");
            if (idx >= 0 && idx < this.days) {
                data[idx] = item.title;
            }
        }

        return data;
    },

    drawTimeline: function(data) {
		
		let today = moment();
        let Timeline = document.createElement("TABLE");
		Timeline.setAttribute("id", "TimelineTable");
		Timeline.style.zoom = this.config.zoom;
		Timeline.style.transform = `translateX(${this.config.xoff}%) translateY(${this.config.yoff}%) rotate(90deg)`;

        let cell, text, day, span;
        for (let i = this.days-1; i >=0 ; i--) {
			let date = today.clone().add(i, 'days').date();
			let hasData = data && i in data;

            let row = document.createElement("TR");

            day = document.createElement("TD");
            day.setAttribute("class", "day small");
            span = document.createElement("SPAN");
            span.setAttribute("class", "dot" + (i? (hasData?" event":""):" today"));
            text = document.createTextNode(`${date}`);

            day.appendChild(span);
            span.appendChild(text);
            row.appendChild(day);

            Timeline.appendChild(row);

			if (hasData){
				let tmpstr = data[i];
				tmpstr = tmpstr.length > this.config.strlen ? 
					tmpstr.substring(0, this.config.strlen - 3) + " .." : tmpstr;

				cell = document.createElement("TD");
				text = document.createTextNode(tmpstr);
				cell.appendChild(text);
				cell.setAttribute("class", "todo small bright");
				row.appendChild(cell);
			}
		}
		
        return Timeline;
    },
    getDom: function() {
        return this.drawTimeline(this.timelinedata);
	},
	
	isEquivalent: function(a, b) {
		// Create arrays of property names
		var aProps = Object.getOwnPropertyNames(a);
		var bProps = Object.getOwnPropertyNames(b);
	
		// If number of properties is different,
		// objects are not equivalent
		if (aProps.length != bProps.length) {
			return false;
		}
	
		for (var i = 0; i < aProps.length; i++) {
			var propName = aProps[i];
	
			// If values of same property are not equal,
			// objects are not equivalent
			if (a[propName] !== b[propName]) {
				return false;
			}
		}
	
		// If we made it this far, objects
		// are considered equivalent
		return true;
	}
});

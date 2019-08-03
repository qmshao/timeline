Module.register("MMM-GoogleTasks",{
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
		
		// Pointless for a mirror, not currently implemented
		/* 
		dueMax: "2040-07-11T18:30:00.000Z", // RFC 3339 timestamp 
		dueMin: "1970-07-11T18:30:00.000Z", // RFC 3339 timestamp 
		completedMax: "2040-07-11T18:30:00.000Z", //only if showCompleted true (RFC 3339 timestamp)
		completedMin: "1970-07-11T18:30:00.000Z", //only if showCompleted true (RFC 3339 timestamp)
		 */
	},
	
	// Define required scripts
	getScripts: function () {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function () {
		return ["font-awesome.css", "MMM-GoogleTasks.css"];
	},

	// Define start sequence
	start: function() {

		Log.info("Starting module: " + this.name);
		this.tasks;
		this.loaded = false;
		if(!this.config.listID) {
			Log.log("config listID required");
		} else {
			this.sendSocketNotification("MODULE_READY", {});
		}

		// API requies completed config settings if showCompleted
		if(!this.config.showCompleted) {
			// delete this.config.completedMin;
			// delete this.config.completedMax;
		} else {
			this.config.showHidden = true;
		}
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		if (notification === "SERVICE_READY") {
			
			self.sendSocketNotification("REQUEST_UPDATE", self.config);
			
			// Create repeating call to node_helper get list
			setInterval(function() {
				self.sendSocketNotification("REQUEST_UPDATE", self.config);
			}, self.config.updateInterval);

		// Check if payload id matches module id
		} else if (notification === "UPDATE_DATA" && payload.id === self.config.listID) {
			// Handle new data
			self.loaded = true;
			if (payload.items) {
				self.tasks = payload.items;
				self.updateDom(self.config.animationSpeed);
			} else {
				self.tasks = null;
				Log.info("No tasks found.")
				self.updateDom(self.config.animationSpeed)
			}
		} else if (notification === "UPDATE_TIMELINE") {
			if (payload) {
				self.sendNotification(notification, payload);
			} 
		}
	},

	getDom: function() {

		var wrapper = document.createElement('div');
		wrapper.className = "container ";
		wrapper.className += this.config.tableClass;

		var numTasks = 0;
		if(this.tasks) {
			var numTasks = Object.keys(this.tasks).length;
		}

		if (!this.tasks) {
			wrapper.innerHTML = (this.loaded) ? "EMPTY" : "LOADING";
			wrapper.className = this.config.tableClass + " dimmed";
			return wrapper;
		}

		let titles = this.tasks.filter(t => !t.parent);

		let tasklist = {};
		for (let i=numTasks-1; i>=0; i--){
			t = this.tasks[i];
			if (t.parent){
				t.order = tasklist[t.parent] + parseInt(t.position)+1;
			} else {
				t.order = parseInt(t.position)*100000000;
				tasklist[t.id] = t.order;
			}
		}
		this.tasks.sort((a,b) => a.order - b.order);


		if (this.config.ordering === "myorder") { 

			var titleWrapper, dateWrapper, noteWrapper;
			for (let item of this.tasks) {

				titleWrapper = document.createElement('div');
				titleWrapper.className = "item title";
				titleWrapper.innerHTML = "<i class=\"fa fa-circle-thin\" ></i>" + item.title;

				// If item is completed change icon to checkmark
				if (item.status === 'completed') {
					titleWrapper.innerHTML = "<i class=\"fa fa-check\" ></i>" + item.title;
				}

				if (item.parent) {
					titleWrapper.className = "item child";
				}

				if (item.notes) {
					noteWrapper = document.createElement('div');
					noteWrapper.className = "item notes light";
					noteWrapper.innerHTML = item.notes.replace(/\n/g , "<br>");
					titleWrapper.appendChild(noteWrapper);
				}

				dateWrapper = document.createElement('div');
				dateWrapper.className = "item date light";

				if (item.due) {
					var date = moment(item.due);
					dateWrapper.innerHTML = date.utc().format(this.config.dateFormat);
				}

				// Create borders between parent items
				if (!item.parent) {
					titleWrapper.style.borderTop = "1px solid #666";
					dateWrapper.style.borderTop = "1px solid #666";
				}

				wrapper.appendChild(titleWrapper);
				wrapper.appendChild(dateWrapper);
			}

			return wrapper;
		}
	}
});

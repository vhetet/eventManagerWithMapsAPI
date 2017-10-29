var namespace = {};

var db;

(function($){
	

	var openRequest = indexedDB.open("eventlist",2);
	openRequest.onupgradeneeded = function(e) {
		console.log("Upgrading DB...");
		var thisDB = e.target.result;
		if(thisDB.objectStoreNames.contains("eventliststore")) {
			thisDB.createObjectStore("eventliststore", { autoIncrement : true})
		}
	}

	openRequest.onsuccess = function(e) {
		console.log("Open success!");
		db = e.target.result;
		document.getElementById('add-btn').addEventListener('click', function() {
			var name = document.getElementById('name').value;
			var coordinates = document.getElementById('coordinates').value;
			var type = document.getElementById('type').value;
			var description = document.getElementById('description').value;
			var date = document.getElementById('date').value;
			var startTime = document.getElementById('startTime').value;
			var endTime = document.getElementById('endTime').value;

			var startDate = new Date(date + ' ' + startTime);
			var endDate = new Date(date +' ' + endTime);
			// if the endtime is before the start time a day is added to the end date
			if(endDate < startDate) { 
				endDate.setDate(endDate.getDate() + 1);
			}

			name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			type = type.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			description = description.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			if (name != '' && type != '' && description !='') {
				var event = new namespace.event(name, coordinates, type, description, new Date(), startDate, endDate);
				namespace.addEvent(event);
				$('#myModal').modal('hide');
				$.dreamAlert({
					'type'      :   'succes',
					'message'   :   'Event saved',
					'position'	:	'right' 
				});
				namespace.clearForm();
			} else {
				$.dreamAlert({
					'type'      :   'error',
					'message'   :   'Event not saved, some field need to be completed',
					'position'  :   'right'
				});
			}
		})

		document.getElementById('save-btn').addEventListener('click', function() {
			var name = document.getElementById('name').value;
			var coordinates = document.getElementById('coordinates').value;
			var type = document.getElementById('type').value;
			var description = document.getElementById('description').value;
			var date = document.getElementById('date').value;
			var startTime = document.getElementById('startTime').value;
			var endTime = document.getElementById('endTime').value;

			var startDate = new Date(date + ' ' + startTime);
			var endDate = new Date(date +' ' + endTime);
			// if the endtime is before the start time a day is added to the end date
			if(endDate < startDate) { 
				endDate.setDate(endDate.getDate() + 1);
			}

			name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			type = type.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			description = description.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			date = date.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			startTime = startTime.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			endTime = endtime.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			if (name != '' && type != '' && description !='' && date != '' && startTime != '' && endTime !='') {
				var event = new namespace.event(name, coordinates, type, description, new Date(), startDate, endDate);
				// namespace.editEvent(event,key);
				$('#myModal').modal('hide');
				$.dreamAlert({
					'type'      :   'succes',
					'message'   :   'Event saved',
					'position'	:	'right' 
				});
				namespace.clearForm();
			} else {
				$.dreamAlert({
					'type'      :   'error',
					'message'   :   'Event not saved, some field need to be completed',
					'position'  :   'right'
				});
			}
		})
		namespace.renderList();
	}

	openRequest.onerror = function(e) {
		console.log("Open error!");
		console.dir(e);
	}

	/*
	 * Not used anymore, with the new Time picket 
	 */
	namespace.getHours = function(time) {
		time = time.split(":"); // Split the String to Retrieve only the hour
		var hours = parseInt(time[0]); // necessary to convert it to a 24h format
		var buffer = time[1].split(" ");
		if(buffer[1] === 'PM')  // In order to create a new Date the 24h format is used 
			hours += 12;
		return hours;
	}


	/*
	 * Not used anymore, with the new Time picket 
	 */
	namespace.getMinutes = function(time) {
		time = time.split(":"); // Split the String to Retrieve only the minutes
		var minutes = time[1]; // still include the PM / AM
		minutes = minutes.split(' '); // retrieve only the minutes
		minutes = parseInt(minutes[0]);
		return minutes;
	}
})(jQuery);

namespace.addEvent = function(event) {
	var transaction = db.transaction(["eventliststore"],"readwrite");
	var store = transaction.objectStore("eventliststore");
	var request = store.add({event: event});
	request.onerror = function(e) {
		console.log("Error",e.target.error.name);
	}
	request.onsuccess = function(e) {
		namespace.clearForm();

	}
	namespace.renderList();
}

namespace.editEvent = function(event, key) {
	var transaction = db.transaction(["eventliststore"],"readwrite");
	var store = transaction.objectStore("eventliststore");
	var request = store.get(key);
	request.onerror = function(e) {
		console.log("Error",e.target.error.name);
	}
	request.onsuccess = function(e) {
		var data = request.result;
		data = event;
		var requestUpdate = store.put(data);
		requestUpdate.onerror = function (e) {
			console.log("Error",e.target.error.name);
		};
		requestUpdate.onsuccess = function(e) {
			console.log("Success",e.target.error.name);
		};

	};
}


namespace.event = function(name, coordinates, type, description, createDate, startDate, endDate) {
	this.name = name;
	this.coordinates = coordinates;
	this.type = type;
	this.description = description;
	this.createDate = createDate;
	this.startDate = startDate;
	this.endDate = endDate;
}


namespace.render = function(key) {
	$('#list-wrapper').empty();
	$('#list-wrapper').html('<table class="tableList"><tr><th>Key</th><th>Event Name</th><th>Type</th><th>Date</th></tr></table>');
	var transaction = db.transaction(["eventliststore"],"readwrite");
	var store = transaction.objectStore("eventliststore");
	var obj = store.get(key);
	var countRequest = store.count();

	obj.onsuccess = function (ev) {
		var res = ev.target.result
		console.log(res.event.name);
	}
}

namespace.renderList = function() {
	$('#list-wrapper').empty();
	$('#list-wrapper').html('<table class="tableList"><tr><th>Key</th><th>Event Name</th><th>Type</th><th>Date</th></tr></table>');
	var transaction = db.transaction(["eventliststore"],"readwrite");
	var store = transaction.objectStore("eventliststore");
	store.openCursor().onsuccess = function(event) {
		var cursor = event.target.result;
		$( '.tableList' ).show();
		if(cursor) {
			var event = cursor.value.event;
			var $link = $('<a href="#" data-key="' + cursor.key + '">' + event.name + '</a>');
			var k = parseInt($(this).attr('data-key'));
			console.log("marker listener key " + k);
			console.log("marker listener key " + parseInt($(this).attr('data-key')));
			$link.click(function(){
				namespace.loadTextByKey(parseInt($(this).attr('data-key')));
			});
			var $row = $('<tr class="list">');
			var $keyCell = $('<td>' + cursor.key + '</td>');
			var $textCell1 = $('<td></td>').append($link);
			var $textCell2 = $('<td></td>').append($('<p>' + event.type + '</p>'));
			var $textCell3 = $('<td></td>').append($('<p>' + event.createDate.toLocaleString('en-US') + '</p>'));
			$row.append($keyCell);
			$row.append($textCell1);
			$row.append($textCell2);
			$row.append($textCell3);
			$('#list-wrapper table').append($row);

			var coordinates = event.coordinates;
			coordinates = coordinates.replace('(', '');
			coordinates = coordinates.replace(')', '');
			coordinates = coordinates.replace(' ', '');
			coordinates = coordinates.split(',')
			var marker = placeMarker(map, {lat: parseFloat(coordinates[0]), lng: parseFloat(coordinates[1])}, event.name, 'blue');
			marker.addListener('click', function() {
				console.log("marker listener key " + k);
				namespace.showDetail(event, k);
			});
			markers.push(marker);
			cursor.continue();
		} else {

		}
		namespace.hideList();
		namespace.hideDetail();

	}
}

namespace.loadTextByKey = function(key){
		console.log("loadtextbykey key " + key);
	var transaction = db.transaction(['eventliststore'], 'readonly');
	var store = transaction.objectStore('eventliststore');
	var request = store.get(key);


	request.onerror = function(event) {
	  // Handle errors!
	};
	request.onsuccess = function(event) {
		console.log(event);
		var myEvent = event.target.result.event;
		namespace.showDetail(myEvent, key);
	};
	namespace.hideDetail();
}

namespace.deleteWord = function(key) {
	var transaction = db.transaction(['eventliststore'], 'readwrite');
	var store = transaction.objectStore('eventliststore');
	var request = store.delete(key);
	request.onsuccess = function(evt){
		namespace.renderList();
		$('#detail').empty();

	};
}

namespace.showDetail = function(event, key) {
	$( '#right' ).show();
	$('#detail').html('<tr><td><p>Title</p></td>' + '<td><p>' + event.name + '</p></td></tr>' + 
		'<tr><td><p>Coordinates</p></td>' + '<td><p>' + event.coordinates + '</p></td></tr>' + 
		'<tr><td><p>Type</p></td>' + '<td><p>' + event.type + '</p></td></tr>' + 
		'<tr><td><p>Description</p></td>' + '<td><p>' + event.description + '</p></td></tr>' + 
		'<tr><td><p>Creation date</p></td>' + '<td><p>' + event.createDate.toLocaleString('en-US') + '</p></td></tr>' +
		'<tr><td><p>Start date</p></td>' + '<td><p>' + event.startDate.toLocaleString('en-US') + '</p></td></tr>' +
		'<tr><td><p>End date</p></td>' + '<td><p>' + event.endDate.toLocaleString('en-US') + '</p></td></tr>');
	var $delBtn = $('<button class="btn btn-default">Delete me</button>');
	$delBtn.click(function(){
		console.log('Delete ' + key);
		namespace.deleteWord(key);
	});
	var $editBtn = $('<button class="btn btn-default">Edit</button>');
	$editBtn.click(function(){
		namespace.clearForm();
		console.log("show details key " + key);
		namespace.editModal(event, key);
	});
	var $cancelBtn = $('<button class="btn btn-default">Cancel</button>');
	$cancelBtn.click(function(){
		namespace.hideDetail();
	});
	$('#detail').append($delBtn);
	$('#detail').append(' ');
	$('#detail').append($editBtn);
	$('#detail').append(' ');
	$('#detail').append($cancelBtn);
}

namespace.hideDetail = function() {
	if ( $('.detail').text().length == 0 ) {
		$( '#right' ).hide();
	};
}

namespace.hideList = function() {
	if ( $('.list').length == 0) {
		$( '.tableList' ).hide();
		document.getElementById('list-wrapper').innerHTML="<p>There is no event right now, do you want to create one?</p>";
	};
}

namespace.clearForm = function() {

	$('#name').val('');
	$('#type').val('');
	$('#description').val('');
	$('#date').val('');
	$('#startTime').val('');
	$('#endTime').val('');
};

namespace.showModal = function() {
	$('#add-btn').show();
	$('#save-btn').hide();
	$('#myModal').modal('show');
}

namespace.editModal = function(event, key) {
	$('#name').val(event.name);
	$('#type').val(event.type);
	$('#description').val(event.description);
	$('#date').hide();
	$('#startTime').val('');
	$('#endTime').val('');
	$('#add-btn').hide();
	$('#save-btn').show();
	console.log("edit modal key " + key);
	$('#key').val(key);
	$('#myModal').modal('show');
}

namespace.hideModal = function() {
	$('#myModal').modal('hide');
}


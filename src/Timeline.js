/*
 * Timeline
 */

var Timeline = (function () {
	var self;

	var constructor = function (options) {
		var defaults, elem;

		self = this;

		defaults = {
			container: document.getElementsByTagName("body")[0],
			backgroundColor: undefined,
			position: "bottom"
		};

		options = $.extend(defaults, options);

		elem = $("<div class='timeline'></div>").appendTo(options.container);
		elem.css({ backgroundColor: options.backgroundColor });

		points = [];

		self.elem = elem;
		self.points = points;
	};

	constructor.prototype = {
		version: "0.1",
		addPoint: addPoint,
		hide: hide,
		show: show
	};

	// addPoint
	// @param points `Point` object
	function addPoint (point) {

		if (point instanceof Point === false) {
			throw new Error("Adding a point requires a Point object.");
		}



		$("<div class='timeline-point'></div>").appendTo(self.elem);
		self.points.push(point);


	}




	function hide () {
		self.elem.hide();
	}


	function show () {
		self.elem.show();
	}

	return constructor;
}());


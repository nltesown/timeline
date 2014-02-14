// Timeline
// Dependencies: moment.js, underscore.js

var Timeline = (function () {
	"use strict";
	var self;
	var lastPointId = 0;
	var lowerPointDate;
	var upperPointDate;
	var timelineDateSpan = 0; // Days between upper- and lowerPointDate

	var constructor = function (options) {
		var defaults
		var elem;
		var points = [];

		self = this;

		defaults = {
			container: document.getElementsByTagName("body")[0],
			backgroundColor: undefined,
			position: "bottom"
		};

		options = $.extend(defaults, options);

		elem = $("<div class='timeline'></div>").appendTo(options.container);
		elem.css({ backgroundColor: options.backgroundColor });

		// Exported instance properties
		self.elem = elem;
		self.points = points;
	};


	constructor.prototype = {
		version: "0.1",
		addPoint: addPoint,
		hide: hide,
		show: show
	};


	/**
	 * Adds a point to the timeline
	 * A point must follow the Point object specification (use the Point constructor function)
	 * @method addPoint
	 * @param point
	 */
	function addPoint (point) {

		var pointMoment, lowerPointMoment, upperPointMoment;

		try {
			if (typeof point !== "object") {
				throw new Error("Point must be an object");
			}
		} catch(e) {
			console.log(e.message);
			return;
		}

		// Adds some Timeline-specific properties to the Point object
		point.elem = $("<div class='timeline-point'></div>").appendTo(self.elem);
		point.id = ++lastPointId;

		// Update lowerPointDate, upperPointDate, timelineDateSpan
		pointMoment = moment(point.date); // Convert to moment objects for comparison
		lowerPointMoment = (lowerPointDate ? moment(lowerPointDate) : undefined);
		upperPointMoment = (upperPointDate ? moment(upperPointDate) : undefined);

		if (!lowerPointMoment || lowerPointMoment > pointMoment) {
			lowerPointMoment = pointMoment;
			lowerPointDate = point.date;
		}

		if (!upperPointMoment || upperPointMoment < pointMoment) {
			upperPointMoment = pointMoment;
			upperPointDate = point.date;
		}

		timelineDateSpan = upperPointMoment.diff(lowerPointMoment, "days");

		console.log(timelineDateSpan);

		self.points.push(point);
	}


	/**
	 * Hides the timeline
	 */
	function hide () {
		self.elem.hide();
	}


	/**
	 * Shows the timeline
	 */
	function show () {
		self.elem.show();
	}


	return constructor;
}());


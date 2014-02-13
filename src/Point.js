/*
 * Point
 */

var Point = (function () {
	var self;

	var constructor = function (dateTime, options) {
		self = this;

		if (typeof dateTime === "undefined" || !dateTime._isAMomentObject) {
			throw new Error("dateTime must be a moment.js object");
		}

		self.dateTime = moment().unix(dateTime);




	};

	constructor.prototype = {
	};

	// Add methods here

	return constructor;
}());
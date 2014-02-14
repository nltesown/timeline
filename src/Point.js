// Point
// This constructor function takes an object and returns an object that enforces the Point object specification
// Dependencies: moment.js

var Point = function (opts) {
	"use strict";
	var defaults = {
		color: "blue",
		title: "Untitled"
	};

	opts = $.extend(defaults, opts);

	opts.date = moment(opts.date).format("YYYY-MM-DD");

	try {
		if (opts.date === "Invalid date") {
			throw new Error("Invalid date");
		}
	} catch(e) {
		console.log(e.message);
		return;
	}

	return {
		color: opts.color,
		date: opts.date,
		title: opts.title
	};
};
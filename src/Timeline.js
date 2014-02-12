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
		elem.css({ backgroundColor: options.backgroundColor});

		self.elem = elem;
	};

	constructor.prototype = {
		version: "0.1",
		hide: hide,
		show: show
	};

	return constructor;

	function hide () {
		self.elem.hide();
	}

	function show () {
		self.elem.show();
	}

}());


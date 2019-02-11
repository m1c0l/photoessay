/*jshint esversion: 6 */
(function() {
	// Rolled my own code to resize the image container if a photo of default
	// aspect ratio won't fully show within the browser's viewport.
	if (typeof(defaultAspectRatio) !== "undefined") {
		// Adapted from https://github.com/ryanve/verge
		let viewportHeight = () => {
			let a = document.documentElement.clientHeight;
			let b = window.innerHeight;
			return a < b ? a : b;
		};
		// Adapted from https://github.com/ryanve/verge
		let viewportWidth = () => {
			let a = document.documentElement.clientWidth;
			let b = window.innerWidth;
			return a < b ? a : b;
		};

		let resizeToAspectRatio = () => {
			let imgContainerDefaultWidthPercent = 0.9;
			let vwWidth = viewportWidth();
			let vwHeight = viewportHeight();
			let viewportRatio = vwWidth / vwHeight;
			if (viewportRatio * imgContainerDefaultWidthPercent >
				defaultAspectRatio) {
				let newWidth = vwHeight * defaultAspectRatio;
				document.getElementById("imgSequence").style.width =
					String(newWidth) + "px";
			}
			else {
				document.getElementById("imgSequence").style.width = "90%";
			}
		};
		resizeToAspectRatio();
		window.onresize = resizeToAspectRatio;
	}

	// initialize Blazy, load images when user scrolls to 1000px above them
	let bLazy = new Blazy({
		offset: 1000
	});
})();

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

	let areCaptionsHidden = false;
	document.getElementById("hide-show-captions").onclick = function() {
		areCaptionsHidden = !areCaptionsHidden;
		if (areCaptionsHidden) {
			this.innerText = "Show captions";
		}
		else {
			this.innerText = "Hide captions";
		}
		for (let elem of document.getElementsByClassName("imgCaption")) {
			if (areCaptionsHidden) {
				elem.classList.add("hidden");
				elem.classList.remove("visible");
			}
			else {
				elem.classList.add("visible");
				elem.classList.remove("hidden");
			}
		}
	};

	// https://stackoverflow.com/a/48942924
	const scrollToTop = () => {
		const c = document.documentElement.scrollTop || document.body.scrollTop;
		if (c > 0) {
			window.requestAnimationFrame(scrollToTop);
			window.scrollTo(0, c - c / 8);
		}
	};
	document.getElementById("back-to-top").onclick = scrollToTop;

	// initialize Blazy, load images when user scrolls to 1000px above them
	Blazy({
		offset: 1000
	});
})();

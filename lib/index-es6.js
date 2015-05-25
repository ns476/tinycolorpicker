import React, { Component } from "react";

function extend() {
        for(var i=1; i < arguments.length; i++) {
            for(var key in arguments[i]) {
                if(arguments[i].hasOwnProperty(key)) {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
        return arguments[0];
}

var defaults = {
	backgroundUrl : null
};

class Plugin {
	constructor($container, options) {
		this.$container = container;
		this.options = extend({}, defaults, options);
		this._defaults = defaults;

        this.$track = $container.querySelectorAll(".track")[0];
        this.$color = $container.querySelectorAll(".color")[0];
        this.$colorInner = $container.querySelectorAll(".colorInner")[0];
        this.$canvas = null;
        this.$colorInput = $container.querySelectorAll(".colorInput")[0];

        this.context = null;
        this.mouseIsDown = false;
        this.hasCanvas = !!document.createElement("canvas").getContext;
        this.touchEvents = "ontouchstart" in document.documentElement;
        this.changeEvent = document.createEvent("HTMLEvents");

        this.changeEvent.initEvent("change", true, true);

        this.colorHex = "";
        this.colorRGB = "";
	}


    /**
     * @method _initialize
     * @private
     */
    _initialize() {
        if(hasCanvas) {
            this.$canvas = document.createElement("canvas");
            $track.appendChild(this.$canvas);

            this.context = this.$canvas.getContext("2d");

            this._setImage();
        }

        this._setEvents();

        return this;
    }

    /**
     * @method _setImage
     * @private
     */
     _setImage() {
     	const self = this;
        const colorPicker = new Image();
        const style = this.$track.currentStyle || window.getComputedStyle(this.$track, false)
        const backgroundUrl = style.backgroundImage.replace(/"/g, "").replace(/url\(|\)$/ig, "");
        

        this.$track.style.backgroundImage = "none";

        colorPicker.onload = function() {
            self.$canvas.width = this.width;
            self.$canvas.height = this.height;

            self.context.drawImage(colorPicker, 0, 0, this.width, this.height);
        };

        colorPicker.src = this.options.backgroundUrl || backgroundUrl;
    }

    /**
     * @method _setEvents
     * @private
     */
    _setEvents() {
        var eventType = touchEvents ? "touchstart" : "mousedown";

        if(this.hasCanvas) {
            this.$color["on" + eventType] = (event) => {
                event.preventDefault();
                event.stopPropagation();

                this.$track.style.display = 'block';

                document.onmousedown = (event) => {
                    document.onmousedown = null;

                    this.$track.style.display = 'none';
                };
            };

            if(!touchEvents) {
                this.$canvas.onmousedown = (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    this.mouseIsDown = true;

                    this._getColorCanvas(event);

                    document.onmouseup = (event) => {
                        this.mouseIsDown = false;

                        document.onmouseup = null;

                        this.$track.style.display = 'none';

                        return false;
                    };
                };

                this.$canvas.onmousemove = this._getColorCanvas;
            }
            else {
                $canvas.ontouchstart = (event) => {
                    this.mouseIsDown = true;

                    this._getColorCanvas(event.originalEvent.touches[0]);

                    return false;
                };

                this.$canvas.ontouchmove = (event) => {
                    this._getColorCanvas(event.originalEvent.touches[0]);

                    return false;
                };

                this.$canvas.ontouchend = (event) => {
                    this.mouseIsDown = false;

                    this.$track.style.display = 'none';

                    return false;
                };
            }
        }
    }

    /**
     * @method _getColorCanvas
     * @private
     */
    _getColorCanvas(event) {
        if(this.mouseIsDown) {
            const offset    = event.target.getBoundingClientRect();
            const colorData = this.context.getImageData(event.clientX - offset.left, event.clientY - offset.top, 1, 1).data;
            

            this.setColor("rgb(" + colorData[0] + "," + colorData[1] + "," + colorData[2] + ")");

            this.$container.dispatchEvent(changeEvent, [self.colorHex, self.colorRGB]);
        }
    }

    /**
     * Set the color to a given hex or rgb color.
     *
     * @method setColor
     * @chainable
     */
    setColor(color) {
        if(color.indexOf("#") >= 0) {
            this.colorHex = color;
            this.colorRGB = this.hexToRgb(self.colorHex);
        }
        else {
            this.colorRGB = color;
            this.colorHex = this.rgbToHex(self.colorRGB);
        }

        this.$colorInner.style.backgroundColor = this.colorHex;
        this.$colorInput.value = this.colorHex;
    }

    /**
     * Cobert hex to rgb
     *
     * @method hexToRgb
     * @chainable
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        return "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")";
    }

    /**
     * Cobert rgb to hex
     *
     * @method rgbToHex
     * @chainable
     */
    function rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);

        function hex(x) {
            var digits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
            return isNaN(x) ? "00" : digits[(x - x % 16 ) / 16] + digits[x % 16];
        }

        return "#" + hex(result[0]) + hex(result[1]) + hex(result[2]);
    }

   return _initialize();
}

function tinycolorpicker($container, options) {
    return new Plugin($container, options);
}

class TinyColorpicker extends Component {
	componentDidMount() {
		const $picker = React.findDOMNode(this);
		const picker  = tinycolorpicker($picker)
	}

	render() {
		return (
			<div>
		        <a className="color"><div className="colorInner"></div></a>
		        <div className="track"></div>
		        <ul className="dropdown"><li></li></ul>
		        <input type="hidden" className="colorInput"/>
		    </div>
		);
	}
}

export default TinyColorpicker;
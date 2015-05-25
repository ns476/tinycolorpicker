"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _React$Component = require("react");

var _React$Component2 = _interopRequireWildcard(_React$Component);

function extend() {
    for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                arguments[0][key] = arguments[i][key];
            }
        }
    }
    return arguments[0];
}

var defaults = {
    backgroundUrl: null
};

var Plugin = (function () {
    function Plugin($container, initialColor, handleColorChange) {
        _classCallCheck(this, Plugin);

        this.$container = $container;
        this.handleColorChange = handleColorChange;
        this.initialColor = initialColor;
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

        this._initialize();
    }

    _createClass(Plugin, [{
        key: "_initialize",

        /**
         * @method _initialize
         * @private
         */
        value: function _initialize() {
            if (this.hasCanvas) {
                this.$canvas = document.createElement("canvas");
                this.$track.appendChild(this.$canvas);

                this.context = this.$canvas.getContext("2d");

                this._setImage();
            }

            this._setEvents();
            this.setColor(this.initialColor);

            return this;
        }
    }, {
        key: "_setImage",

        /**
         * @method _setImage
         * @private
         */
        value: function _setImage() {
            var self = this;
            var colorPicker = new Image();
            var style = this.$track.currentStyle || window.getComputedStyle(this.$track, false);
            var backgroundUrl = style.backgroundImage.replace(/"/g, "").replace(/url\(|\)$/ig, "");

            this.$track.style.backgroundImage = "none";

            colorPicker.onload = function () {
                self.$canvas.width = this.width;
                self.$canvas.height = this.height;

                self.context.drawImage(colorPicker, 0, 0, this.width, this.height);
            };

            colorPicker.src = backgroundUrl;
        }
    }, {
        key: "_setEvents",

        /**
         * @method _setEvents
         * @private
         */
        value: function _setEvents() {
            var _this = this;

            var eventType = this.touchEvents ? "touchstart" : "mousedown";

            if (this.hasCanvas) {
                this.$color["on" + eventType] = function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    _this.$track.style.display = "block";

                    document.onmousedown = function (event) {
                        document.onmousedown = null;

                        _this.$track.style.display = "none";
                    };
                };

                if (!this.touchEvents) {
                    this.$canvas.onmousedown = function (event) {
                        event.preventDefault();
                        event.stopPropagation();

                        _this.mouseIsDown = true;

                        _this._getColorCanvas(event);

                        document.onmouseup = function (event) {
                            _this.mouseIsDown = false;

                            document.onmouseup = null;

                            _this.$track.style.display = "none";

                            return false;
                        };
                    };

                    this.$canvas.onmousemove = this._getColorCanvas;
                } else {
                    this.$canvas.ontouchstart = function (event) {
                        _this.mouseIsDown = true;

                        _this._getColorCanvas(event.originalEvent.touches[0]);

                        return false;
                    };

                    this.$canvas.ontouchmove = function (event) {
                        _this._getColorCanvas(event.originalEvent.touches[0]);

                        return false;
                    };

                    this.$canvas.ontouchend = function (event) {
                        _this.mouseIsDown = false;

                        _this.$track.style.display = "none";

                        return false;
                    };
                }
            }
        }
    }, {
        key: "_getColorCanvas",

        /**
         * @method _getColorCanvas
         * @private
         */
        value: function _getColorCanvas(event) {
            if (this.mouseIsDown) {
                var offset = event.target.getBoundingClientRect();
                var colorData = this.context.getImageData(event.clientX - offset.left, event.clientY - offset.top, 1, 1).data;

                this.setColor("rgb(" + colorData[0] + "," + colorData[1] + "," + colorData[2] + ")");

                this.$container.dispatchEvent(this.changeEvent, [this.colorHex, this.colorRGB]);
                this.handleColorChange(this.colorHex, this.colorRGB);
            }
        }
    }, {
        key: "setColor",

        /**
         * Set the color to a given hex or rgb color.
         *
         * @method setColor
         * @chainable
         */
        value: function setColor(color) {
            if (color.indexOf("#") >= 0) {
                this.colorHex = color;
                this.colorRGB = this.hexToRgb(this.colorHex);
            } else {
                this.colorRGB = color;
                this.colorHex = this.rgbToHex(this.colorRGB);
            }

            this.$colorInner.style.backgroundColor = this.colorHex;
            this.$colorInput.value = this.colorHex;
        }
    }, {
        key: "hexToRgb",

        /**
         * Cobert hex to rgb
         *
         * @method hexToRgb
         * @chainable
         */
        value: function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

            return "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")";
        }
    }, {
        key: "rgbToHex",

        /**
         * Cobert rgb to hex
         *
         * @method rgbToHex
         * @chainable
         */
        value: function rgbToHex(rgb) {
            var result = rgb.match(/\d+/g);

            function hex(x) {
                var digits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
                return isNaN(x) ? "00" : digits[(x - x % 16) / 16] + digits[x % 16];
            }

            return "#" + hex(result[0]) + hex(result[1]) + hex(result[2]);
        }
    }]);

    return Plugin;
})();

function tinycolorpicker($container, handleChangeColor) {
    var color = arguments[2] === undefined ? "#EFEFEF" : arguments[2];

    return new Plugin($container, color, handleChangeColor);
}

var TinyColorpicker = (function (_Component) {
    function TinyColorpicker() {
        _classCallCheck(this, TinyColorpicker);

        if (_Component != null) {
            _Component.apply(this, arguments);
        }
    }

    _inherits(TinyColorpicker, _Component);

    _createClass(TinyColorpicker, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var $picker = _React$Component2["default"].findDOMNode(this);
            var picker = tinycolorpicker($picker, this.props.handleColorChange, this.props.color);
        }
    }, {
        key: "render",
        value: function render() {
            return _React$Component2["default"].createElement(
                "div",
                { className: "tinycolorpicker" },
                _React$Component2["default"].createElement(
                    "a",
                    { className: "color" },
                    _React$Component2["default"].createElement("div", { className: "colorInner" })
                ),
                _React$Component2["default"].createElement("div", { className: "track" }),
                _React$Component2["default"].createElement(
                    "ul",
                    { className: "dropdown" },
                    _React$Component2["default"].createElement("li", null)
                ),
                _React$Component2["default"].createElement("input", { type: "hidden", className: "colorInput" })
            );
        }
    }]);

    return TinyColorpicker;
})(_React$Component.Component);

exports["default"] = TinyColorpicker;
module.exports = exports["default"];

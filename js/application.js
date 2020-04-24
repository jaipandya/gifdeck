if (!Application) {
    Application = {};
}

Application.Main = (function() {
    function _Class() {
        this.proxy = new Application.Proxy({
            url: 'https://image.slidesharecdn.com/proxy/proxy.html?xYu10uB',
            application: this
        });
        this.reset();
    }

    _Class.prototype.reset = function() {
        this.number_of_images_loaded = 0;
    }

    _Class.prototype.load_images = function(images, gifdeck, callback) {
        this.reset();
        var image, _i, _len, _ref, _results;
        this.images = images;
        this.wrapper = document.createElement('div')
        this.slides = [];
        this.gifdeck = gifdeck;
        _ref = this.images;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            image = _ref[_i];
            this.load_image(image.getAttribute('data-path'));
        }
        this.load_images_callback = callback;
    };

    _Class.prototype.load_image = function(path) {
        return this.proxy.send({
            action: 'load',
            path: path
        });
    };

    _Class.prototype.from_proxy = function(message) {
        switch (message.action) {
            case 'loaded':
                return this.image_bits_loaded(message.path, message.bits);
        }
    };

    _Class.prototype.image_bits_loaded = function(path, bits) {
        var image, index, _i, _len, _ref, _results;
        _ref = this.images;
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            image = _ref[index];
            if (image.getAttribute('data-path') === path) {
                image.onload = ((function(_this) {
                    return function(img, i) {
                        return function() {
                            return _this.image_loaded(img, i);
                        };
                    };
                })(this))(image, index);
                image.src = bits;
            }
        }
    };

    _Class.prototype.image_loaded = function(image, index) {
        var self = this;
        var canvas = document.createElement('canvas');
        self.slides[index] = {
            image: image,
            canvas: canvas
        };
        image.setAttribute('width',self.gifdeck.maxWidth);
        self.number_of_images_loaded = self.number_of_images_loaded + 1;
        console.log('image ' + index + ' loaded');
        self.gifdeck.progress = Math.ceil(self.number_of_images_loaded * 50 / self.images.length)
        self.gifdeck.show_progress('fetching slides');

        if (self.images.length === self.number_of_images_loaded) {
            // Resize all images, callback
            self.resize_canvas(self.slides, this.load_images_callback)
        }

    };

    _Class.prototype.resize_canvas = function(image_canvas_map_array, callback) {
        self = this;
        var caman_callback = function(i){
            return function() {
                this.resize({
                  width: self.gifdeck.maxWidth
                });
                this.brightness(5).render();
                if (i === image_canvas_map_array.length - 1) {
                    callback(self.wrapper.childNodes);
                }
            }
        }
        for (var i = 0; i < image_canvas_map_array.length; i++) {
          this.wrapper.appendChild(image_canvas_map_array[i].canvas)
          Caman(image_canvas_map_array[i].canvas, image_canvas_map_array[i].image.src, caman_callback.call(this, i))

        }

    };

    return _Class;

})();

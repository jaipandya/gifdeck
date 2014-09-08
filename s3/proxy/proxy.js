var Proxy;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Proxy = {
  Proxy: (function() {
    function _Class(args) {
      this.send = __bind(this.send, this);
      this.message_received = __bind(this.message_received, this);      
      this.end_point = args.end_point;
      this.expected_domain = args.from;
      this.worker = new args.worker_class(this);
      window.addEventListener('message', this.message_received, false);
      this.send({
        action: 'init'
      });
    }
    _Class.prototype.message_received = function(event) {
      if (event.origin !== this.expected_domain) {
        return;
      }
      return this.worker.execute(JSON.parse(event.data));
    };
    _Class.prototype.send = function(message) {
      return this.end_point.postMessage(JSON.stringify(message), this.expected_domain);
    };
    return _Class;
  })(),
  ImageLoader: (function() {
    function _Class(proxy) {
      this.loaded = __bind(this.loaded, this);
      this.proxy = proxy;
    }
    _Class.prototype.execute = function(message) {
      switch (message.action) {
        case 'load':
          return this.load_image(message.path);
      }
    };
    _Class.prototype.load_image = function(path) {
      var image;
      image = document.createElement('img');
      image.setAttribute('data-path', path);
      image.onload = image.onerror = image.onabort = this.loaded;
      image.src = path;
      return document.body.appendChild(image);
    };
    _Class.prototype.loaded = function(e) {
      var bits, canvas, image, path;
      image = e.target;
      canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext('2d').drawImage(image, 0, 0);
      bits = canvas.toDataURL();
      path = image.getAttribute('data-path');
      return this.proxy.send({
        action: 'loaded',
        path: path,
        bits: bits
      });
    };
    return _Class;
  })()
};
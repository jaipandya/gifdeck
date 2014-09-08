var Application,
    __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };

if (!Application) {
    Application = {};
}

Application.Proxy = (function() {
    function _Class(options) {
        this.on_message = __bind(this.on_message, this);
        window.addEventListener('message', this.on_message, false);
        this.application = options.application;
        this.load(options.url);
    }

    _Class.prototype.load = function(url) {
        var loader;
        this.remote_domain = url.match(/http:\/\/[^/]+/)[0];
        loader = document.createElement('iframe');
        loader.setAttribute('style', 'display:none');
        loader.src = "" + url + "?stamp=" + (this.timestamp());
        return document.body.appendChild(loader);
    };

    _Class.prototype.is_loaded = function() {
        return !!this.end_point;
    };

    _Class.prototype.on_message = function(event) {
        var message;
        if (event.origin !== this.remote_domain) {
            return;
        }
        message = JSON.parse(event.data);
        switch (message.action) {
            case 'init':
                return this.end_point = event.source;
            default:
                return this.application.from_proxy(message);
        }
    };

    _Class.prototype.send = function(message) {
        if (this.is_loaded()) {
            return this.end_point.postMessage(JSON.stringify(message), this.remote_domain);
        } else {
            return window.setTimeout(((function(_this) {
                return function() {
                    return _this.send(message);
                };
            })(this)), 200);
        }
    };

    _Class.prototype.timestamp = function() {
        return (Math.random() + "").substr(-10);
    };

    return _Class;

})();
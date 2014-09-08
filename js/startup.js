/*!
 * Start Bootstrap - Grayscale Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    var options = {
        delay: 800,
        slideCount: 10,
        size: 700
    }

    // Set preferences for gif conversion
    $('#delay').val(options.delay);
    $('#slideCount').val(options.slideCount);
    $('#size').val(options.size);

    $('.settings .form-group .form-control').change(function(e){
        options[$(this).attr('id')] = +$(this).val();
        console.log(options);
    })

    // Interaction for settings button
    $('.settings-button').click(function(e){
        e.preventDefault();
        $('.settings').slideToggle();
    })

    // jQuery to collapse the navbar on scroll
    $(window).scroll(function() {
        if ($(".navbar").offset().top > 50) {
            $(".navbar-fixed-top").addClass("top-nav-collapse");
        } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
        }
    });


    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });

    // $('.intro-body .main-image').hover(function(e) {
    //     this.setAttribute('src', 'images/gif/and.gif');
    // }, function(e) {
    //     this.setAttribute('src', 'images/gif/hello.gif');
    //     $(this).addClass('emboss-glow');
    // })

    var gifDeckHandler = function(e){
        url = $('#convert input.input-hg').val();
        url = url || 'http://www.slideshare.net/initialstate/big-data-from-small-places'
        e.preventDefault();
        window.ladda = Ladda.create(this);
        ladda.start();
        gifdeck = new GifDeck(options);
        gifdeck.fetchData(url);
        return false;
    }

    // Bhai bhai - bhai bhai
    $('#j-convert-to-gif').click(gifDeckHandler);
    $('#convert input[type=text]').keypress(gifDeckHandler);

    Ladda.bind('.ladda-button')
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});


$(function($) {
    window.app = new Application.Main();

    var GifDeck = function(options) {
        this.slideshare_api_url = 'http://www.slideshare.net/api/oembed/2?callback=?';
        this.config(options)
        this.reset();
    }

    GifDeck.prototype.show_progress = function(state) {
        var progress = this.progress;
        $('.progress').removeClass('hide');
        state = state || 'fetching slides';
        if (state === 'converting to gif') {
            progress = this.progress + 50;
        }

        $('.progress .progress-bar').css('width', progress + "%");

        var text = state + ' ' + progress + '%';
        $('.progress .progress-bar span').text(text);
    }

    GifDeck.prototype.config = function(config) {
        this.maxWidth = +(config && config.width) || 650;
        this.slideCount = +(config && config.slideCount) || 500;
        this.delay = +(config && config.delay) || 1500;

    }

    GifDeck.prototype.show_error = function(message) {
        this.error = message || "Soemthing went horribly wrong, please try again later"
        $('#convert .alert').text(this.error).removeClass('hide');
    }

    GifDeck.prototype.hide_error = function(message) {
        $('#convert .alert').text(this.error).addClass('hide');
    }

    GifDeck.prototype.hide_progress = function() {
        $('.progress').addClass('hide');
    }

    GifDeck.prototype.reset = function() {
        this.progress = 0;
        this.slides = [];
        this.abort_render();
        $('.thumbnail-container').addClass('hide');
        this.hide_progress();
        $('#save-gif').addClass('hide');
        this.hide_error();
    }

    GifDeck.prototype.fetchData = function(url) {
        this.reset();
        // given the URL decide a fetching stategy
        // If it is a SlideShare URL, it'll fetch images using oEmbed API
        var url = url || 'http://www.slideshare.net/Listonic/think-outside-of-the-box-10-non-standard-uses-of-regular-foodstuffs-thatd-never-cross-your-mind';
        var self = this,
            _slides = [];
        var jqxhr = $.getJSON(this.slideshare_api_url, {
                url: url,
                format: 'json'
            }).done(function(data) {
                var totalSlides = data.total_slides;
                if (totalSlides && self.slideCount < totalSlides && self.slideCount > 0 ) {
                    totalSlides = self.slideCount;
                }


                //check header for error status first
                if (totalSlides) {
                    for (var i = 0; i < totalSlides; i++) {
                        _slides[i] = document.createElement('img');
                        _slides[i].setAttribute('data-path',
                            'http:' + data.slide_image_baseurl + (i + 1) + data.slide_image_baseurl_suffix);
                    }
                    self.show_progress();
                    app.load_images(_slides, self, function(slides) {
                        self.convertToGif(slides)
                    });
                }
                self.slides = _slides;
            })
            .fail(function(error) {
                debugger
                self.show_error("Presentation couldn't be fetched");
            })
            .always(function() {
                ladda.stop();
            });
    }

    GifDeck.prototype.convertToGif = function(slides) {
        var self = this;
        this.gif = new GIF({
            workers: 2,
            quality: 20,
            workerScript: 'js/gif.worker.js'
        });

        try {
            for (var count = 0, length = slides.length; count < length; count++) {
                // add an image element
                this.gif.addFrame(slides[count], {
                    delay: self.delay
                });
            }
        } catch (e) {
            this.show_error("Error in GIF generation. Frame couldn't be added.")
        }

        this.gif.on('finished', function(blob) {
            var ojbect_url;
            self.progress = 100;
            self.show_progress('converted');

            self.hide_progress();
            object_url = URL.createObjectURL(blob);
            $('.thumbnail-container').removeClass('hide');
            $('.converted-gif').attr('src', object_url);
            self.showGifDownloadButton(object_url)
        });

        this.gif.on('progress', function(p) {
            self.progress = (Math.round(p * 50));
            self.show_progress('converting to gif');
        })
        try {
            this.gif.render();
        } catch (e) {
            self.show_error();
        }
    };

    GifDeck.prototype.abort_render = function() {
        if (this.gif) {
            this.gif.abort();
        }
    }

    GifDeck.prototype.showGifDownloadButton = function (object_url) {
        // get link anchor tag first
        // a
        a = $('#save-gif').removeClass('hide');
        a.attr('href', object_url);
        a.attr('download','slideshare-as-a.gif');
    }

    window.GifDeck = GifDeck;

}(jQuery))
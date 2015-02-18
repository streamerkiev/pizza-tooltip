(function($) {
    $.setBreakpoints = function () {
        var getViewportWidth = function () {
            var de = document.documentElement;
            if (typeof window.innerWidth != 'undefined') {
                return window.innerWidth;
            } else if (typeof de != 'undefined' && typeof de.clientWidth != 'undefined') {
                return de.clientWidth;
            } else {
                return document.getElementsByTagName('body')[0].clientWidth;
            }
        };
        var lastSize = getViewportWidth();
        var initStatus = false;
        var resetMediaVars = function () {
            $.mediaM = $.mediaT = $.mediaD = false;
        };
        var setMedia = function (m) {
            resetMediaVars();
            $[m] = true;
        };
        var mediaVars = function () {
            var w = getViewportWidth();
            if (w < 768) {
                setMedia("mediaM");
            } else if (w < 1024) {
                setMedia("mediaT");
            } else if (w >= 1024) {
                setMedia("mediaD");
            }
        };
        var mediaTrigger = function () {
            var w = getViewportWidth();
            if (w < 768 && (lastSize >= 768 || !initStatus)) {
                setMedia("mediaM");
                $(window).trigger("mediaM");
            }
            if (w < 1024 && (lastSize >= 1024 || !initStatus)) {
                $(window).trigger("mediaMT");
            }
            if ((w >= 768) && (w < 1024) && (lastSize < 768 || lastSize >= 1024 || !initStatus)) {
                setMedia("mediaT");
                $(window).trigger("mediaT");
            }
            if (w >= 768 && (lastSize < 768 || !initStatus)) {
                $(window).trigger("mediaTD");
            }
            if (w >= 1024 && (lastSize < 1024 || !initStatus)) {
                setMedia("mediaD");
                $(window).trigger("mediaD");
            }
            if (lastSize != w) {
                lastSize = w;
            }
            initStatus = true;
        };
        mediaVars(); // init media variables
        setTimeout(mediaTrigger, 0); // init media events
        $(window).on("resize.mediaTrigger", mediaTrigger);
    };

    // Pizza Plugin
    $.fn.pizzaTooltip = function (settings) {
        var el = this;
        return this.each(function() {
            var defaults = {
                    data: '',
                    isOnlyOneActive: true,
                    isFirstOpen: true,
                    isPreloader: false,
                    isFancyLoad: false,
                    onLoadCallback: function() {}
                },
                params = $.extend({}, defaults, settings),
                $self = $(this),
                circlesNumber = params.data.length,
                pizzaDiameter = $self.height(),
                pizzaInitialized = false,
                $mobileTooltip = $(".mobile-tooltip");

            function preloader() {
                $("<div>").attr("class", 'preloader').appendTo($self);
                $(".pizza-img").load(function() {
                    pizzaLoadingStart();
                    $(".preloader").fadeOut(1000, function() {
                        initPizza();
                        $(this).remove();
                    });
                });
            }

            function initCircles(number) {
                var pizzaRadius = pizzaDiameter / 2,
                    angleDegrees = -90;
                for (var n = 0; n < number; n++) {
                    var angle = angleDegrees * (Math.PI / 180),
                        x1 = Math.round(pizzaRadius + pizzaRadius * Math.cos(angle)) / pizzaDiameter * 100,
                        y1 = Math.round(pizzaRadius + pizzaRadius * Math.sin(angle)) / pizzaDiameter * 100,
                        position = {
                            bottom: y1 + '%',
                            left: x1 + '%'
                        };
                    if (!params.isFancyLoad) {
                        addCircle(position);
                    } else {
                        addCircle(position, angleDegrees);
                    }
                    angleDegrees = angleDegrees + (360 / number);
                }
                if (params.isFancyLoad) {
                    fancyLoad();
                } else {
                    initTooltips();
                }
            }

            function addCircle(setPosition, angle) {
                var $circle = $("<div>")
                                .attr("class", 'circle')
                                .appendTo($self);
                if (!params.isFancyLoad) {
                    $circle.css(setPosition);
                } else {
                    if ((typeof (angle) == "undefined")) {
                        angle = -90;
                    }
                    $circle.data("angle", angle);
                }
            }

            function fancyLoad() {
                var $circles = $(".circle");
                $circles.css({bottom: '50%', left: '50%'});
                $circles.animate({
                    bottom: 0
                }, 1200, "easeOutBounce");
                $circles.each(function() {
                    $(this).animate({
                        angleDegrees: $(this).data("angle")
                    }, {
                        duration: 1300,
                        step: function(angleDegrees, fx) {
                            fx.start = -90;
                            var pizzaRadius = pizzaDiameter / 2,
                                angle = angleDegrees * (Math.PI / 180),
                                x1 = Math.round(pizzaRadius + pizzaRadius * Math.cos(angle)) / pizzaDiameter * 100,
                                y1 = Math.round(pizzaRadius + pizzaRadius * Math.sin(angle)) / pizzaDiameter * 100,
                                position = {
                                    bottom: y1 + '%',
                                    left: x1 + '%'
                                };
                            $(this).css(position);
                        },
                        complete: function() {
                            if ($(this).index() === $circles.last().index()){
                                initTooltips();
                            }
                        }
                    });
                });
            }

            function initTooltips() {
                var $circles = $(".circle"),
                    $thisCircle = $circles.eq(0);
                $circles.each(function() {
                    var thisCircleId = $(this).index() - 1;
                        var tooltipPosition = getTooltipPosition($(this)),
                        $tooltip = $("<div>")
                                    .attr("class", 'tooltip tooltip-' + tooltipPosition)
                                    .data("active", false)
                                    .appendTo($(this));
                        $("<span>")
                            .attr("class", 'text' + thisCircleId)
                            .appendTo($tooltip)
                            .append(params.data[thisCircleId]);
                    $(this).click(function() {
                        clickTooltip($(this));
                    });
                });
                if (params.isFirstOpen) {
                    var $thisTooltip = $thisCircle.find(".tooltip");
                    $thisCircle.addClass("active-circle").find(".tooltip").data("active", true);
                    if ($.mediaM) {
                        $mobileTooltip.append($thisTooltip.html());
                    } else {
                        $thisTooltip.show();
                    }
                }
                params.onLoadCallback();
            }

            function getTooltipPosition(circle) {
                var bottom = (parseInt(circle.css("bottom"))) / pizzaDiameter * 100,
                    left = (parseInt(circle.css("left"))) / pizzaDiameter * 100,
                    tooltipPosition;
                if (bottom < 50 && left >= 50) {
                    tooltipPosition = "left-top";
                } else if (bottom >= 50 && left > 50) {
                    tooltipPosition = "left-bottom";
                } else if (bottom > 50 && left <= 50) {
                    tooltipPosition = "right-bottom";
                } else {
                    tooltipPosition = "right-top";
                }
                return tooltipPosition;
            }

            function clickTooltip(circle) {
                var $otherCircles = $(".circle").not(circle),
                    $thisTooltip = circle.find(".tooltip");
                if (params.isOnlyOneActive) {
                    $otherCircles.removeClass("active-circle");
                    $otherCircles.find(".tooltip").data("active", false).hide();
                    $mobileTooltip.empty();
                }
                if (!$thisTooltip.data("active")) {
                    showTooltip(circle);
                } else {
                    hideTooltip(circle);
                }
            }

            function showTooltip(circle) {
                var $thisTooltip = circle.find(".tooltip"),
                    thisTooltipContent = $thisTooltip.html();
                $thisTooltip.data("active", true);
                circle.addClass("active-circle");
                if ($.mediaM) {
                    $mobileTooltip.append(thisTooltipContent);
                } else {
                    $thisTooltip.show();
                }
            }

            function hideTooltip(circle) {
                var $thisTooltip = circle.find(".tooltip");
                $thisTooltip.data("active", false);
                circle.removeClass("active-circle");
                if ($.mediaM) {
                    var thisTextCarrierId = circle.index() - 1;
                    $mobileTooltip.find(".text" + thisTextCarrierId).remove();
                } else {
                    $thisTooltip.hide();
                }
            }

            function desktopTooltips() {
                $mobileTooltip.empty().hide();
                $(".circle").each(function() {
                    var $thisTooltip = $(this).find(".tooltip");
                    if ($thisTooltip.data("active")) {
                        $thisTooltip.show();
                    }
                });
            }

            function mobileTooltips() {
                $mobileTooltip.empty().show();
                $(".circle").each(function() {
                    var $thisTooltip = $(this).find(".tooltip"),
                        $thisText = $thisTooltip.html();
                    if ($thisTooltip.data("active")) {
                        $thisTooltip.hide();
                        $mobileTooltip.append($thisText);
                    }
                });
            }

            function hideDeactivator() {
                $("#toolbar-deactivator").hide();
            }

            function showDeactivator() {
                $("#toolbar-deactivator").show();
            }

            function pizzaLoadingStart() {
                $(window).trigger("pizzaLoadingStart");
            }

            function initPizza() {
                if (circlesNumber && !pizzaInitialized) {
                    initCircles(circlesNumber);
                    pizzaInitialized = true;
                    console.log("Initializing Pizza...\nData:\n[" + params.data + "]\n");
                }
            }

            function destroyPizza() {
                $self.find(".circle").remove();
                circlesNumber = 0;
                pizzaInitialized = false;
                console.log("Destroying Pizza...\n");
            }

            el.addEl = function (text) {
                pizzaLoadingStart();
                destroyPizza();
                params.data.push(text);
                circlesNumber = params.data.length;
                console.log("Adding new text ('" + text + "') to Pizza...\n");
                initPizza();
            };

            el.removeEl = function (id) {
                pizzaLoadingStart();
                destroyPizza();
                params.data.splice(id, 1);
                circlesNumber = params.data.length;
                console.log("Removing an element (ID: " + id + ") from Pizza...\n");
                initPizza();
            };
            
            el.reload = function (newSettings) {
                pizzaLoadingStart();
                params = $.extend({}, params, newSettings);
                destroyPizza();
                circlesNumber = params.data.length;
                $(".pizza-img").remove();
                var $pizzaImg = $("<img>")
                    .attr("src", "images/pizza.png")
                    .attr("alt", "Pizza!")
                    .attr("class", "pizza-img");
                $(".pizza").append($pizzaImg);
                if (params.isPreloader) {
                    preloader();
                } else {
                    initPizza();
                }
            };

            $(window).on("mediaTD", desktopTooltips);
            $(window).on("mediaM", mobileTooltips);
            $(window).on("pizzaInitialized", hideDeactivator);
            $(window).on("pizzaLoadingStart", showDeactivator);

            if (params.isPreloader) {
                preloader();
            } else {
                pizzaLoadingStart();
                initPizza();
            }
        })
    };

    function toolbarAddCircle() {
        $("#js-add-more-text").click(function() {
            var addTextWrapperId = $(".add-text-wrapper").length + 1,
                $oneMoreTextRemove = $("<img>")
                    .attr("src", "images/remove.png")
                    .attr("alt", "remove")
                    .attr("class", "remove-text"),
                $oneMoreTextInput = $("<input>")
                    .attr("type", "text")
                    .attr("id", "add-text" + addTextWrapperId),
                $oneMoreTextLabel = $("<label>")
                    .attr("for", "add-text" + addTextWrapperId)
                    .attr("class", "add-remove-label")
                    .append("Text to add:"),
                $oneMoreText = $("<div>")
                    .attr("class", "add-text-wrapper")
                    .append($oneMoreTextLabel)
                    .append($oneMoreTextInput)
                    .append($oneMoreTextRemove);
            $("#add-text-pieces-wrapper").append($oneMoreText);
            $(".remove-text").each(function() {
                $(this).click(function() {
                    $(this).parent(".add-text-wrapper").remove();
                });
            });
        });
    }

    function toolbar() {
        var $accordionItem = $(".accordion-item");
        $accordionItem.find(".js-accordion-heading").click(function() {
            var $thisAccordionItem = $(this).parent(".accordion-item"),
                $accordionItemContent = $thisAccordionItem.find(".accordion-content");
            if ($accordionItemContent.data("open")) {
                $accordionItemContent.stop().slideUp().data("open", false);
            } else {
                $(".accordion-content").stop().slideUp().data("open", false);
                $accordionItemContent.stop().slideDown().data("open", true);
            }
        });
        toolbarAddCircle();
        $("#js-stop").click(function() {
            $(".accordion-content").stop();
        });
    }
    toolbar();

    // DOMReady
    $(function () {
        // media breakpoints
        $.setBreakpoints();

        var $pizza = $(".pizza").pizzaTooltip({
            data: ["Lorem ipsum dolor sit amet", "consectetur adipiscing elit", "Fusce dapibus ex at aliquet tincidunt", "Donec sed scelerisque elit", "Morbi vel ligula ultricies, tincidunt velit nec, cursus diam", "Nullam diam massa, interdum ut nulla ac"],
            isOnlyOneActive: true,
            isFirstOpen: true,
            isPreloader: true,
            isFancyLoad: true,
            onLoadCallback: function() {
                $(window).trigger("pizzaInitialized");
            }
        });

        // Add a Circle option
        $("#js-add-text").click(function() {
            var $errorSpan = $("#js-add-error");
            $("#add-text-pieces-wrapper").find("input").each(function() {
                $errorSpan.empty();
                var text = $(this).val();
                if (text !== "") {
                    $pizza.addEl(text);
                } else {
                    $errorSpan.append("Enter text to add");
                }
                $(".add-text-wrapper:gt(0)").remove();
                $(".add-text-wrapper").find("#add-text").val("");
            });
        });

        // Remove a Circle option
        $("#js-remove-circle").click(function() {
            var $errorSpan = $("#js-remove-error"),
                $removeInput = $("#remove-text"),
                circlesNumber = $(".circle").length,
                text = $removeInput.val();
            $errorSpan.empty();
            if (text.length !== 0 && !isNaN(text) && text < circlesNumber) {
                if (text >= 0) {
                    $pizza.removeEl(text);
                } else {
                    var removeId = parseInt(circlesNumber) + parseInt(text);
                    console.log(removeId);
                    if (removeId >= 0) {
                        $pizza.removeEl(removeId);
                    } else {
                        $errorSpan.append("There is no such circle");
                    }
                }
            } else if (text.length === 0) {
                $errorSpan.append("Enter a circle # to remove");
            } else if (isNaN(text)) {
                $errorSpan.append("Circle # must be a number");
            } else {
                $errorSpan.append("There is no such circle");
            }
            $removeInput.val("");
        });

        // Reload Pizza option
        $("#js-reload").click(function() {
            var $errorSpan = $("#js-reload-error"),
                $textarea = $("#reload-text"),
                text = $textarea.val().split(';'),
                $checkboxOnlyOne = $("#is-only-one-active"),
                $checkboxFirstOpen = $("#is-first-open"),
                $checkboxPreloader = $("#is-preloader"),
                $checkboxFancyLoad = $("#is-fancy-load"),
                optOnlyOneActive = false,
                optFirstOpen = false,
                optPreloader = false,
                optFancyLoad = false;
            if ($checkboxOnlyOne.prop('checked')) {
                optOnlyOneActive = true;
            }
            if ($checkboxFirstOpen.prop('checked')) {
                optFirstOpen = true;
            }
            if ($checkboxPreloader.prop('checked')) {
                optPreloader = true;
            }
            if ($checkboxFancyLoad.prop('checked')) {
                optFancyLoad = true;
            }
            $errorSpan.empty();
            if ($.trim(text).length !== 0) {
                $pizza.reload({
                    data: text,
                    isOnlyOneActive: optOnlyOneActive,
                    isFirstOpen: optFirstOpen,
                    isPreloader: optPreloader,
                    isFancyLoad: optFancyLoad
                });
                $textarea.val('');
                $checkboxOnlyOne.prop('checked', false);
                $checkboxFirstOpen.prop('checked', false);
                $checkboxPreloader.prop('checked', false);
                $checkboxFancyLoad.prop('checked', false);
            } else {
                $errorSpan.append("Enter text for at least one tooltip");
            }
        });
    });

})(jQuery);
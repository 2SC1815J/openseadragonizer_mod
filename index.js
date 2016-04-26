/*
 * Copyright (C) 2015 OpenSeadragon contributors
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of OpenSeadragon nor the names of its contributors
 *   may be used to endorse or promote products derived from this software
 *   without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
/*
 * Customized OpenSeadragonizer for sequentially numbered images
 * example: index.html?img=http://archive.wul.waseda.ac.jp/kosho/he12/he12_04353/he12_04353_p0001.jpg&pages=121
 *
 * Copyright (C) 2016, 2SC1815J
 * https://twitter.com/2SC1815J
 * Released under the New BSD license.
 * https://github.com/2SC1815J/openseadragonizer_mod
 */
(function () {
    var loaderElt = document.getElementById("loader");
    var popupElt = document.getElementById("popup");
    var urlElt = document.getElementById("url");
    var pagesElt = document.getElementById("pages");
    var popup2Elt = document.getElementById("popup2");
    var imgurlElt = document.getElementById("img_url");
    
    urlElt.onkeyup = function (event) {
        if (event.keyCode === 13) {
            location.href = '?img=' + urlElt.value + '&pages=' + pagesElt.value;
        }
    };

    pagesElt.onkeyup = function (event) {
        if (event.keyCode === 13 && urlElt.value != "") {
            location.href = '?img=' + urlElt.value + '&pages=' + pagesElt.value;
        }
    };

    document.getElementById("show-button").onclick = function () {
        location.href = '?img=' + urlElt.value + '&pages=' + pagesElt.value;
    };

    document.getElementById("ok-button").onclick = function () {
        popup2Elt.style.display = "none";
    };

    window.OpenSeadragonizer = {
        open: function (url) {
            popupElt.style.display = "none";

            if (!url) {
                var imgUrlParameter = OpenSeadragon.getUrlParameter("img");
                if (!imgUrlParameter) {
                    popupElt.style.display = "block";
                    return;
                }
                url = OpenSeadragon.getUrlParameter("encoded") ?
                    decodeURIComponent(imgUrlParameter) : imgUrlParameter;
            }

            var options = {
                src: url,
                container: document.getElementById("loader"),
                crossOrigin: 'Anonymous'
            };
            loadImage(options, onImageLoaded, function (event) {
                loaderElt.removeChild(event.image);
                // We retry without CORS
                delete options.crossOrigin;
                loadImage(options, onImageLoaded, onError);
            });
            document.title = "OpenSeadragon " + url;
        }
    };

    function loadImage(options, successCallback, errorCallback) {
        var image = new Image();
        options.container.appendChild(image);
        image.onload = function () {
            successCallback({
                image: image,
                options: options
            });
        };
        image.onerror = function () {
            errorCallback({
                image: image,
                options: options
            });
        };
        if (options.crossOrigin) {
            image.crossOrigin = options.crossOrigin;
        }
        image.src = options.src;
    }

    function onImageLoaded(event) {
        var image = event.image;
        document.title = "OpenSeadragon " + image.src +
                " (" + image.naturalWidth + "x" + image.naturalHeight + ")";
        var overlays_str = [];
        var fragment = location.hash;
        if (fragment) {
            var spatialDims = /xywh=percent:([0-9.]+),([0-9.]+),([0-9.]+),([0-9.]+)/.exec(fragment);
            if (spatialDims && spatialDims.length == 5) {
                overlays_str.push({ 
                        id: 'runtime-overlay',
                        x: Number(spatialDims[1]) / 100,
                        y: Number(spatialDims[2]) / 100,
                        width: Number(spatialDims[3]) / 100,
                        height: Number(spatialDims[4]) / 100,
                        className: 'highlight'
                        });
            }
        }
        var tileSources = [{
                type: 'image',
                url: image.src,
                crossOriginPolicy: event.options.crossOrigin,
                overlays: overlays_str,
            }];
        var sequenceMode = false;
        var a = document.createElement('a');
        a.href = image.src;
        var elems = /(\S+?)(\d+)\.(\S+)/.exec(a.pathname); //fix if needed
        if (elems && elems.length == 4) {
            var lastPage = parseInt(OpenSeadragon.getUrlParameter("pages"), 10);
            if (isNaN(lastPage)) {
                lastPage = 1;
            }
            var digits = elems[2];
            var startPage = Number(digits);
            var pad = Array(digits.length + 1).join("0");
            for (var i = startPage + 1; i <= lastPage; i++) {
                tileSources.push({
                    type: 'image',
                    url: a.protocol + "//" + a.host + elems[1] + (pad + String(i)).slice(-digits.length) + "." + elems[3],
                    crossOriginPolicy: event.options.crossOrigin
                });
            }
            for (var i = 1; i < startPage; i++) {
                tileSources.push({
                    type: 'image',
                    url: a.protocol + "//" + a.host + elems[1] + (pad + String(i)).slice(-digits.length) + "." + elems[3],
                    crossOriginPolicy: event.options.crossOrigin
                });
            }
            OpenSeadragon.setString("Tooltips.FullPage", OpenSeadragon.getString("Tooltips.FullPage") + " (f)");
            OpenSeadragon.setString("Tooltips.NextPage", OpenSeadragon.getString("Tooltips.NextPage") + " (n)");
            OpenSeadragon.setString("Tooltips.PreviousPage", OpenSeadragon.getString("Tooltips.PreviousPage") + " (p)");
            sequenceMode = true;
        }
        var viewer = OpenSeadragon({
            id: "openseadragon",
            prefixUrl: "openseadragon/images/",
            sequenceMode: sequenceMode,
            navPrevNextWrap: true,
            tileSources: tileSources,
            maxZoomPixelRatio: 2
        });
        viewer.addHandler("tile-drawn", function readyHandler() {
            viewer.removeHandler("tile-drawn", readyHandler);
            document.body.removeChild(loaderElt);
        });
        var selection = viewer.selection({
            returnPixelCoordinates: false,
            restrictToImage: true,
            onSelection: function(rect) {
                viewer.removeOverlay("runtime-overlay");
                var elt = document.createElement("div");
                elt.id = "runtime-overlay";
                elt.className = "highlight";
                viewer.addOverlay({
                    element: elt,
                    location: new OpenSeadragon.Rect(rect.x, rect.y, rect.width, rect.height)
                });
                location.hash = 'xywh=percent:' + rect.x * 100 + "," + rect.y * 100  + "," + rect.width * 100  + "," + rect.height * 100;
            }
        });
        if (sequenceMode) {
            var origLoc = location.href;
            imgurlElt.textContent = location.href;
            viewer.addHandler("page", function(data) {
                var new_url = origLoc.replace(
                                            viewer.tileSources[0].url, 
                                            viewer.tileSources[data.page].url);
                imgurlElt.textContent = new_url;
                if (history.replaceState && history.state !== undefined) {
                    history.replaceState(null, null, new_url);
                } else {
                    //TODO
                }
            });
            OpenSeadragon.addEvent(
                document,
                'keypress',
                OpenSeadragon.delegate(this, function onKeyPress(e) {
                    var key = e.keyCode ? e.keyCode : e.charCode;
                    switch (String.fromCharCode(key)) {
                    case 'n':
                    case '>':
                    case '.':
                        if (viewer.nextButton) {
                            viewer.nextButton.onRelease();
                        }
                        return false;
                    case 'p':
                    case '<':
                    case ',':
                        if (viewer.previousButton) {
                            viewer.previousButton.onRelease();
                        }
                        return false;
                    case 'f':
                        if (viewer.fullPageButton) {
                            viewer.fullPageButton.onRelease();
                        }
                        return false;
                    case 'u':
                        popup2Elt.style.display = "block";
                        document.getElementById("ok-button").focus();
                        return false;
                    }
                }),
                false
            );
        }
    }
    
    function onError(event) {
        popupElt.style.display = "block";
        loaderElt.removeChild(event.image);
        document.getElementById("error").textContent =
                "Can not retrieve requested image.";
    }

})();

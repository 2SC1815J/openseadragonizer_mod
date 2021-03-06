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
 * example: index.html?img=http://archive.wul.waseda.ac.jp/kosho/he12/he12_04353/he12_04353_p0073.jpg&pages=121#xywh=percent:17.5,9,2.5,4.5
 * example: index.html?img=http://libimages.princeton.edu/loris/pudl0071/4055459/01/00000008.jp2/info.json&pages=473#xywh=percent:58.6,19,7,7.5
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
        if (event && event.keyCode === 13) {
            location.href = '?img=' + urlElt.value + '&pages=' + pagesElt.value;
        }
    };

    pagesElt.onkeyup = function (event) {
        if (event && event.keyCode === 13 && urlElt.value !== "") {
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

            var xmlJsonSrcMode = (url.search(/\.(xml|json|dzi)$/) !== -1);
            var options = {
                src: url,
                container: document.getElementById("loader"),
                crossOrigin: 'Anonymous',
                xmlJsonSrcMode: xmlJsonSrcMode
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
        if (options.xmlJsonSrcMode) {
            var obj = {};
            obj.src = options.src;
            successCallback({
                image: obj,
                options: options
            });
        } else {
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
    }

    function onImageLoaded(event) {
        var image = event.image;
        var xmlJsonSrcMode = event.options.xmlJsonSrcMode || false;
        var docTitle = "OpenSeadragon " + image.src;
        if (!xmlJsonSrcMode) {
            docTitle += " (" + image.naturalWidth + "x" + image.naturalHeight + ")";
        }
        document.title = docTitle;
        var overlay = {};
        var hasOverlay = function() { return ("x" in overlay) && ("y" in overlay); };
        if (location.hash) {
            var spatialDims = /xywh=percent:([0-9.-]+),([0-9.-]+),([0-9.]+),([0-9.]+)/.exec(location.hash); //accept x < 0, y < 0 (though invalid Media Fragments URI) 
            if (spatialDims && spatialDims.length === 5) {
                var percetToRatio = function(num) {
                    if (isNaN(num)) {
                        return 0;
                    }
                    var elems = String(num).split(".");
                    var tmp = "00" + String(Math.abs(parseInt(elems[0], 10)));
                    if (num < 0) {
                        tmp = "-" + tmp;
                    }
                    if (elems.length > 1) {
                        return parseFloat(tmp.substr(0, tmp.length - 2) + "." + tmp.slice(-2) + elems[1]);
                    } else {
                        return parseFloat(tmp.substr(0, tmp.length - 2) + "." + tmp.slice(-2));
                    }
                };
                overlay = { 
                    x: percetToRatio(Number(spatialDims[1])),
                    y: percetToRatio(Number(spatialDims[2])),
                    width: percetToRatio(Number(spatialDims[3])),
                    height: percetToRatio(Number(spatialDims[4])),
                    pageNo: 0
                };
            }
        }
        var tileSources = [];
        if (xmlJsonSrcMode) {
            tileSources = [ image.src ];
        } else {
            tileSources = [{
                type: 'image',
                url: image.src,
                crossOriginPolicy: event.options.crossOrigin
            }];
        }
        var lastPage = 1;
        var a = document.createElement('a');
        a.href = image.src;
        var imagePath = a.pathname;
        if (imagePath.indexOf("/") !== 0) {
            imagePath = "/" + imagePath;
        }
        var elems = /(\S+?)(\d+)\.(\S+)/.exec(imagePath); //fix if needed
        if (elems && elems.length === 4) {
            lastPage = parseInt(OpenSeadragon.getUrlParameter("pages"), 10);
            if (isNaN(lastPage)) {
                lastPage = 1;
            }
            var digits = elems[2];
            var startPage = Number(digits);
            var pad = Array(digits.length + 1).join("0");
            var i, srcUrl;
            for (i = startPage + 1; i <= lastPage; i++) {
                srcUrl = a.protocol + "//" + a.host + elems[1] + (pad + String(i)).slice(-digits.length) + "." + elems[3];
                if (xmlJsonSrcMode) {
                    tileSources.push( srcUrl );
                } else {
                    tileSources.push({
                        type: 'image',
                        url: srcUrl,
                        crossOriginPolicy: event.options.crossOrigin
                    });
                }
            }
            for (i = 1; i < startPage; i++) {
                srcUrl = a.protocol + "//" + a.host + elems[1] + (pad + String(i)).slice(-digits.length) + "." + elems[3];
                if (xmlJsonSrcMode) {
                    tileSources.push( srcUrl );
                } else {
                    tileSources.push({
                        type: 'image',
                        url: srcUrl,
                        crossOriginPolicy: event.options.crossOrigin
                    });
                }
            }
        }
        var hasHistoryReplaceState = function() {
            return history.replaceState && history.state !== undefined; //IE < 10 are not supported
            //also OpenSeadragonSelection is not working properly in IE < 10 by another reason
        };
        var sequenceMode = tileSources.length > 1;
        if (sequenceMode) {
            OpenSeadragon.setString("Tooltips.FullPage", OpenSeadragon.getString("Tooltips.FullPage") + " (f)");
            OpenSeadragon.setString("Tooltips.NextPage", OpenSeadragon.getString("Tooltips.NextPage") + " (n)");
            OpenSeadragon.setString("Tooltips.PreviousPage", OpenSeadragon.getString("Tooltips.PreviousPage") + " (p)");
        }
        var viewer = new OpenSeadragon({
            id: "openseadragon",
            prefixUrl: "openseadragon/images/",
            sequenceMode: sequenceMode,
            navPrevNextWrap: true,
            tileSources: tileSources,
            maxZoomPixelRatio: 2
        });
        if ("selection" in viewer) {
            var selection = viewer.selection({
                returnPixelCoordinates: false,
                //restrictToImage: true, //will have trouble at the bottom of portrait images
                onSelection: function(rect) {
                    updateSelection(rect);
                }
            });
        }
        function updateSelection(rect) {
            if ("pageNo" in rect) {
                if (rect.pageNo !== viewer.currentPage()) {
                    return;
                }
            }
            viewer.removeOverlay("runtime-overlay");
            var elt = document.createElement("div");
            elt.id = "runtime-overlay";
            elt.className = "highlight";
            viewer.addOverlay({
                element: elt,
                location: new OpenSeadragon.Rect(rect.x, rect.y, rect.width, rect.height) //these ratios are based on image width (not compatible with Media Fragments URI)
            });
            var ratioToPercentStr = function(num) {
                var elems = String(num).split(".");
                if (elems.length > 1) {
                    elems[1] = elems[1] + "00";
                    return String(parseFloat(elems[0] + elems[1].substr(0, 2) + "." + elems[1].substr(2)));
                } else {
                    return String(parseInt(elems[0] + "00", 10));
                }
            };
            var newUrl = imgurlElt.textContent.replace(/#.*$/, "") + 
                    '#xywh=percent:' + ratioToPercentStr(rect.x) + "," + ratioToPercentStr(rect.y)  + "," + ratioToPercentStr(rect.width) + "," + ratioToPercentStr(rect.height);
            imgurlElt.textContent = newUrl;
            if (hasHistoryReplaceState()) {
                history.replaceState(null, null, newUrl);
            }
            overlay = {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                pageNo: viewer.currentPage()
            };
        }
        var tiledrawnHandler = false;
        viewer.addHandler("tile-drawn", function readyHandler(event) {
            viewer.removeHandler("tile-drawn", readyHandler); // not work in IE < 9
            if (tiledrawnHandler) { return; } else { tiledrawnHandler = true; }
            if (loaderElt && loaderElt.parentNode) {
                loaderElt.parentNode.removeChild(loaderElt);
            }
            if (xmlJsonSrcMode) {
                document.title += " (" + event.tiledImage.source.width + "x" + event.tiledImage.source.height + ")";
            }
            if (hasOverlay()) {
                updateSelection(overlay);
            }
        });
        if (sequenceMode) {
            var initialSrc = viewer.tileSources[0].url || viewer.tileSources[0];
            var origLoc = location.protocol + "//" + location.host + location.pathname;
            var origSearch = "?img=" + initialSrc;
            if (sequenceMode && lastPage > 1) {
                origSearch += "&pages=" + String(lastPage);
            }
            imgurlElt.textContent = origLoc + origSearch + location.hash;
            viewer.addHandler("page", function(data) {
                var currentSrc = viewer.tileSources[data.page].url || viewer.tileSources[data.page];
                var newUrl = origLoc + origSearch.replace(initialSrc, currentSrc);
                imgurlElt.textContent = newUrl;
                if (hasHistoryReplaceState()) {
                    history.replaceState(null, null, newUrl);
                }
                if (hasOverlay()) {
                    if (data.page === overlay.pageNo) {
                        var tiledrawnHandler2 = false;
                        viewer.addHandler("tile-drawn", function readyHandler2() {
                            viewer.removeHandler("tile-drawn", readyHandler2); // not work in IE < 9
                            if (tiledrawnHandler2) { return; } else { tiledrawnHandler2 = true; }
                            if (hasOverlay()) {
                                updateSelection(overlay);
                            }
                        });
                    }
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
                        if (popup2Elt.style.display === "block") {
                            popup2Elt.style.display = "none";
                        } else {
                            popup2Elt.style.display = "block";
                            document.getElementById("ok-button").focus();
                        }
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

(() => {

    "use strict";


    // ============================================================
    // PARAMETERS
    // ============================================================


    const params =
        new URLSearchParams(
            window.location.search
        );


    const imageUrl =
        params.get("image") || "";


    const accent =
        params.get("color") ||
        "#c4a35a";


    const imageTitle =
        params.get("title") || "";


    const zoomEnabled =
        params.get("zoom") !==
        "false";


    // ============================================================
    // ELEMENTS
    // ============================================================


    const viewer =
        document.getElementById(
            "viewer"
        );


    const viewport =
        document.getElementById(
            "viewport"
        );


    const content =
        document.getElementById(
            "content"
        );


    const image =
        document.getElementById(
            "main-image"
        );


    const hotspotLayer =
        document.getElementById(
            "hotspots"
        );


    const titleElement =
        document.getElementById(
            "image-title"
        );


    const toolbar =
        document.getElementById(
            "toolbar"
        );


    const zoomOutButton =
        document.getElementById(
            "zoom-out"
        );


    const zoomInButton =
        document.getElementById(
            "zoom-in"
        );


    const resetButton =
        document.getElementById(
            "reset-view"
        );


    const infoCard =
        document.getElementById(
            "info-card"
        );


    const infoNumber =
        document.getElementById(
            "info-number"
        );


    const infoTitle =
        document.getElementById(
            "info-title"
        );


    const infoText =
        document.getElementById(
            "info-text"
        );


    const infoClose =
        document.getElementById(
            "info-close"
        );


    const errorMessage =
        document.getElementById(
            "error-message"
        );


    // ============================================================
    // TRANSPARENCY + ACCENT
    // ============================================================


    document.documentElement
        .style
        .setProperty(
            "--accent",
            accent
        );


    document.documentElement
        .style
        .setProperty(
            "background",
            "transparent",
            "important"
        );


    document.body
        .style
        .setProperty(
            "background",
            "transparent",
            "important"
        );


    // ============================================================
    // TITLE
    // ============================================================


    if (imageTitle) {

        titleElement.textContent =
            imageTitle;

        titleElement.hidden =
            false;
    }


    // ============================================================
    // HOTSPOT DATA
    // ============================================================


    const clamp =
        (
            value,
            min,
            max
        ) =>
            Math.max(
                min,
                Math.min(
                    max,
                    value
                )
            );


    const hotspots = [];


    for (
        let index = 1;
        index <= 4;
        index += 1
    ) {

        const title =
            params.get(
                `h${index}title`
            ) || "";


        if (!title.trim()) {
            continue;
        }


        const text =
            params.get(
                `h${index}text`
            ) || "";


        const rawX =
            parseFloat(
                params.get(
                    `h${index}x`
                ) || "50"
            );


        const rawY =
            parseFloat(
                params.get(
                    `h${index}y`
                ) || "50"
            );


        hotspots.push({
            number: index,

            title:
                title.trim(),

            text:
                text.trim(),

            x:
                clamp(
                    Number.isFinite(rawX)
                        ? rawX
                        : 50,
                    0,
                    100
                ),

            y:
                clamp(
                    Number.isFinite(rawY)
                        ? rawY
                        : 50,
                    0,
                    100
                )
        });
    }


    // ============================================================
    // INFORMATION CARD
    // ============================================================


    const closeInfo = () => {

        infoCard.hidden =
            true;
    };


    const openInfo = hotspot => {

        infoNumber.textContent =
            `HOTSPOT ${hotspot.number}`;


        infoTitle.textContent =
            hotspot.title;


        infoText.textContent =
            hotspot.text;


        infoText.hidden =
            !hotspot.text;


        infoCard.hidden =
            false;
    };


    infoClose.addEventListener(
        "click",
        closeInfo
    );


    // ============================================================
    // BUILD HOTSPOTS
    // ============================================================


    hotspots.forEach(
        hotspot => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "hotspot";


            button.textContent =
                hotspot.number;


            button.style.left =
                `${hotspot.x}%`;


            button.style.top =
                `${hotspot.y}%`;


            button.setAttribute(
                "aria-label",
                hotspot.title
            );


            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openInfo(
                        hotspot
                    );
                }
            );


            hotspotLayer.appendChild(
                button
            );
        }
    );


    // ============================================================
    // VIEW STATE
    // ============================================================


    let zoom =
        1;


    let panX =
        0;


    let panY =
        0;


    const MIN_ZOOM =
        1;


    const MAX_ZOOM =
        4;


    // ============================================================
    // PAN LIMITS
    // ============================================================


    const clampPan = () => {

        const contentWidth =
            content.offsetWidth *
            zoom;


        const contentHeight =
            content.offsetHeight *
            zoom;


        const maxX =
            Math.max(
                0,
                (
                    contentWidth -
                    viewport.clientWidth
                ) / 2
            );


        const maxY =
            Math.max(
                0,
                (
                    contentHeight -
                    viewport.clientHeight
                ) / 2
            );


        panX =
            clamp(
                panX,
                -maxX,
                maxX
            );


        panY =
            clamp(
                panY,
                -maxY,
                maxY
            );
    };


    // ============================================================
    // RENDER
    // ============================================================


    const render = () => {

        clampPan();


        content.style.transform = `
            translate3d(
                ${panX}px,
                ${panY}px,
                0
            )
            scale(${zoom})
        `;
    };


    // ============================================================
    // ZOOM
    // ============================================================


    const setZoom =
        newZoom => {

            if (!zoomEnabled) {
                return;
            }


            zoom =
                clamp(
                    newZoom,
                    MIN_ZOOM,
                    MAX_ZOOM
                );


            render();
        };


    const resetView = () => {

        zoom =
            1;

        panX =
            0;

        panY =
            0;


        closeInfo();

        render();
    };


    zoomInButton.addEventListener(
        "click",
        () => {

            setZoom(
                zoom + 0.25
            );
        }
    );


    zoomOutButton.addEventListener(
        "click",
        () => {

            setZoom(
                zoom - 0.25
            );
        }
    );


    resetButton.addEventListener(
        "click",
        resetView
    );


    if (!zoomEnabled) {

        toolbar.hidden =
            true;
    }


    // ============================================================
    // MOUSE WHEEL ZOOM
    // ============================================================


    viewport.addEventListener(
        "wheel",
        event => {

            if (!zoomEnabled) {
                return;
            }


            event.preventDefault();


            const amount =
                event.deltaY < 0
                    ? 0.18
                    : -0.18;


            setZoom(
                zoom + amount
            );
        },
        {
            passive: false
        }
    );


    // ============================================================
    // POINTER GESTURES
    // ============================================================


    const pointers =
        new Map();


    let gesture =
        null;


    let startPointerX =
        0;


    let startPointerY =
        0;


    let startPanX =
        0;


    let startPanY =
        0;


    let pinchStartDistance =
        0;


    let pinchStartZoom =
        1;


    let pinchStartCenterX =
        0;


    let pinchStartCenterY =
        0;


    const getPointerPair = () =>
        Array.from(
            pointers.values()
        ).slice(
            0,
            2
        );


    const getDistance =
        (
            a,
            b
        ) => {

            return Math.hypot(
                a.x - b.x,
                a.y - b.y
            );
        };


    const getCenter =
        (
            a,
            b
        ) => {

            return {
                x:
                    (
                        a.x +
                        b.x
                    ) / 2,

                y:
                    (
                        a.y +
                        b.y
                    ) / 2
            };
        };


    viewport.addEventListener(
        "pointerdown",
        event => {

            if (
                event.pointerType ===
                    "mouse" &&
                event.button !== 0
            ) {
                return;
            }


            /*
             * Hotspot buttons need normal taps/clicks.
             */
            if (
                event.target.closest(
                    ".hotspot"
                )
            ) {
                return;
            }


            event.preventDefault();


            pointers.set(
                event.pointerId,
                {
                    x:
                        event.clientX,

                    y:
                        event.clientY
                }
            );


            try {

                viewport.setPointerCapture(
                    event.pointerId
                );

            } catch (_) {}


            if (
                pointers.size === 1
            ) {

                gesture =
                    "pan";


                startPointerX =
                    event.clientX;


                startPointerY =
                    event.clientY;


                startPanX =
                    panX;


                startPanY =
                    panY;


                viewport.classList.add(
                    "dragging"
                );

            } else if (
                pointers.size >= 2 &&
                zoomEnabled
            ) {

                const [
                    first,
                    second
                ] =
                    getPointerPair();


                const center =
                    getCenter(
                        first,
                        second
                    );


                gesture =
                    "pinch";


                pinchStartDistance =
                    getDistance(
                        first,
                        second
                    );


                pinchStartZoom =
                    zoom;


                pinchStartCenterX =
                    center.x;


                pinchStartCenterY =
                    center.y;


                startPanX =
                    panX;


                startPanY =
                    panY;
            }
        }
    );


    viewport.addEventListener(
        "pointermove",
        event => {

            if (
                !pointers.has(
                    event.pointerId
                )
            ) {
                return;
            }


            event.preventDefault();


            pointers.set(
                event.pointerId,
                {
                    x:
                        event.clientX,

                    y:
                        event.clientY
                }
            );


            if (
                gesture === "pinch" &&
                pointers.size >= 2 &&
                zoomEnabled
            ) {

                const [
                    first,
                    second
                ] =
                    getPointerPair();


                const distance =
                    getDistance(
                        first,
                        second
                    );


                const center =
                    getCenter(
                        first,
                        second
                    );


                if (
                    pinchStartDistance > 0
                ) {

                    zoom =
                        clamp(
                            pinchStartZoom *
                            (
                                distance /
                                pinchStartDistance
                            ),
                            MIN_ZOOM,
                            MAX_ZOOM
                        );
                }


                panX =
                    startPanX +
                    (
                        center.x -
                        pinchStartCenterX
                    );


                panY =
                    startPanY +
                    (
                        center.y -
                        pinchStartCenterY
                    );


                render();

                return;
            }


            if (
                gesture === "pan" &&
                pointers.size === 1 &&
                zoom > 1
            ) {

                panX =
                    startPanX +
                    (
                        event.clientX -
                        startPointerX
                    );


                panY =
                    startPanY +
                    (
                        event.clientY -
                        startPointerY
                    );


                render();
            }
        }
    );


    const finishPointer =
        event => {

            pointers.delete(
                event.pointerId
            );


            try {

                if (
                    viewport.hasPointerCapture(
                        event.pointerId
                    )
                ) {

                    viewport.releasePointerCapture(
                        event.pointerId
                    );
                }

            } catch (_) {}


            if (
                pointers.size === 1
            ) {

                const remaining =
                    Array.from(
                        pointers.values()
                    )[0];


                gesture =
                    "pan";


                startPointerX =
                    remaining.x;


                startPointerY =
                    remaining.y;


                startPanX =
                    panX;


                startPanY =
                    panY;

            } else if (
                pointers.size === 0
            ) {

                gesture =
                    null;


                viewport.classList.remove(
                    "dragging"
                );
            }
        };


    viewport.addEventListener(
        "pointerup",
        finishPointer
    );


    viewport.addEventListener(
        "pointercancel",
        finishPointer
    );


    // ============================================================
    // DOUBLE CLICK RESET
    // ============================================================


    viewport.addEventListener(
        "dblclick",
        event => {

            if (
                event.target.closest(
                    ".hotspot"
                )
            ) {
                return;
            }


            resetView();
        }
    );


    // ============================================================
    // IMAGE SIZING
    // ============================================================


    const sizeImage = () => {

        const naturalWidth =
            image.naturalWidth;


        const naturalHeight =
            image.naturalHeight;


        if (
            !naturalWidth ||
            !naturalHeight
        ) {
            return;
        }


        const availableWidth =
            Math.max(
                100,
                viewport.clientWidth -
                    40
            );


        const availableHeight =
            Math.max(
                100,
                viewport.clientHeight -
                    40
            );


        const fit =
            Math.min(
                availableWidth /
                    naturalWidth,

                availableHeight /
                    naturalHeight
            );


        content.style.width =
            Math.max(
                1,
                Math.round(
                    naturalWidth *
                    fit
                )
            ) + "px";


        content.style.height =
            Math.max(
                1,
                Math.round(
                    naturalHeight *
                    fit
                )
            ) + "px";


        resetView();
    };


    // ============================================================
    // LOAD IMAGE
    // ============================================================


    image.addEventListener(
        "load",
        () => {

            errorMessage.hidden =
                true;

            sizeImage();
        }
    );


    image.addEventListener(
        "error",
        () => {

            errorMessage.hidden =
                false;
        }
    );


    if (imageUrl) {

        image.src =
            imageUrl;

    } else {

        errorMessage.hidden =
            false;
    }


    // ============================================================
    // RESIZE
    // ============================================================


    window.addEventListener(
        "resize",
        () => {

            if (
                image.complete &&
                image.naturalWidth
            ) {

                sizeImage();
            }
        }
    );

})();

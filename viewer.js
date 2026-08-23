(() => {

    "use strict";


    // ============================================================
    // PARAMETERS
    // ============================================================


    const params =
        new URLSearchParams(
            window.location.search
        );


    const frontUrl =
        params.get("front") || "";

    const backUrl =
        params.get("back") || "";

    const backStyle =
        params.get("backStyle") ||
        "mirror";

    const color =
        params.get("color") ||
        "#c4a35a";

    const speed =
        params.get("speed") ||
        "Medium";

    const verticalEnabled =
        params.get("vertical") ===
        "true";

    const zoomEnabled =
        params.get("zoom") ===
        "true";

    const titleText =
        params.get("title") || "";


    // ============================================================
    // ELEMENTS
    // ============================================================


    const plane =
        document.getElementById(
            "plane"
        );

    const scene =
        document.getElementById(
            "scene"
        );

    const frontImage =
        document.getElementById(
            "front-image"
        );

    const backFace =
        document.getElementById(
            "back-face"
        );

    const title =
        document.getElementById(
            "title"
        );


    // ============================================================
    // THEME
    // ============================================================


    document.documentElement
        .style
        .setProperty(
            "--accent",
            color
        );


    if (titleText) {

        title.textContent =
            titleText;

        title.hidden =
            false;
    }


    // ============================================================
    // IMAGE SETUP
    // ============================================================


    const createImage = src => {

        const image =
            document.createElement(
                "img"
            );

        image.src =
            src;

        image.draggable =
            false;

        return image;
    };


    if (backStyle === "solid") {

        backFace.style.background =
            color;

        backFace.innerHTML = `
            <div style="
                width:100%;
                height:100%;

                display:flex;
                align-items:center;
                justify-content:center;

                color:#000;
                font-size:3em;
            ">
                ◆
            </div>
        `;

    } else if (
        backStyle === "second" &&
        backUrl
    ) {

        backFace.appendChild(
            createImage(
                backUrl
            )
        );

    } else {

        backFace.appendChild(
            createImage(
                frontUrl
            )
        );
    }


    // ============================================================
    // IMAGE SIZE
    // ============================================================


    frontImage.addEventListener(
        "load",
        () => {

            const width =
                frontImage.naturalWidth;

            const height =
                frontImage.naturalHeight;


            if (
                !width ||
                !height
            ) {
                return;
            }


            /*
             * Maximum dimensions inside the iframe.
             *
             * The image keeps its TRUE aspect ratio.
             */
            const availableWidth =
                Math.max(
                    80,
                    window.innerWidth - 50
                );

            const availableHeight =
                Math.max(
                    80,
                    window.innerHeight -
                    (
                        titleText
                            ? 100
                            : 45
                    )
                );


            const scale =
                Math.min(
                    1,
                    availableWidth /
                        width,
                    availableHeight /
                        height
                );


            plane.style.width =
                Math.max(
                    1,
                    Math.round(
                        width * scale
                    )
                ) + "px";


            plane.style.height =
                Math.max(
                    1,
                    Math.round(
                        height * scale
                    )
                ) + "px";
        }
    );


    frontImage.src =
        frontUrl;


    // ============================================================
    // ROTATION STATE
    // ============================================================


    let rotationX =
        0;

    let rotationY =
        0;

    let zoom =
        1;


    let dragging =
        false;

    let pointerId =
        null;

    let startX =
        0;

    let startY =
        0;

    let startRotationX =
        0;

    let startRotationY =
        0;


    // ============================================================
    // AUTO SPIN
    // ============================================================


    const speedSeconds =
        speed === "Fast"
            ? 4
            : speed === "Slow"
                ? 14
                : 8;


    let autoSpin =
        true;

    let previousTime =
        performance.now();


    const animate = time => {

        const delta =
            (
                time -
                previousTime
            ) / 1000;

        previousTime =
            time;


        if (
            autoSpin &&
            !dragging
        ) {

            rotationY +=
                (
                    360 /
                    speedSeconds
                ) *
                delta;
        }


        render();

        requestAnimationFrame(
            animate
        );
    };


    // ============================================================
    // RENDER
    // ============================================================


    const render = () => {

        plane.style.transform = `
            rotateX(${rotationX}deg)
            rotateY(${rotationY}deg)
            scale(${zoom})
        `;
    };


    // ============================================================
    // POINTER / TOUCH ROTATION
    // ============================================================


    plane.addEventListener(
        "pointerdown",
        event => {

            /*
             * Ignore extra fingers here.
             * Pinch is handled separately.
             */
            if (
                event.isPrimary ===
                false
            ) {
                return;
            }


            event.preventDefault();


            autoSpin =
                false;

            dragging =
                true;

            pointerId =
                event.pointerId;


            startX =
                event.clientX;

            startY =
                event.clientY;


            startRotationX =
                rotationX;

            startRotationY =
                rotationY;


            plane.classList.add(
                "dragging"
            );


            try {

                plane.setPointerCapture(
                    pointerId
                );

            } catch (_) {}
        }
    );


    plane.addEventListener(
        "pointermove",
        event => {

            if (
                !dragging ||
                event.pointerId !==
                    pointerId
            ) {
                return;
            }


            event.preventDefault();


            const dx =
                event.clientX -
                startX;

            const dy =
                event.clientY -
                startY;


            rotationY =
                startRotationY +
                dx * 0.5;


            if (
                verticalEnabled
            ) {

                rotationX =
                    startRotationX -
                    dy * 0.35;
            }
        }
    );


    const finishDrag = event => {

        if (
            !dragging
        ) {
            return;
        }


        if (
            event &&
            pointerId !== null &&
            event.pointerId !==
                pointerId
        ) {
            return;
        }


        dragging =
            false;

        plane.classList.remove(
            "dragging"
        );


        try {

            if (
                pointerId !== null &&
                plane.hasPointerCapture(
                    pointerId
                )
            ) {

                plane.releasePointerCapture(
                    pointerId
                );
            }

        } catch (_) {}


        pointerId =
            null;
    };


    plane.addEventListener(
        "pointerup",
        finishDrag
    );

    plane.addEventListener(
        "pointercancel",
        finishDrag
    );


    // ============================================================
    // MOUSE WHEEL ZOOM
    // ============================================================


    plane.addEventListener(
        "wheel",
        event => {

            if (
                !zoomEnabled
            ) {
                return;
            }


            event.preventDefault();


            const direction =
                event.deltaY < 0
                    ? 1
                    : -1;


            zoom +=
                direction * 0.1;


            zoom =
                Math.max(
                    0.6,
                    Math.min(
                        2.5,
                        zoom
                    )
                );
        },
        {
            passive: false
        }
    );


    // ============================================================
    // PINCH ZOOM
    // ============================================================


    let pinchDistance =
        null;

    let pinchZoom =
        1;


    const getDistance =
        touches => {

            const dx =
                touches[0].clientX -
                touches[1].clientX;

            const dy =
                touches[0].clientY -
                touches[1].clientY;


            return Math.hypot(
                dx,
                dy
            );
        };


    plane.addEventListener(
        "touchstart",
        event => {

            if (
                !zoomEnabled ||
                event.touches.length !==
                    2
            ) {
                return;
            }


            event.preventDefault();


            autoSpin =
                false;

            dragging =
                false;


            pinchDistance =
                getDistance(
                    event.touches
                );

            pinchZoom =
                zoom;
        },
        {
            passive: false
        }
    );


    plane.addEventListener(
        "touchmove",
        event => {

            if (
                !zoomEnabled ||
                event.touches.length !==
                    2 ||
                !pinchDistance
            ) {
                return;
            }


            event.preventDefault();


            const distance =
                getDistance(
                    event.touches
                );


            zoom =
                pinchZoom *
                (
                    distance /
                    pinchDistance
                );


            zoom =
                Math.max(
                    0.6,
                    Math.min(
                        2.5,
                        zoom
                    )
                );
        },
        {
            passive: false
        }
    );


    const finishPinch = event => {

        if (
            event.touches &&
            event.touches.length >= 2
        ) {
            return;
        }


        pinchDistance =
            null;
    };


    plane.addEventListener(
        "touchend",
        finishPinch,
        {
            passive: false
        }
    );

    plane.addEventListener(
        "touchcancel",
        finishPinch,
        {
            passive: false
        }
    );


    // ============================================================
    // START
    // ============================================================


    requestAnimationFrame(
        animate
    );

})();

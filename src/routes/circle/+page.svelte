<script lang="ts">
    import "../../app.css";
    import { onMount } from "svelte";
    let canvas: HTMLCanvasElement;
    let datas: any[];
    let mirror: boolean = false;
    let bumpClass = 0;

    function getRand(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    const isBassABumpin = (dataArray: any[]) => {
        if (dataArray[0] >= 250 && dataArray[1] >= 250) {
            if (dataArray[2] >= 250) {
                return 2;
            }
            return 1;
        }
        return 0;
    };
    const drawLine = (ctx: any, color: any, c1: any, c2: any) => {
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    const degToRad = (deg: number) => (deg * Math.PI) / 180;

    const getCoords = (cX: number, cY: number, r: number, a: number) => {
        return {
            x: cX + r * Math.cos(a),
            y: cY + r * Math.sin(a),
        };
    };

    onMount(() => {
        canvas.width = window.screen.width;

        const messageEl = document.getElementById("message");
        window.addEventListener("message", function (event: any) {
            if (
                event.srcElement.location.href == window.location.href &&
                event.data.type == "music"
            ) {
                //messageEl!.innerHTML = event.data.index;

                mirror = event.data.index != 0;
                datas = event.data.data;
                if (mirror) {
                    document.body.style.transform = "scaleX(-1)";
                }

                bumpClass = isBassABumpin(datas);

                // canvas.style.marginLeft =
                //     "-" +
                //     (
                //         event.data.index *
                //         (this.window.innerWidth / 2)
                //     ).toString() +
                //     "px";

                draw();
            }
        });

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        const ctx = canvas.getContext("2d")!;
        let minMag = 0;

        function draw() {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            // ctx.fillStyle = 'rgba(0, 0, 0, 0)'
            // ctx.fillRect(0, 0, WIDTH, HEIGHT)
            const gradient = ctx.createLinearGradient(0, HEIGHT, 0, 0);
            // Fill rectangle with gradient
            gradient.addColorStop(0, "blue");
            gradient.addColorStop(1, "purple");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            let radius = 50,
                cX = WIDTH / 2,
                cY = HEIGHT / 2;
            var minLenght = 45;

            for (let i = 0; i < minLenght; i++) {
                let mag = datas[i] / 128 + getRand(minMag, 5) * 0.02;

                let r = radius + 20,
                    angle = degToRad((i / minLenght) * 360) - 90,
                    c1 = getCoords(cX, cY, r, angle),
                    c2 = getCoords(cX, cY, r + mag * 30, angle),
                    c3 = getCoords(cX, cY, r + mag * 35, angle);

                ctx.lineWidth = 10;

                ctx.lineCap = "round";
                drawLine(ctx, "purple", c1, c3);
                drawLine(ctx, "white", c1, c2);
            }
        }
    });
</script>

<div class="w-screen h-screen flex justify-center items-center overflow-hidden">
    <canvas
        id="canvas"
        bind:this={canvas}
        class="bg-black {'bump-' + bumpClass}"
        width="400"
        height="400"
    ></canvas>
    <div class="absolute bggrid"></div>
</div>

<style>
    canvas {
        transition: all 100ms ease-in;
    }

    .bump-0 {
        transform: scale(1);
    }

    .bump-1 {
        transform: scale(1.1);
    }

    .bump-2 {
        transform: scale(1.3);
    }
</style>

<script lang="ts">
    import "../../app.css";
    import { onMount } from "svelte";
    let canvas: HTMLCanvasElement;
    let animationFrame: number;
    let datas: any[];

    onMount(() => {
        canvas.width = window.screen.width;

        const messageEl = document.getElementById("message");
        window.addEventListener("message", function (event: any) {
            if (
                event.srcElement.location.href == window.location.href &&
                event.data.type == "music"
            ) {
                //messageEl!.innerHTML = event.data.index;
                datas = event.data.data;
                canvas.style.marginLeft =
                    "-" +
                    (
                        event.data.index *
                        (this.window.innerWidth / 2)
                    ).toString() +
                    "px";

                draw();
            }
        });

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        const ctx = canvas.getContext("2d")!;

        function draw() {
            ctx.clearRect(0, 0, WIDTH, HEIGHT)
            // ctx.fillStyle = "rgba(255, 255, 255, 0)";
            // ctx.fillRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createLinearGradient(0, HEIGHT, 0, 0);
            // Fill rectangle with gradient
            gradient.addColorStop(0, "blue");
            gradient.addColorStop(1, "purple");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            ctx.lineWidth = 5;
            ctx.strokeStyle = "rgb(65, 105, 225)";
            ctx.beginPath();

            const sliceWidth = (canvas.width * 1.0) / datas.length;
            let x = 0;

            for (let i = 0; i < datas.length; i++) {
                const v = datas[i] / 128.0;
                const y = (v * canvas.height) / 2 - (window.innerHeight / 2);

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            // setTimeout(() => {
            //     animationFrame = requestAnimationFrame(draw);
            // }, 1000 / 24);
        }
    });
</script>

<div class="overflow-hidden h-screen max-h-screen w-screen bg-black">
    <p id="message"></p>
    <canvas bind:this={canvas} class="bg-transparent" width={800} height={500}
    ></canvas>
    <div class="absolute bggrid"></div>
</div>
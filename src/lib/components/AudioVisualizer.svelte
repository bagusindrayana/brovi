<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from "svelte";

    export let audioElement: HTMLAudioElement;
    export let play: boolean;
    export let clear: boolean;

    $: play && playVisualizer();
    $: !play && pauseVisualizer();
    $: clear && closeWindows();
    $: !clear && drawWindows();

    let canvas: HTMLCanvasElement;
    let animationFrame: number;
    let analyser: AnalyserNode | null = null;
    let alreadyDrawWindows: boolean = false;
    let windowBars: Window[] = [];
    let windowCircles: Window[] = [];

    const dispatch = createEventDispatcher();

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    function pauseVisualizer() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    }

    function closeWindows() {
        pauseVisualizer();
        for (let i = 0; i < windowCircles.length; i++) {
            const w = windowCircles[i];
            w.close();
        }
        for (let i = 0; i < windowBars.length; i++) {
            const w = windowBars[i];
            w.close();
        }
    }

    async function playVisualizer() {
        if (!audioElement || !canvas || !play) {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            return;
        }

        for (let i = 0; i < windowBars.length; i++) {
            const w = windowBars[i];
            w.focus();
        }

        for (let i = 0; i < windowCircles.length; i++) {
            const w = windowCircles[i];
            w.focus();
        }

        if (analyser == null) {
            const audioContext = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
            analyser = audioContext.createAnalyser();

            const source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        }

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;

        const dataArray = new Uint8Array(bufferLength);

        const ctx = canvas.getContext("2d")!;

        function getRand(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

        function draw() {
            if (canvas == null) return;
            const WIDTH = canvas.width;
            const HEIGHT = canvas.height;

            setTimeout(() => {
                animationFrame = requestAnimationFrame(draw);
            }, 1000 / 30);

            if (analyser != null) {
                analyser.getByteFrequencyData(dataArray);
            }

            ctx.fillStyle = "rgb(0, 0, 0)";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            const barWidth = (WIDTH / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            // var ammout = windowBars.length;
            // const startIndex = Math.floor((dataArray.length - ammout) / 2);
            //const centerValues = dataArray.slice(startIndex, startIndex + 10);
            dispatch("visual", dataArray);
            var offset = 3;
            for (let x = 0; x < windowBars.length; x++) {
                const w = windowBars[x];
                w.resizeTo(150, dataArray[x + offset] * 2);
                w.moveTo(
                    x * 175,
                    window.screen.height - (dataArray[x + offset] * 1) / 2,
                );
                //send data to pop up windo
                w.postMessage(
                    {
                        type: "music",
                        data: dataArray,
                        index: x,
                    },
                    "*",
                );
                offset += 3;
            }

            for (let x = 0; x < windowCircles.length; x++) {
                const w = windowCircles[x];
                //const scaleOffset = (Math.round(dataArray[5]/5));
                
                // w.moveTo(
                //     x * 175,
                //     window.screen.height - (dataArray[x + offset] * 1) / 2,
                // );
                w.postMessage(
                    {
                        type: "music",
                        data: dataArray,
                        index: x,
                    },
                    "*",
                );
            }

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] * 1;
                const gradient = ctx.createLinearGradient(
                    0,
                    HEIGHT,
                    0,
                    HEIGHT - barHeight,
                );
                gradient.addColorStop(0, "#ff6b6b");
                gradient.addColorStop(0.5, "#4ecdc4");
                gradient.addColorStop(1, "#45b7d1");

                ctx.fillStyle = gradient;
                ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        }

        draw();
    }

    async function drawWindows() {
        if (alreadyDrawWindows) return;
        closeWindows();
        await delay(500);
        windowBars = [];
        windowCircles = [];
        const barWidth = 150;
        var ammout = Math.round(window.screen.width / barWidth) - 2;
        alreadyDrawWindows = true;

        let circle1 = window.open(
            "/circle",
            "",
            "width=400,height=400,toolbar=no,titlebar=no,menubar=no",
        );
        if (circle1) {
            circle1.moveTo(50, 100);
            windowCircles.push(circle1);
        }

        await delay(300);
        let circle2 = window.open(
            "/circle",
            "",
            "width=400,height=400,toolbar=no,titlebar=no,menubar=no",
        );
        if (circle2) {
            circle2.moveTo(window.screen.width - 450, 100);
            windowCircles.push(circle2);
        }

        await delay(300);

        var x = 0;
        for (let i = 0; i < ammout; i++) {
            let myWindow = window.open(
                "/bar",
                "",
                "width=" +
                    barWidth +
                    ",height=200,toolbar=no,titlebar=no,menubar=no",
            );

            await delay(300);
            if (myWindow != null) {
                myWindow.resizeTo(barWidth, 200);
                myWindow.moveTo(x, window.screen.height);
                windowBars.push(myWindow);
                x += 175;

                console.log("WINDOW : ", i);
            } else {
                await dispatch("ready", false);
                await dispatch("popuperror", true);
                alert(
                    "Please allow all popups and try again : close all previous popups manually after allow all popups",
                );
                break;
            }
        }

        await dispatch("ready", true);
    }

    // onMount(() => {

    //   return () => {
    //     if (animationFrame) {
    //       cancelAnimationFrame(animationFrame);
    //     }
    //     audioContext.close();
    //   };
    // });

    onDestroy(() => {
        pauseVisualizer();
        closeWindows();
        analyser = null;
    });
</script>

<!-- svelte-ignore element_invalid_self_closing_tag -->

<div class="w-full relative">
    <canvas
        bind:this={canvas}
        class="w-full h-64 rounded-lg bg-black"
        width={800}
        height={256}
    />

    <div class="absolute bggrid"></div>
</div>

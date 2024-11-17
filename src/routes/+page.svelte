<script lang="ts">
    import "../app.css";
    import { onMount } from "svelte";
    import { Music2, Upload, CircleX } from "lucide-svelte";
    import AudioVisualizer from "$lib/components/AudioVisualizer.svelte";
    import PlayPauseButton from "$lib/components/PlayPauseButton.svelte";

    let audioElement: HTMLAudioElement;
    let fileInput: HTMLInputElement;
    let isPlaying = false;
    let currentFile: string | null = null;
    let error = "";
    let hasFile = false;
    let songInfo: any = null;
    let clear: boolean = true;
    let visualReady: boolean = false;

    onMount(() => {});

    function initAudio() {
        if (audioElement != null) audioElement.remove();
        audioElement = new Audio();
        audioElement.crossOrigin = "anonymous";

        audioElement.addEventListener("play", () => {
            isPlaying = true;
        });

        audioElement.addEventListener("pause", () => {
            isPlaying = false;
        });

        audioElement.addEventListener("ended", () => {
            isPlaying = false;
        });
    }

    async function selectSampleMusic(url: string) {
        if (url == null) return;
        initAudio();
        clear = false;
     
        const jsmediatags = (window as any).jsmediatags;
        jsmediatags.read(url, {
            onSuccess: function (tag: any) {
                if (tag.tags.title != undefined && tag.tags.title != "") {
                    songInfo = {
                        title: tag.tags.title,
                        artist: tag.tags.artist,
                        album: tag.tags.album,
                    };
                } else {
                    songInfo = {
                        title: url.split("/").pop(),
                        artist: url.split(".").pop(),
                    };
                }
            },
            onError: function (error: any) {
                console.log(error);
                songInfo = {
                    title: url.split("/").pop(),
                    artist: url.split(".").pop(),
                };
            },
        });

        audioElement.src = url;
        hasFile = true;
        currentFile = url;
    }

    async function handleFileSelect(event: Event) {
        initAudio();
        clear = false;
        const jsmediatags = (window as any).jsmediatags;
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            if (!file.type.startsWith("audio/")) {
                error = "Please select an audio file";
                return;
            }

            error = "";
            if (currentFile) {
                URL.revokeObjectURL(currentFile);
            }

            jsmediatags.read(file, {
                onSuccess: function (tag: any) {
                    if (tag.tags.title != undefined && tag.tags.title != "") {
                        songInfo = {
                            title: tag.tags.title,
                            artist: tag.tags.artist,
                            album: tag.tags.album,
                        };
                    } else {
                        songInfo = {
                            title: file.name,
                            artist: file.type,
                        };
                    }
                },
                onError: function (error: any) {
                    console.log(error);
                    songInfo = {
                        title: file.name,
                        artist: file.type,
                    };
                },
            });

            currentFile = URL.createObjectURL(file);
            audioElement.src = currentFile;
            hasFile = true;
        }
    }

    function togglePlayPause() {
        if (audioElement.paused) {
            audioElement.play();
        } else {
            audioElement.pause();
        }
    }

    function clearAll() {
        if(audioElement){
            audioElement.pause();
        }
        hasFile = false;
        songInfo = null;
        visualReady = false;
        clear = true;
        isPlaying = false;

        setTimeout(() => {
            currentFile = null;
            if(audioElement){
                audioElement.remove();
            }
        }, 100);
    }
</script>

<svelte:head>
    <title>Freeze your computer with audio window browser visualizer</title>
</svelte:head>
<div
    class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8"
>
    <div class="max-w-4xl mx-auto">
        {#if currentFile == null}
            <div class="text-center mb-12">
                <div class="flex items-center justify-center mb-4">
                    <Music2 class="w-12 h-12 text-purple-400" />
                </div>
                <h1
                    class="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
                >
                    Browser Visualizer
                </h1>
                <p class="text-gray-400">
                    Use multiple window popup to visualize audio
                </p>
            </div>
            <div
                class="flex gap-2 mb-4 text-xs justify-center items-center text-center"
            >
                <p>Sample</p>
                <p>:</p>
                <button
                    class="rounded-full bg-gray-400 px-2 py-1"
                    on:click={() => {
                        selectSampleMusic(
                            window.location.href +
                                "sample/Symphony no. 5 in Cm, Op. 67 - I. Allegro con brio.mp3",
                        );
                    }}
                >
                    Symphony no. 5 in Cm, Op. 67 - I. Allegro con brio
                </button>
                <button
                    class="rounded-full bg-gray-400 px-2 py-1"
                    on:click={() => {
                        selectSampleMusic(
                            window.location.href +
                                "sample/Paul Pitman - Moonlight Sonata Op. 27 No. 2 - III. Presto.mp3",
                        );
                    }}
                >
                    Paul Pitman - Moonlight Sonata Op. 27 No. 2 - III. Presto
                </button>
                <button
                    class="rounded-full bg-gray-400 px-2 py-1"
                    on:click={() => {
                        selectSampleMusic(
                            window.location.href +
                                "sample/HXI - Lock n' Load - NCS.weba",
                        );
                    }}
                >
                    HXI - Lock n' Load - NCS
                </button>
            </div>
        {/if}
        <div class="mb-8">
            <label
                class="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-800 border-2 border-gray-700 border-dashed rounded-lg hover:border-purple-500 hover:bg-gray-800/50 relative"
            >
                {#if songInfo != null && hasFile}
                    <div
                        class="flex flex-col items-center justify-center pt-5 pb-6"
                    >
                        <p class="mb-2 text-xs text-gray-400">
                            {songInfo.title}
                        </p>
                        <p class="text-sm text-gray-400">
                            {songInfo.artist}
                        </p>
                        <button on:click={clearAll}>
                            <CircleX class="w-8 h-8 mb-3 text-gray-400" />
                        </button>
                    </div>
                {:else}
                    <div
                        class="flex flex-col items-center justify-center pt-5 pb-6"
                    >
                        <Upload class="w-8 h-8 mb-3 text-gray-400" />
                        <p class="mb-2 text-sm text-gray-400">
                            <span class="font-semibold">Click to upload</span> or
                            drag and drop
                        </p>
                        <p class="text-xs text-gray-400">MP3, WAV, or OGG</p>
                    </div>
                {/if}

                {#if clear && currentFile == null}
                    <input
                        id="audio-file"
                        type="file"
                        accept="audio/*"
                        class="w-full top-0 left-0 right-0 bottom-0 block absolute cursor-pointer"
                        bind:this={fileInput}
                        on:change={handleFileSelect}
                    />
                {/if}
            </label>
            {#if error}
                <p class="mt-2 text-red-400 text-sm">{error}</p>
            {/if}
        </div>

        <div class="relative">
            {#if hasFile}
                <AudioVisualizer
                    {audioElement}
                    play={isPlaying}
                    {clear}
                    on:ready={(v) => {
                        visualReady = v.detail == true;
                    }}
                    on:popuperror={(v)=>{
                        if(v.detail == true){
                            clearAll();
                        }
                    }}
                />
                {#if visualReady}
                    <div
                        class="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    >
                        <PlayPauseButton
                            {isPlaying}
                            onClick={togglePlayPause}
                        />
                    </div>
                {/if}
            {/if}
        </div>

        {#if !hasFile}
            <div class="mt-8 text-center text-gray-400">
                <p>
                    No visualization yet. Select an audio file to get started!
                </p>
                <p class="text-yellow-500">
                    Warning : to show viasualizer using window popup please accept &
                    allow all popup
                </p>
                <p class="text-red-500">
                    Danger : multiple window popup will show and will likely
                    freeze your computer
                </p>
                <p class="text-yellow-500">Warning : only work on desktop</p>
            </div>
        {:else}
            <div class="mt-4 text-center text-gray-400">
                <p class="text-yellow-500">
                    Warning : to show viasualizer using window popup please accept &
                    allow all popup
                </p>
                <p class="text-yellow-500">
                    Warning : dont hover to browser icon in toolbar or browser
                    preview will freeze
                </p>
                <p class="text-yellow-500">
                    Warning : click close button below song/file name to close all popup window
                </p>
            </div>
        {/if}
    </div>
    <div class="fixed left-0 right-0 text-center bottom-2 text-gray-400 block mx-auto">
       <a href="https://github.com/bagusindrayana/brovi" target="_blank">&copy; bagusindrayana</a>
    </div>
</div>

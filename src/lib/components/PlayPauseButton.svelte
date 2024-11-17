<script lang="ts">
    import { Play, Pause } from 'lucide-svelte';
  
    export let isPlaying: boolean;
    export let onClick: () => void;
  </script>
  
  <button
    on:click={onClick}
    class="relative group bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
    aria-label={isPlaying ? 'Pause' : 'Play'}
  >
    <div class="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
    {#if isPlaying}
      <Pause class="w-8 h-8 text-white" />
    {:else}
      <Play class="w-8 h-8 text-white translate-x-0.5" />
    {/if}
  </button>
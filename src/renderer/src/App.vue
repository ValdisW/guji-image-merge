<script setup lang="ts">
const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <div class="actions">
    <div class="action">
      <button target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</button>
    </div>
  </div>
</template>

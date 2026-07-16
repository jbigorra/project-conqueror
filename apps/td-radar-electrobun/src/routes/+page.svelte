<script lang="ts">
  import { onMount } from "svelte";
  import { type BunRpcClient, getBunRpc } from "$lib/views/hooks/webview-rpc";
  import { storedProjectsRepository } from "$lib/views/repositories/stored-projects.repo";

  let storedProjects = $state<string[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let bunRpc: BunRpcClient | null = null;

  onMount(async () => {
    bunRpc = await getBunRpc();
    storedProjects = await storedProjectsRepository.getAll();
  });

  async function openRepoFolder() {
    if (!bunRpc) return;
    loading = true;
    error = null;
    try {
      const path = await bunRpc.request.openFolderDialog();
      if (!path) return; // user cancelled the dialog
      await storedProjectsRepository.addProject(path);
      storedProjects.push(path);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <div class="container">
    <h1>Project Conqueror</h1>
    <p class="subtitle">Select a repository folder to analyse</p>

    <div class="card picker">
      <button
        class="primary"
        onclick={openRepoFolder}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Selecting…" : "Open Repository Folder"}
      </button>

      {#if storedProjects.length > 0}
        {#each storedProjects as project}
          <p class="path">📁 {project}</p>
        {/each}
      {/if}

      {#if error}
        <p class="error">Error: {error}</p>
      {/if}
    </div>
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(135deg, #ff3e00 0%, #ff6b35 100%);
    display: grid;
    place-items: center;
  }

  .container {
    text-align: center;
  }

  h1 {
    color: white;
    font-size: 3rem;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.25rem;
    margin-top: 0;
    margin-bottom: 40px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  button {
    padding: 14px 32px;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button.primary {
    background: #ff3e00;
    color: white;
    box-shadow: 0 2px 4px rgba(255, 62, 0, 0.3);
  }

  button.primary:hover:not(:disabled) {
    background: #e63600;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(255, 62, 0, 0.4);
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .path {
    margin-top: 16px;
    color: #555;
    font-family: "Monaco", "Menlo", monospace;
    font-size: 0.9rem;
    word-break: break-all;
  }

  .error {
    margin-top: 12px;
    color: #d32f2f;
    font-size: 0.85rem;
    font-family: "Monaco", "Menlo", monospace;
  }
</style>

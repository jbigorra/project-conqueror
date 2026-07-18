<script lang="ts">
  import { Button, Column } from "carbon-components-svelte";
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

<Column>
  <div class="container">
    <h1>TD Radar</h1>
    <p class="subtitle">Select a repository folder to analyse</p>

    <div class="card picker">
      <Button onclick={openRepoFolder} disabled={loading} aria-busy={loading}>
        {loading ? "Selecting…" : "Open Repository Folder"}
      </Button>
    </div>
    <div class="projects-container">
      {#if storedProjects.length > 0}
        {#each storedProjects as project}
          <a href="/project/{project.split('/').pop()}">
            <div class="card picker flexbox">📁 {project.split("/").pop()}</div>
          </a>
        {/each}
      {/if}

      {#if error}
        <p class="error">Error: {error}</p>
      {/if}
    </div>
  </div>
</Column>

<style>
</style>

<script lang="ts">
  import {
    Button,
    ClickableTile,
    Column,
    InlineNotification,
    Row,
  } from "carbon-components-svelte";
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

<Row padding>
  <Column sm={16} max={16}>
    <Button onclick={openRepoFolder} disabled={loading} aria-busy={loading}>
      {loading ? "Selecting…" : "Select Repository Folder"}
    </Button>
    {#if error}
      <InlineNotification
        title="Error:"
        subtitle={error}
        on:close={() => (error = null)}
      />
    {/if}
  </Column>
  <Column sm={16} max={16}>
    <Row>
      {#if storedProjects.length > 0}
        {#each storedProjects as project}
          <Column sm={16} md={4} lg={4} xlg={4} max={4}>
            <ClickableTile
              class="clickable-tile"
              href="/project/{project.split('/').pop()}"
            >
              {project.split("/").pop()}
            </ClickableTile>
          </Column>
        {/each}
      {/if}
    </Row>
  </Column>
</Row>

<style>
  :global(.clickable-tile) {
    min-height: 150px;
    box-shadow: 1px 1px 1px #000;
    &:hover {
      box-shadow: inset 1px 1px 1px #000;
    }
  }
</style>

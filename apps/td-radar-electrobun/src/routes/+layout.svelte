<script lang="ts">
  import {
    Breadcrumb,
    BreadcrumbItem,
    Column,
    Content,
    Grid,
    Header,
    Row,
  } from "carbon-components-svelte";
  import "carbon-components-svelte/css/g80.css";
  import { page } from "$app/state";

  let { children } = $props();

  let isSideNavOpen = $state(false);
  let getSanitizedPaths = () => {
    const isHomePage = page.url.pathname === "/";
    if (isHomePage) return [""];
    return page.url.pathname.split("/");
  };
  let breadcrumbItems = $derived(
    getSanitizedPaths().map((segment, index, paths) => {
      return {
        href: `/${segment}`,
        text:
          index === 0
            ? "Home"
            : segment.charAt(0).toUpperCase() + segment.slice(1),
        active: index === paths.length - 1,
      };
    }),
  );
</script>

<Header companyName="" platformName="TD Radar" bind:isSideNavOpen>
  <Breadcrumb>
    {#each breadcrumbItems as item}
      <BreadcrumbItem href={item.href} isCurrentPage={item.active}>
        {item.text}
      </BreadcrumbItem>
    {/each}
  </Breadcrumb>
</Header>
<Content>
  <Grid>
    <Row>
      <Column>
        {@render children()}
      </Column>
    </Row>
  </Grid>
</Content>

<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<main>
  <div class="container">
    <h1>About</h1>
    <p>This is the about page demonstrating hash routing in Electrobun + SvelteKit!</p>

    <div class="card">
      <h2>SvelteKit Routing</h2>
      <p>
        This demonstrates SvelteKit's file-based routing working in a desktop app:
      </p>
      <ul>
        <li><code>/</code> - Home page</li>
        <li><code>/about</code> - This page</li>
      </ul>
    </div>

    <div class="button-group">
      <button onclick={() => goto('/')}>← Back to Home</button>
    </div>
  </div>
</main>

<style>
  main {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  }

  h1 {
    margin-bottom: 40px;
  }

  p {
    color: rgba(255, 255, 255, 0.9);
  }

  .card h2 {
    color: var(--color-primary);
  }

  .card p, .card li {
    color: var(--color-text);
  }

  code {
    color: var(--color-primary);
  }

  .button-group {
    justify-content: center;
    margin-top: 30px;
  }

  button {
    background: var(--color-white);
    color: var(--color-primary);
    box-shadow: 0 2px 4px var(--shadow-primary);
  }

  button:hover {
    background: #f5f5f5;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px var(--shadow-primary-hover);
  }
</style>

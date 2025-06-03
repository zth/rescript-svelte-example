<script lang="typescript">
  let year = 2025;
  let names = ["John", "Jane", "Jim", "Jill"];
</script>

<div>Hello! It's year {year}</div>

<div>
  <h3>Names:</h3>
  <ul>
    {#each names as name}
      <li>{name}</li>
    {/each}
  </ul>
</div>

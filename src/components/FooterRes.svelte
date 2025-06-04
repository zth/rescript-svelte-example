<script lang="res">
  %%raw(`import ResCompDisplayer from "./ResCompDisplayer.svelte"`);
  let year = 2023
  let names = ["John", "Jane", "Jim", "Jill"]->Array.map(n => `${n} ${n}`)
  let someVar = Cnstns.x
</script>

<div>Hello! It's year {year}</div>

<div>
  <h3>Names:</h3>
  <ul>
    {#each names as name}
      <li>{name} {someVar}</li>
    {/each}
  </ul>
</div>

<ResCompDisplayer />
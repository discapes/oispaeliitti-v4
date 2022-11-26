<script lang="ts">
	export let data: Record<string, unknown>[];

	const headers = Array.from(new Set(data.flatMap(Object.keys)));
	const rows = data.map((entry) => headers.map((h) => entry[h]));
</script>

<table>
	<tr>
		{#each headers as key}
			<th>{key}</th>
		{/each}
	</tr>
	{#each rows as row}
		<tr>
			{#each row as value}
				<td class:bg-stone-700={value == null}>{value ?? ''}</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
	table tr td,
	table tr th {
		padding: 10px;
		border: white solid 1px;
		border-width: 1px;
	}
	table {
		border: white solid 1px;
		border-width: 1px;
		padding: 5px;
	}
</style>

<script lang="ts">
	export let name: string;
	export let value: string | number;
	export let action: string;
</script>

<form class="flex border rounded pr-1" method="POST" {action}>
	<input type="text" {name} class="bg-transparent outline-none p-2 w-full" {value} />
	<input type="submit" class="cursor-pointer" value="💾" />
</form>

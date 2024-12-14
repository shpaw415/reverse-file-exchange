import { test } from "bun:test";
import { $ } from 'bun';


test("server and request", async () => {
    const serve = (await import("./server")).default;
    serve();
    (await $`bun client/index.ts --test`).text();

});
import { test, expect, beforeAll } from "bun:test";
import { $ } from 'bun';
import serve from "./server";
import type { optionTypes } from "./client/types";
import { rm, rmSync } from "fs";

const clientPath = "out/client";

function Spawn(arg: optionTypes) {
    const argsParsed = (Object.keys(arg) as Array<keyof optionTypes>).map((e) => [`--${e}`, arg[e] || ""]).reduce((p, n) => [...p, ...n], []) as string[];
    const { stdout, stderr } = Bun.spawnSync({
        cmd: [clientPath, ...argsParsed],
        stderr: "pipe",
        stdout: "pipe"
    });
    const err = stderr.toString("utf-8");
    err && console.log(err);
    return stdout.toString("utf-8");
}

beforeAll(async () => {
    await $`bun build:client`;
    serve();
});

test("Test connection", async () => {
    const res = Spawn({ test: undefined });
    console.log(res);
    expect(res.replace("\n", "").endsWith("Server ok"), "connection error").toBe(true);
});

test("Test download", async () => {
    Spawn({ download: "download.test.txt" });
    expect(await Bun.file("download.test.txt").exists()).toBe(true);
    rm("download.test.txt", () => { });
});

test("Test upload file", async () => {
    Spawn({ upload: "./test/upload.test.txt" });
    const pathToTestFileSplited = Array.from(new Bun.Glob("**").scanSync({ cwd: "./upload", absolute: true })).at(0)?.split("/");
    pathToTestFileSplited?.pop();
    const pathToTestFile = pathToTestFileSplited?.join("/");
    expect(pathToTestFile).toBeString();
    if (pathToTestFile) rmSync(pathToTestFile, { force: true, recursive: true });
});

test("Upload Directory", async () => {
    Spawn({ upload: "./test/dir" });
    const pathToTestFileSplited = Array.from(new Bun.Glob("**").scanSync({ cwd: "./upload", absolute: true })).map((e) => {
        const n = e.split("/");
        while (n.at(-2) != "upload") n.pop();
        return n.join("/");
    });
    expect(pathToTestFileSplited.length).toBeGreaterThan(1);
    for (const path of pathToTestFileSplited) rmSync(path, { force: true, recursive: true });
});

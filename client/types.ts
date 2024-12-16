import type { BunFile } from "bun";

export type optionTypes = Partial<{
    upload: string,
    download: string,
    test: void
}>;

export type UpType = {
    type: "dir" | "file";
    file: BunFile
};
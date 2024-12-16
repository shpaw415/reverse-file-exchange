import { program } from "commander";
import type { ActionType } from "../types";
import { lstatSync, createWriteStream, rmSync } from "fs";
import tar from "tar-fs";
import type { optionTypes, UpType } from "./types";
import { randomString } from "../utils";
import type { BunFile } from "bun";

const accessKey = process.env.ACCESS_KEY as string;
const ServerAddr = process.env.ADDR as string;

const cleanUps: Array<Function> = [];

if (!accessKey || !ServerAddr)
    CloseWithMessage({
        accessKey: accessKey ? "*****" : undefined,
        ServerAddr,
        message: "not correcly set"
    });

program
    .option("-u, --upload <FilePath>", "Upload file to Server")
    .option("-d, --download <FileName>", "Download fileName")
    .option("-t, --test", "test connection");
program.parse(process.argv);
const options = program.opts<optionTypes>();

const header = {
    "access-key": accessKey
};

for await (const key of Object.keys(options) as Array<keyof optionTypes>) {
    let formData: FormData;
    switch (key) {
        case "download":
            formData = new FormData();
            formData.append("action-type", "file-download" as ActionType);
            formData.append("file" as ActionType, options.download as string)
            const res = await fetch(ServerAddr, {
                method: "POST",
                body: formData,
                headers: header
            });
            if (!res.ok) {
                CloseWithMessage({
                    message: "Error on request",
                    res,
                });
            }
            await Bun.write("./" + options.download as string, res);
            break;
        case "upload":
            formData = new FormData();
            const fileWithType = await PrepareUpload();

            formData.append("action-type", "file-upload" as ActionType);
            formData.append("file", fileWithType.file);
            formData.append("upload-type", fileWithType.type);

            console.log("Status:", (await fetch(ServerAddr, {
                method: "POST",
                body: formData,
                headers: header
            })).status);
            break;
        case "test":
            formData = new FormData();
            formData.append("action-type", "test" as ActionType);
            console.log(`Server-addr: ${ServerAddr}`, await (await fetch(ServerAddr, {
                method: "POST",
                body: formData,
                headers: header
            })).text());
            break;
    }
}

function PrepareUpload(): Promise<UpType> | UpType {
    const filePath = options.upload as string;
    const state = lstatSync(filePath);
    const name = `tmp-${randomString(5)}.tar`;
    if (state.isDirectory()) {
        cleanUps.push(() => rmSync(name));
        return new Promise<UpType>((resolve) => {
            const stream = tar.pack(filePath).pipe(createWriteStream(name));
            stream.on("finish", () => {
                const f = Bun.file(name);
                resolve({ type: "dir", file: f });
            });
        });
    }
    return { file: Bun.file(filePath), type: "file" };
}




function CloseWithMessage(message: any) {
    console.log(message);
    process.exit(1);
}

/**
 * cleanup when finished
 */
for await (const func of cleanUps) await func();
import { normalize } from "path";
import type { ActionType } from "../types";
import type { UpType } from "../client/types";
import tar from 'tar-fs';
import { randomString } from "../utils";
import { createReadStream, rmSync } from 'fs';
import { $ } from "bun";

const Port = structuredClone(process.env.PORT || "4444");

function Serve() {
    return Bun.serve({
        port: parseInt(Port),
        maxRequestBodySize: 1024 * 1024 * 2000,
        async fetch(request, server) {
            const header = request.headers;
            if (request.url.endsWith("/client")) return new Response(Bun.file("out/client"));
            if (!ConfirmAccessKey(header)) return new Response("missing access-key");
            return MakeAction(request);
        }
    });
}

function FilePathToFileName(file: File) {
    return file.name.split("/").pop() as string;
}

async function MakeAction(request: Request): Promise<Response> {
    const form = (await request.formData());
    switch (form.get("action-type") as ActionType | null) {
        case "file-upload":
            const file = form.get("file") as File | null;
            if (!file) return new Response("No file");
            const upType = form.get("upload-type") as UpType["type"];
            const dateName = `${(await $`bun ./utils/create-time.ts`.text()).replace("\n", "")}-${randomString(2)}`;
            const upDirPath = `upload/${dateName}`;
            const upFilePath = `${upDirPath}/${normalize(FilePathToFileName(file))}`;

            await Bun.write(upFilePath, file);
            switch (upType) {
                case "dir":
                    await new Promise<boolean>((resolve) =>
                        createReadStream(upFilePath).pipe(
                            tar.extract(`${upDirPath}`).addListener("finish", () => resolve(true))
                        )
                    );
                    rmSync(upFilePath);
                    break;
            }
            break;
        case "file-download":
            const fileName = form.get("file")?.toString();
            if (!fileName) return new Response("No file specified");
            const filePath = normalize("download/" + normalize(fileName));
            const Bunfile = Bun.file(filePath);
            console.log(filePath, await Bunfile.exists());

            return new Response(Bunfile);
        case "test":
            return new Response("Server ok");
        default:
            return new Response("action does not exists");
    }
    return new Response("no Action specified");
}

function ConfirmAccessKey(headers: Request["headers"]) {
    const accessKey = headers.get("access-key");
    if (!accessKey || accessKey != process.env.ACCESS_KEY) return false;
    return true;
}

export default Serve;
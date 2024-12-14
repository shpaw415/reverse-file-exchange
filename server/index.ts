import { normalize } from "path";
import type { ActionType } from "../types";

function Serve() {
    return Bun.serve({
        port: parseInt(process.env.PORT || "4444"),
        maxRequestBodySize: 1024 * 1024 * 2000,
        async fetch(request, server) {
            const header = request.headers;
            if (!ConfirmAccessKey(header)) return new Response("missing access-key");
            return MakeAction(request);
        },
    });
}


async function MakeAction(request: Request): Promise<Response> {
    const form = (await request.formData());
    switch (form.get("action-type") as ActionType | null) {
        case "file-upload":
            const file = form.get("file") as File | null;
            if (!file) return new Response("No file");
            await Bun.write(`upload/${normalize(file.name)}`, file);
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
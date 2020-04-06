---
title: Install bitwarden-rs on uberspace
tags: [uberspace, selfhosted, bitwarden, rust]
---

![bitwarden x uberspace](/img/2019/01/bitwarden-uberspace.jpg)

[Bitwarden](https://bitwarden.com/) is a great open source password manager. Your vault is encrypted with your master key, so even if someone hacks into the Bitwarden Servers (which are hosted on Microsoft Azure), they will only get some unreadable gibberish. If your master password is strong, you should be save.

If you are paranoid about the server security and want to be in full control, or want the premium features for free because you have a webspace anyway, you can self-host Bitwarden.

Bitwarden provides docker containers, but they are big and difficult to install. Uberspace is a web hoster for command line enthusiasts, and while it supports nearly everything, [docker isn't](https://wiki.uberspace.de/faq#docker). 

In this tutorial, we will use a Rust implementation of the bitwarden api. You can check the project out on GitHub: [https://github.com/dani-garcia/bitwarden_rs](https://github.com/dani-garcia/bitwarden_rs)

<!--truncate-->

## Prerequisites

- [Uberspace 7](https://uberspace.de)
- Basic understanding of the command line (the command begins *after *the $ sign)
- A subdomain configured correctly (see [here](https://manual.uberspace.de/web-domains.html#web-domains)), e.g. vault.yourdomain.com

## Installing Rust

To compile the project, we need to [install the rust toolchain](https://rustup.rs/).

install via rustup:
`~$ curl https://sh.rustup.rs -sSf | sh`

press *2* to customize the installation. You can press enter for the host triple to use the default one. When asked for the toolchain, type *nightly*, as this is required for *bitwarden-rs*. Add rust to the *PATH* by pressing *y*.

Then, proceed with the installation.

To finish the setup, logout and login again or run `~$ source $HOME/.cargo/env`.

## Install Bitwarden-rs

clone the project:
`~$ git clone https://github.com/dani-garcia/bitwarden_rs.git`

to build *bitwarden-rs*, you'll need to set an environment variable pointing to the sqlite3 header files:
`~$ export SQLITE3_LIB_DIR=/var/lib64`

cd into the project:
`~$ cd bitwarden_rs`

build the server executable:
`~/bitwarden_rs $ cargo build --release --features sqlite`

if that doesn't work the first time, just try again.

now, we will have to download the newest build (check this page for the newest build number and replace it in the following snippet: [https://github.com/dani-garcia/bw_web_builds/releases](https://github.com/dani-garcia/bw_web_builds/releases)):

    ~/bitwarden_rs $ mkdir web-vault && cd web-vault
    ~/bitwarden_rs/web-vault $ wget https://github.com/dani-garcia/bw_web_builds/releases/download/v2.11.0/bw_web_v2.11.0.tar.gz
    ~/bitwarden_rs/web-vault $ tar -xvzf bw_web_v2.11.0.tar.gz
    

After that, go back to the project folder:
`~/bitwarden_rs/web-vault $ cd ..`

We need to add a *.env*-file.

`~/bitwarden_rs $ nano .env`

add this:

    ADMIN_TOKEN=CHuPAsoYgykByUpqVrjRYG/MeYO+jdnmZskgTsBa9kj2MnP7QrQ0GelJ7Lqixph8 # generate one with ~$ openssl rand -base64 48
    ROCKET_PORT=62714 # your port here
    
    SMTP_HOST=yourhost.uberspace.de
    SMTP_FROM=noreply@vault.yourdomain.com
    SMTP_PORT=587
    SMTP_SSL=true
    SMTP_USERNAME=vault@yourdomain.com
    SMTP_PASSWORD=yourpassword
    

`SMTP_USERNAME` and `SMTP_PASSWORD` must be the login data from a valid uberspace mail account (`SMTP_FROM` must be correct too). You can also use a mail account from another service, like GMail. Alter the values like the port accordingly.

Press `CTRL+O` to save, and `CTRL+X` to exit.

You can edit other options, look into `.env.template` to see a list of available options.

Now, we just have to add a redirection to the port:

    ~/bitwarden_rs $ uberspace web backend set / --http --port 62714
    

If you want to use a subdomain, read more about web backends in the uberspace wiki: [https://manual.uberspace.de/web-backends.html#specific-domain](https://manual.uberspace.de/web-backends.html#specific-domain)

Now it's time to test if everything works:
`~/bitwarden_rs $ target/release/bitwarden_rs`

If there is no error, you are good to go. You should be able to access your vault on yourdomain.com.

## Auto start and run in background

We will use supervisord to run the server and automatically restart it on crash.

Create a new file for your service: `~$ touch ~/etc/services.d/bitwarden_rs.ini` with the following content:

    [program:bitwarden_rs]
    directory=/home/YOURUSERNAME/bitwarden_rs
    command=/home/YOURUSERNAME/bitwarden_rs/target/release/bitwarden_rs
    autostart=yes
    autorestart=yes

Add the service to supervisor:

    ~$ supervisorctl reread
    ~$ supervisorctl update
    ~$ supervisorctl start bitwarden_rs

Now the server should be running again.

## Updating

Updating bitwarden is really easy. Just stop the server, pull everything and download the new web vault, build the executable and start the server again:

    ~/bitwarden_rs $ supervisorctl stop bitwarden_rs
    ~/bitwarden_rs $ git pull
    ~/bitwarden_rs $ mv web-vault web-vault.old && mkdir web-vault && cd web-vault
    ~/bitwarden_rs/web-vault $ wget new-release.tar.gz
    ~/bitwarden_rs/web-vault $ tar -xvzf new-release.tar.gz
    ~/bitwarden_rs/web-vault $ cd ..
    ~/bitwarden_rs $ cargo build --release
    ~/bitwarden_rs $ supervisorctl start bitwarden_rs

---
date: 'Wed Feb 13 2019 00:20:00 GMT+0530 (India Standard Time)'
title: Notes from Overthewire Bandit
showcase: false
tags:
  - Hacking
  - Wargames
  - Ctf
---



I solved the [Bandit](http://overthewire.org/wargames/bandit/) wargame by Overthewire over the last few days, and noted down anything new // interesting I learned. This is not a writeup in any way, you’re not likely to find solutions to specific questions here. This is more like study notes, mostly for me to come back to it later. That being said, I’m hoping it’ll help you in some way too. 

## Stuff I learnt

- man page vs the help command — `help` is a feature of bash shell, it documents some `bash` commands, and is available in bash only. Whereas `man` is more general, and is a native feature of all Unix or Unix-like operating systems.
- We can use dash (-) in Linux as an alias of `stdin` or `stdout`, whereas the standard way to do it would be using `/dev/stdin` and `/dev/stdout`. To use files named dash, either of the following can be used.

  - Specify the filename relative to current directory. `$ cat ./-`
  - Bash redirection. `$ cat < - `
- Some interesting Unix commands.

  - `file`, `find`, `xargs`, `grep` and piping between them to look for interesting files.
  - `sort` and `uniq`, for getting unique lines in a text file.
  - `strings` for searching for strings in binary files.
  - `base64` to encode or decode Base64.
  - `tr 'A-Za-z' 'N-ZA-Mn-za-m'` for _ROT13_, or any suitable variation of the command for any form of the ROT encryption. Obviously, it can be used for other sorts of substitution, such as  `tr '[:upper:]' '[:lower:]` will convert uppercase to lowercase.
  - `gzip`, `bzip2` and the `tar` are the standard compression formats used in Linux, and there are corresponding programs with the same names.
  - `xxd` for creating hexdumps and reverse hexdumps.
  - `nc host port` for arbitrary TCP // UDP connection.
  - `openssl s_client -connect host:port` for connecting to SSL services. 
  - `nmap` for port scanning.
  - `diff` for diffing, obviously.
  - `scp` to copy stuff over the SSH protocol.
  - Unix job control — `jobs`, `fg`, `bg` and `CTRL+Z`
  - Listen on a port using netcat — `nc -l -p port`
  - Split by space and take first element from each line — `cut -d ' ' -f 1`
  - `md5sum` for MD5 checksum (duh!)
  - More commands! — `seq` and `tee`.  `Seq` produces a sequence of numbers, which can in turn be used in for loops in bash. Format strings can be used with with `seq`, like `%04g`. Tee can be used to put data from `stdin` into a file.
  - `echo -e` is to be used when we’d want bash to interpret escaped characters as they are.
  - `getent passwd` — for checking `/etc/passwd` file.
  - Immensely useful for checking the history of a git repository — `git log --graph --decorate --all --oneline`
- You have to have `400` as the permission for the SSH private key.
- `setuid`, `setgid`, `sticky` and the corresponding `chmod` commands. These bits control which user the executable would be run as. Kind of similar to setting the “Run as administrator” flag in Windows, only here in Linux it’s much more flexible and versatile.
- `crontab`s are in the `/etc/cron.d/` directory, and cronjobs are run as the user that owns that crontab file.
- Sometimes you can’t `ls` or `cd` into a directory, but still can write inside that directory…. strange but useful.
- There should be no spaces around the equal sign while assigning variables in Bash.
- You can trigger `more` to go into a command mode by making the terminal small enough. And while you’re in that mode, pressing v will open up and editor, by default vim. And then you can use vim commands to access the files, such as `:e filename` to open a file and `:set shell=/bin/bash` and then `:shell` to open a shell.
- Finding info leak in git repos.
  - Check `git log` and `git tags` and look for any interesting commit // tag. And then checkout to it using `git checkout commit` and grab that info. 
  - Check `.git/packed-refs` for all refs. And then, if checking out to a ref doesn’t work, use `git show ref` or `git cat-file -p ref` on it to directly read the contents.


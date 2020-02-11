---
date: 'Wed Feb 11 2020 13:24:00 GMT+0530 (India Standard Time)'
title: Notes from Overthewire Leviathan
showcase: true
tags:
  - Hacking
  - Wargames
  - Ctf
---

Recently I was free for a couple of days with nothing to do, leading to an itch to do some hacking: CTFs, wargames and the like. For beginners, the Internet heartily recommends the [Overthewire](https://overthewire.org/wargames/) wargames, so I went for that. I had already done the [_Bandit_](https://overthewire.org/wargames/bandit/) wargame—you can find my notes [here](https://sumit-ghosh.com/articles/notes-overthewire-bandit/)—so this time I started with [Leviathan](https://overthewire.org/wargames/leviathan/). In this post I'll dump my notes; these are not exactly solutions or walkthroughs, or writeup even, rather a list of things// concepts I learned by doing this wargame that I'd like to remember. Hoping this will be of some help!


#### Useful Linux commands for looking for information in executable.
- At first, use `strings` to check for strings in the binary. 
- Trace through the library calls using `ltrace`; specifically, `ltrace -e strcmp` can be useful for password cracking.
- Trace through system calls using `strace`.


#### Interpreting the output of `ls -l`
The section is pretty much a rewording of [this](https://unix.stackexchange.com/a/103118/394075) stackoverflow answer.

```
-rwxrw-r--    1    root   root 2048    Jan 13 07:11 afile.exe
```
From left to right, it displays;
- File permissions
- Number of links
- Owner name
- Owner group
- File size
- Time of last modification
- File/ directory name

File permissions is displayed as following;   
The first character is `-` or `l` or `d`, indicating the nature of the object.
- `d` = directory
- `-` = file
- `l` = symlink.

After that, there are three sets of characters, three characters each, indicating permissions for the owner, the group and everyone else, respectively.
- `r` = readable  
- `w` = writable  
- `x`, `s` or `t` = executable, setuid// setgid, or sticky  


#### Effective user id, real user id and the special permission flags

The third bit in each sets of three permission bits usually is used for the `x` bit, which implies that the file is executable, but it can also have an `s` or `t` flag. [Here](https://linuxconfig.org/how-to-use-special-permissions-the-setuid-setgid-and-sticky-bits) is an article that goes in depth into how these special permissions work. The `s` flag is rather important; it's called `setuid` if it's in the owner permissions, and `setgid` if it's in the group permissions. When the `setuid` flag is set, the file will always be executed as the owner, i.e. with the priviledges of the owner, even if some other user is executing it. Similarly, the `setgid` flag lets us run the executable with the priviledges of the group.

Every running program gets to see two user ids;
- Real user id — The user id of the user who actually executed the program.
- Effective user id — The user id with whose priviledge the executable is being run. Normally, this is same as the real user id. But when an executable has the `setuid` flag set, the effective uid equals the uid of the owner. 

Relevant C library functions;
- `geteuid`, `getruid`, `setreuid` — For getting the effective user id, getting the real user id, and setting the real and effective user id at once, respectively.
- `access` — For checking if the _real user_ has access to a file. Even if the executable had the `setuid` flag set, it'd check the priviledges of the real uid, not the effective uid.

#### Leviathan: level 2 ➝ 3

This level was the most interesting level of Leviathan, so I'll make an exception and kind of write an usual walkthrough for this level.

There are two vulnerabilities in this program.

- Race condition — Between the first check and the second `system` function call, there is a time gap. If we can change the argument file—which is a symbolic link—in the meantime, we can bypass the check. We can write a simple bash script to keep doing this in a while loop, and just wait till the race conditions occurs. [Here](https://www.win.tue.nl/~aeb/linux/hh/hh-9.html) is the approach explained in more detail.
- Code injection — The command-line sargument was passed verbatim to the C library function `system`, i.e. shell. So we can carefully craft a filename that would pass the first check but when it'd come to the `system` call, it'd do whatever we want, on an escalated priviledge. Below are some ways we can approach this 
    - Create two files, one named "`a`" and another named "`a;bash -p`". On passing the 2nd filename as the argument, the program will check if I own the it, and will let us pass. but when it comes to the system call, it'd call `$ cat a;bash -p`, which would clearly give us a bash shell, just what we wanted.
    - Or we can create three files, namely "`a`", "`b`", and "`a b`". Then we just need to symlink "`b`" to the secret file, and pass "`a b`" as the argument to the program. Voila. the contents of the secret file gets printed. This happens because, as we discussed, the program passes the string we provide to `system` verbatim, in this case it runs `$ cat a b`, which prints both "`a`" and "`b`".

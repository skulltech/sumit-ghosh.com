- 0

Well, nothing’s there. I started poking around the directories to see what I could find. Looking for all files, including hidden ones was the first step. And voila, there’s a hidden directory name `.backup`, and inside that a file named `bookmarks.html`! That’s interesting. Using `file`, `wc` and `head` revealed it’s a large HTML file. Can’t go through it all manually, `grep` to the rescue.

```console
$ cat bookmarks.html | grep leviathan
```

This revealed a line that contains the password for the next level in plaintext,

- 1 — password is `rioGegei8m`.

In the home folder, there’s an executable! Using `ls -l` and `file` reveals it’s a `setuid` executable that’s owned by `leviathan2:leviathan1`. That’s nice, I guess I could use it to read the password for leviathan2 at `/etc/leviathan_pass/leviathan2`. But on running it, it asks for a password.

# Natas

- Level 0 — Check comments in HTML.
- Level 1 — Same as above.
- Level 2 — The server shows that there’s a directory called `files` as a pixel image is from there. Opening that directory shows that it’s open, and a `users.txt` file in there reveals the password.

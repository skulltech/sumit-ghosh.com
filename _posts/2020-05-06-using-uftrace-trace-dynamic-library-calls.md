---
date: 'Fri May 06 2020 16:00:00 GMT+0530 (India Standard Time)'
title: 'Using Uftrace to Trace Dynamic Library Calls'
showcase: true
tags:
  - Linux
---

This post is an update to my [last post](/articles/list-external-functions-used-exported-executables-shared-libraries/), where I regretted that ltrace doesn't work on binaries that lack the `PLT` section, and explored some alternative ways that tries to achieve what ltrace couldn't. Those alternatives weren't perfect, I was still looking for a perfect one, so I asked a question at Stack Overflow and the Unix and Linux Stack Exchange, and someone came to the [rescue](https://stackoverflow.com/a/61618754) and introduced me to the [uftrace](https://github.com/namhyung/uftrace) utility. And I’m glad to say, this is definitely a _perfect_ alternative to ltrace, that does everything ltrace does, and more.

The real strength of uftrace lies in it’s ability to trace internal function calls and draw a call graph, which would definitely be immensely helpful in debugging and profiling. I’m not going to discuss that in this article though, I’m just going to share how you can use uftrace as an alternative to ltrace, i.e. to trace library calls.

Let’s use the following “hello world” program as an example;

```c
#include <stdio.h>

int main(int argc, char const *argv[])
{
	printf("Hello world!\n");
	return 0;
}
```

We’re gonna compile it with the `-z now` flag, which generates a binary without a `PLT` section.

```console
sumit@HAL9000:~$ gcc hello.c -o hello -Wl,-z,now
sumit@HAL9000:~$ ltrace ./hello 
Hello world!
+++ exited (status 0) +++
```

As expected, ltrace couldn’t trace any library call.

### Enter uftrace

Installing uftrace is easy enough. Ubuntu has uftrace in the standard repositories, so a simple `apt install uftrace` worked for me. You can also build it from source by following the instructions in [the official repo](https://github.com/namhyung/uftrace). 

Once you have it installed, use it the following way.

```console
sumit@HAL9000:~$ uftrace --force -a ./hello
Hello world!
# DURATION     TID     FUNCTION
 187.291 us [ 40352] | puts("Hello world!") = 13;
```

How amazing is that!! By the way, the `--force` flag is required for it to work on standard binaries that doesn’t have any debugging information embedded within, and the `-a` argument makes it detect arguments to the function calls it intercepts. 

Hope this short post was useful to you. I'll be back with a post on code injection using dynamic libraries soon, so keep posted.

---
date: 'Fri Apr 20 2020 18:00:00 GMT+0530 (India Standard Time)'
title: 'Hijacking Library Functions and Injecting Code Using the Dynamic Linker'
showcase: true
tags:
  - Hacking
---



#### The challenge

Create a shared object which spawns a shell using `execve` when used like;

```console
$ LD_PRELOAD=./payload.so /bin/true
```

The original challenge was a bit more involved than this, I've trimmed it down to the part that's relevant to the topic of this article. Before solving this hands-on, we need brush up on some background knowledge. 


## Linking 101 :: Static vs Dynamic

In this section I’ll try to briefly explain the compilation process, and the difference between static linking and dynamic linking. I’m doing this just because it’s directly relevant to the main content of this post, but I must state that I’m not an expert on this. The explanation will likely be an oversimplification almost to the point of being incorrect, but I’m hoping that for now it'll work as an introduction for the complete beginner. If you already know all these stuff, skip this section. Now that we have that out of the way, let’s see if I can do this.

We all know what libraries are, right? Libraries are reusable code that we just `import` or `include` in our program and use directly. Regardless of experience or competence, all programmers use libraries, they are an inseparable part of the programming process. The usual reasons being 
- Not reinventing the wheel.
- Keeping the source code modular, and thus readable, sane, etc.

### The compilation process

Now, let's look at the compilation process. First, the compiler _compiles_ your _source code_ into _object_ files. And then _linker_ combines the object files and any libraries that you might need, and creates the final _executable_. This way, the final executable has all the _library functions_ it needs.

So, to reiterate, _linking_ usually means creating an executable, from combining object files and libraries. This is so much of a simplification that it's almost incorrect, but

Linking can be of two types, static and dynamic.


### Static Linking 

Static linking creates an executable that has everything it needs at runtime in itself. When you statically link your compiled object files and libraries, they get embedded in a single file—the final executable. Obviously, this will create a larger executable, but the upside is that you won't have to depend on the runtime environment.


### Dynamic Linking

Dynamic linking does not embed the libraries in the executable; rather it just leaves a reference mentioning that it needs those library functions at runtime. When the executable is run, another program called _the dynamic linker_ makes sure that those library functions are present in memory, and if they are not, it loads them into memory. All in all, the dynamic linker makes sure that the library functions needed by the executable are present at runtime. There can be confusion of terminology here: the dynamic linker is not the same as the linker; the former is a part of the OS, the later is used as a part of the compilation process.

In this way, the libraries are truly “shared” between different programs at runtime, the OS doesn't have to load multiple copies of the same core libraries. That means the available RAM is efficiently utilized. It also reduces the size of the executables and consequently space on the secondary storage. 


## Hijacking library functions

Now we're getting into the meat of the discussion. We know what the dynamic linker does in general. But there is a special behaviour of it that we're going to exploit :: The dynamic linker loads any libraries mentioned in the `LD_PRELOAD` environment variable before loading any other libraries. That means, in a way the libraries in `LD_PRELOAD` gets the most priority. This gives possibility of hijacking library calls made from _any_ program, you just have to write an alternate implementation of the library function and mention the shared object file in `LD_PRELOAD`. Let's explore this concept using an example.

Let's create a simple application which we're going to hijack.
```c
#include <stdio.h>

int main(int argc, char const *argv[]) {
	char name[64];
	printf("[*] Enter your name: ");
	scanf("%s", name);
	printf("[*] Hello %s!\n", name);
	return 0;
}
```

It's a very simple program, kind of a slightly more involved version of the “Hello World!” program. It asks you for your name and then greets you, instead of the whole wide world.

```console
sumit@HAL9000:~$ gcc hello.c -o hello
sumit@HAL9000:~$ ./hello
[*] Enter your name: Sumit
[*] Hello Sumit!
```

We know this program inside-out, including which library functions it uses because we have access to its source code. But we won’t always have that privilege in the real world. So let’s forget for a while that we know that it uses `printf` and `scanf`, and let’s try to figure it out from the executable binary.

The easiest way to do this would be running `strace`, which intercepts and records the system calls which are called by a process.

#### Using strace to intercept syscalls

``` console
sumit@HAL9000:~$ strace -o hello.trace ./hello
[*] Enter your name: Sumit
[*] Hello Sumit!
sumit@HAL9000:~$ cat hello.trace 
execve("./hello", ["./hello"], 0x7ffea8183a40 /* 56 vars */) = 0
brk(NULL)                               = 0x559d1332f000
...
mprotect(0x7ff14c17e000, 4096, PROT_READ) = 0
munmap(0x7ff14c12d000, 151418)          = 0
fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(0x88, 0x1), ...}) = 0
brk(NULL)                               = 0x559d1332f000
brk(0x559d13350000)                     = 0x559d13350000
fstat(0, {st_mode=S_IFCHR|0620, st_rdev=makedev(0x88, 0x1), ...}) = 0
write(1, "[*] Enter your name: ", 21)   = 21
read(0, "Sumit\n", 1024)                = 6
write(1, "[*] Hello Sumit!\n", 17)      = 17
lseek(0, -1, SEEK_CUR)                  = -1 ESPIPE (Illegal seek)
exit_group(0)                           = ?
+++ exited with 0 +++
```

I used `-o hello.trace` to save the output to a file instead of printing it directly on the console, otherwise the output of `strace` would get mixed with the IO of my program and that would get a bit confusing.

Now, as you can see from the output, `strace` lists all the system calls it could intercept// detect. You might’ve already noticed that there is no `scanf` or `printf`; instead there are `read` and `write`. This is because the former functions are part of the C standard library, they’re not system calls, they’re more of a wrapper to the latter functions—the underlying system calls.

You’ll also notice there are a lot of syscalls that seemingly aren’t remotely related anything we wrote in the `hello.c` program (I’ve truncated most of them as they aren’t directly relevant). In reality, they are startup routines inserted by the compiler; they are related to our program, but they aren’t unique to ours, you’ll see them every time you run `strace` on _any_ program. Pay a bit of attention to them, so that you can kind learn to recognize the pattern and ignore them. 

Let’s get back to the topic of hijacking those function calls. We know that it calls `read` to get the data, i.e. the user’s name; let’s consider that we want to spoof the program into believing that the user typed something else. That is, we want to hijack the `read` function and change the data being passed to the program as input.

#### Writing the read function

In order to fool the program into using our counterfeit `read`, it’s signature needs to match the exactly with that of the the actual `read`—the function expected by the program. The signature of a function consists of it’s

- Name
- Arguments
- Return type

We can get all the details about libc functions using `man`.

``` console
sumit@HAL9000:~$ man read
```

Looking at the man page, we’ll see that the signature of `read` is the following ::

```c
ssize_t read(int fd, void *buf, size_t count);
```

The man page will also tell us how this function is supposed to _function_: it writes `count` bytes of data from the file descriptor `fd` to the buffer `buf`. Knowing these, we can write our counterfeit function.

```c

```

There are some caveats though. 

- You __can not__ catch _system_ calls, i.e. pure system calls made directly to the kernel. If the call was made through `libc`, then yeah, you can catch it.
    - https://stackoverflow.com/questions/35771395/why-doesnt-ld-preload-trick-catch-open-when-called-by-fopen
    - https://stackoverflow.com/questions/49314057/how-to-find-out-what-functions-to-intercept-with-ld-preload


- You can not catch statically linked libraries, because in that case the libraries functions are embedded in the executable binary itself, it doesn't look for it anywhere else.

References ::
- Explaining LD_PRELOAD: https://rafalcieslak.wordpress.com/2013/04/02/dynamic-linker-tricks-using-ld_preload-to-cheat-inject-features-and-investigate-programs/
- Explaining LD_PRELOAD: http://www.goldsborough.me/c/low-level/kernel/2016/08/29/16-48-53-the_-ld_preload-_trick/
- https://jvns.ca/blog/2014/11/27/ld-preload-is-super-fun-and-easy/
- Some amazing ideas about what can be done with it: https://blog.jessfraz.com/post/ld_preload/
- https://tldp.org/HOWTO/Program-Library-HOWTO/shared-libraries.html


### The _init function

Okay, but `/bin/true` does not call _any_ libc function whatsoever. How can we inject code into that? Enter the `_init` function. The `_init` and `_fini` functions are run at the start and end of the loading process, respectively. It is a remmant of the antiquity though, and not recommeneded to overwrite `_init` and `_fini`. The modern practice is writing constructors and destructors. 

References ::
- https://tldp.org/HOWTO/Program-Library-HOWTO/miscellaneous.html
- https://stackoverflow.com/questions/5474969/overriding-init-function-in-c-how-safe-is-it/32456487

But it might not work as expected always!!
- https://stackoverflow.com/questions/23850624/ld-preload-does-not-work-as-expected

### Writing 64 bit shared libraries

Okay, so we understand the motivation. But how do we actually write a shared library?!

- https://www.cprogramming.com/tutorial/shared-libraries-linux-gcc.html
- In assembly:: https://www.linuxquestions.org/questions/programming-9/how-do-i-write-a-shared-library-in-x86_64-assembly-4175490010/
- AMD64 syscall table:: https://filippo.io/linux-syscall-table/

```console
$ gcc -shared -fpic -nostartfiles -o payload.so payload.c
```

### Create a _small_ ELF file

Currently researching.

Compiler options
- https://stackoverflow.com/questions/15314581/g-compiler-flag-to-minimize-binary-size

ELF sections
- https://stackoverflow.com/questions/9401217/is-the-elf-notes-section-really-needed
- https://cirosantilli.com/elf-hello-world

ELF page alignment
- https://stackoverflow.com/questions/39878982/32bit-executable-session-is-aligned-by-4kb-is-it-part-of-elf-format
- https://stackoverflow.com/questions/33005638/how-to-change-alignment-of-code-segment-in-elf
- http://lists.llvm.org/pipermail/llvm-commits/Week-of-Mon-20141110/244148.html
- http://lists.llvm.org/pipermail/llvm-commits/Week-of-Mon-20141103/243461.html

```console
$ gcc -shared -fpic -nostartfiles -nostdlib -o payload.so payload.c -nodefaultlibs -s -Wl,-z,max-page-size=0x10
$ gcc -shared -fpic -nostartfiles -nostdlib -o payload.so payload.c -nodefaultlibs -s -n
```

```console
$ gcc -shared -fpic -nostartfiles -o payload.so payload.c -Os -fsingle-precision-constant -fomit-frame-pointer -ffast-math -mpreferred-stack-boundary=3 -fno-asynchronous-unwind-tables -funsafe-math-optimizations -fno-exceptions
```

Actually working version of the above
```console
$ gcc -shared -fpic -nostartfiles -o payload.so payload.c -nostdlib -nolibc -nodefaultlibs -fno-asynchronous-unwind-tables -s -n
```

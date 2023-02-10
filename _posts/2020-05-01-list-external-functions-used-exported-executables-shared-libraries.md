---
date: "Fri May 01 2020 16:00:00 GMT+0530 (India Standard Time)"
title: "Listing External Functions Used// Exported by Executables and Shared Libraries"
showcase: true
tags:
  - linux
redirect_from: /articles/external-functions-used-exported-elf/
---

## ltrace and its incompetence

[ltrace](https://www.ltrace.org/) is a program that intercepts and records the dynamic library calls which are called by an executed process. Although it's not a part of the POSIX standard, it's usually included in every Linux installation.

In my Ubuntu 19.10 system, I noticed that ltrace couldn't intercept _any_ library calls when it was used on the bundled system programs, such as `ls` and `cat`. For example,

```console
sumit@HAL9000:~$ ltrace ls
[... usual output of ls]
+++ exited (status 0) +++
```

It also wasn't working on programs I compiled myself. Clearly, something was wrong; Stack Overflow was one source of clarity, specifically [this question](https://stackoverflow.com/questions/43213505/no-output-when-running-ltrace). As it is clear from the linked discussion, ltrace doesn't work on binaries linked with the `-z now` option, It only works on binaries linked with `-z lazy`. It isn't clear if// when the devs are going to fix this, so we have to find some workarounds in the meanwhile.

To that end, I've been looking for alternatives to ltrace, albeit unsuccessfully. If you know one, please let me know in the comments, or write an email to me.

For now, we'll take an alternate route. Instead of hijacking library calls as they happen, we'll inspect the elf binary and look for external symbols it has referred to. All library functions are listed as external symbols in an elf binary, so that way we'll get an exhaustive list of all the functions it _could_ call, theoretically. We won't get the debugging capability of ltrace to its full extent, as we won't be able to see the function calls _as they happen_ in real-time, nor will we be able to see the function arguments. But, beggars can't be choosers.

## Listing symbols in an elf executable

This section is an expansion on [this](https://stackoverflow.com/questions/34732/how-do-i-list-the-symbols-in-a-so-file) Stack Overflow discussion.

We'll be using the following C program for testing.

```c
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

int main(int argc, char const *argv[]) {
    srand(time(NULL));
    printf("%d\n", rand());
}
```

Pretty simple program, just prints out a random integer.

```console
sumit@HAL9000:~$ gcc random.c -o random
sumit@HAL9000:~$ ./random
701758836
```

Now let's see how we can list the external library functions it's using.

### Using nm

```console
sumit@HAL9000:~$ nm -gDC random
                 w __cxa_finalize
                 w __gmon_start__
                 w _ITM_deregisterTMCloneTable
                 w _ITM_registerTMCloneTable
                 U __libc_start_main
                 U printf
                 U rand
                 U srand
                 U time
```

- Flags :: `g` for external symbols, `D` for dynamic symbols, and `C` for demangling C++ symbols.

### Using objdump

```console
sumit@HAL9000:~$ objdump -TC random

random:     file format elf64-x86-64

DYNAMIC SYMBOL TABLE:
0000000000000000  w   D  *UND*    0000000000000000              _ITM_deregisterTMCloneTable
0000000000000000      DF *UND*    0000000000000000  GLIBC_2.2.5 printf
0000000000000000      DF *UND*    0000000000000000  GLIBC_2.2.5 __libc_start_main
0000000000000000      DF *UND*    0000000000000000  GLIBC_2.2.5 srand
0000000000000000  w   D  *UND*    0000000000000000              __gmon_start__
0000000000000000      DF *UND*    0000000000000000  GLIBC_2.2.5 time
0000000000000000  w   D  *UND*    0000000000000000              _ITM_registerTMCloneTable
0000000000000000      DF *UND*    0000000000000000  GLIBC_2.2.5 rand
0000000000000000  w   DF *UND*    0000000000000000  GLIBC_2.2.5 __cxa_finalize
```

- Flags :: `T` for dynamic symbols, and `C` for demangling C++ symbols.

### Using readelf

```console
sumit@HAL9000:~$ readelf --dyn-syms random

Symbol table '.dynsym' contains 10 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND
     1: 0000000000000000     0 NOTYPE  WEAK   DEFAULT  UND _ITM_deregisterTMCloneTab
     2: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND printf@GLIBC_2.2.5 (2)
     3: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND __libc_start_main@GLIBC_2.2.5 (2)
     4: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND srand@GLIBC_2.2.5 (2)
     5: 0000000000000000     0 NOTYPE  WEAK   DEFAULT  UND __gmon_start__
     6: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND time@GLIBC_2.2.5 (2)
     7: 0000000000000000     0 NOTYPE  WEAK   DEFAULT  UND _ITM_registerTMCloneTable
     8: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND rand@GLIBC_2.2.5 (2)
     9: 0000000000000000     0 FUNC    WEAK   DEFAULT  UND __cxa_finalize@GLIBC_2.2.5 (2)
```

- Flags :: `--dym-syms` for dynamic symbols.

All of the above do the same task, more or less: they dump the externally visible dynamic symbols located in the `.dynsym` section of the symbol table in the elf file. As you can see, they have varying levels of verbosity; `readelf` is the most verbose of them all, it displays all the attributes of the symbols in a tabular manner.

### Picking out the global function symbols

Looking at the symbol names in the `readelf` output, you could suspect that not all of them are library functions, and you'd be right. Only the symbols with type `FUNC` and bind `GLOBAL`, i.e. global functions, are external library functions. You can pick them out manually, or you can use a python script I've written, [`dynfuncs.py`](https://github.com/SkullTech/dynfuncs.py) that does it for you.

```console
sumit@HAL9000:~$ python3 dynfuncs.py random
Symbol table '.dynsym' contains 5 global functions:
   Num: Name
     0: printf
     1: __libc_start_main
     2: srand
     3: time
     4: rand

```

This script uses [`pyelftools`](https://github.com/eliben/pyelftools) to parse the elf file and then pick out the symbols, it doesn't rely on any of the previously mentioned commands.

Either way, you get a list of symbols, which are global// externally visible functions, which for an executable binary means dynamically linked library functions. And it does correctly list all 4 library functions we've used in our `random.c` program.

## Inspecting Shared Libraries

Note that we can use the above commands and script not only for elf executables but for elf shared libraries, i.e. `.so` files too. In that case, it'll also list functions and symbols _exported_ by the shared library, along with the external library functions _used_ by the shared library. The following example illustrates this.

```c
#include <unistd.h>

void shell() {
	char *argv[] = {"/bin/sh", 0};
	execve(argv[0], &argv[0], NULL);
}
```

Above is the source code of a small shared library which exports a single function `shell` which, evidently, spawns a shell. Let's compile this.

```console
sumit@HAL9000:~$ gcc -shared -fpic shlib.c -o shlib.so
```

Now let's list the dynamic symbols in `shlib.so`.

```console
sumit@HAL9000:~$ readelf --dyn-syms shlib.so

Symbol table '.dynsym' contains 8 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND
     1: 0000000000000000     0 NOTYPE  WEAK   DEFAULT  UND _ITM_deregisterTMCloneTab
     2: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND __stack_chk_fail@GLIBC_2.4 (2)
     3: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND execve@GLIBC_2.2.5 (3)
     4: 0000000000000000     0 NOTYPE  WEAK   DEFAULT  UND __gmon_start__
     5: 0000000000000000     0 NOTYPE  WEAK   DEFAULT  UND _ITM_registerTMCloneTable
     6: 0000000000000000     0 FUNC    WEAK   DEFAULT  UND __cxa_finalize@GLIBC_2.2.5 (3)
     7: 0000000000001139    93 FUNC    GLOBAL DEFAULT   14 shell

sumit@HAL9000:~$ python3 dynfuncs.py shlib.so
Symbol table '.dynsym' contains 3 global functions:
   Num: Name
     0: __stack_chk_fail
     1: execve
     2: shell
```

`objdump` and `nm` will yield the same symbols, just in different formats.

We can see from the above results that for a shared library, the _exported_ functions as well as the functions _used_ by the library are dumped.

You must be wondering about some extra functions showing up in these dumps despite you not using them explicitly in the source code; names starting with `__`, for example, `__libc_start_main` and `__stack_chk_fail`. These are standard functions that are inserted by the compiler, they're usually defined in the [LSB](https://en.wikipedia.org/wiki/Linux_Standard_Base) specs. For usual use-cases, you don't need to worry about them.

### Conclusions and a request

We know how to list all the library functions an executable _might_ use. But we still don't know the functions actually getting called by the executable in a specific run, only ltrace could tell us that. As of now, with most distros moving to `-z now` binaries, ltrace is pretty much unusable. I still haven't found any alternative to ltrace, so if you come upon one, please send me an email or leave a comment mentioning that. Thanks!

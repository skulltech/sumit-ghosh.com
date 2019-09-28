---
date: 'Thu Jan 03 2019 22:28:00 GMT+0530 (India Standard Time)'
title: Demystifying Context Managers in Python
tags:
  - Python
  - Programming
canonical_url: 'https://stackabuse.com/python-context-managers/'
---

NOTE — I wrote this article for stackabuse.com and it originally appeared [here](https://stackabuse.com/python-context-managers/).


### Introduction

One of the "obscure" features of Python that almost all Python programmers use—even the beginner ones—but don't really understand, is _context managers_. You've probably seen them in the form of `with` statements, usually first encountered when you learn opening files in Python. Although context managers seem a little strange at first, when we really dive into them, understand the motivation and techniques behind it, we get access to a new weapon in our programming arsenal. So without further ado, let's dive into it!

### Motivation: Resource management

As someone much wiser than me said someday, "Necessity is the mother of invention”. To really understand what a context manager is and how can we use it, we must first investigate the motivations behind it — the necessities that gave rise to this "invention". 

The primary motivation behind context managers is resource management. When a program wants to get access to a resource on the computer, it asks the OS for it, and the OS, in turn, provides it with a handle for that resource. Some common examples of such resources are files and network ports. What's important to understand is that these resources have limited availability, for example, a network port can be used by a single process at a time, and there are a limited number of ports available. So whenever we _open_ a resource, we have to remember to _close_ it, so that the resource is freed. But unfortunately, it's easier said than done.

The most straightforward way to accomplish proper resource management would be calling the `close` function after we're done with the resource. For example —

```python
opened_file = open('readme.txt')
text = opened_file.read()
...
opened_file.close()
```

Here we are opening a file named `readme.txt`, reading the file and saving its contents in a string `text`, and then when we're done with it, closing the file by calling the `.close()` method of the file object. Now at first glance this might seem okay, but actually, it's not robust at all. If _anything_ unexpected happens between opening the file and closing the file and the program fails to execute the line containing the `close` statement, there would be a resource leak. These _unexpected events_ are what we call `exceptions`, a common one would be when someone forcefully closes the program while it's executing. 

Now, the proper way to handle this would be using _Exception handling_, using  `try...finally` blocks. Look at the following example, 

```python
try:
    opened_file = open('readme.txt')
    text = opened_file.read()
    ...
finally:
    opened_file.close()
```

Python always makes sure the code in the `finally` block is executed, regardless of anything that might happen. This is the way programmers in other languages would handle resource management, but Python programmers get a special mechanism that lets them implement the same functionality without all the boilerplate. Here's where context managers come in.

### Implementing context managers

Now that we are done with the most crucial part about understanding context managers, we can jump into implementing them. For this tutorial, we will implement a custom `File` class. It’s totally redundant as Python already provides this, but nevertheless, it’ll be a good learning exercise as we’ll always be able to relate back to the `File` class that’s already there in the standard library.

The standard and “lower-level” way of implementing a context manager is defining two “magic” methods in the class you want to implement resource management for, `__enter__` and `__exit__`.  If you’re getting lost—thinking, “what’s this magic method thingy? I’ve never heard of this before”—well, if you’ve started doing object-oriented programming in Python, you surely have encountered a magic method already, the method `__init__`. For lack of better words, they're special methods that you can define to make your classes smarter or add "magic" to them. You can find a nice reference list of all the magic methods available in Python [here](https://rszalski.github.io/magicmethods/).

Anyway, getting back to the topic, before we start implementing these two magic methods, we’ll have to understand their purpose. `__enter__` is the method that gets called when we open the resource, or to put it in a slightly more technical way — when we “enter” the _runtime context_.  The `with`statement will bind this method’s return value to the target specified in the `as` clause of the statement. Let’s look at an example,

```python
class FileManager:
    def __init__(self, filename):
        self.filename = filename
        
    def __enter__(self):
        self.opened_file = open(self.filename)
        return self.opened_file
```

As you can see, the `__enter__` method is opening the resource—the file—and returning it. When we use this `FileManager` in a `with` statement, this method will be called and its return value will be bind to the target variable you mentioned in the `as` clause. I’ve demonstrated in the following code snippet —

```python
with FileManager('readme.txt') as file:
    text = file.read()
```

Let’s break it down part-by-part. Firstly, an instance of the `FileManager` class is created when we instantiate it, passing the filename “readme.txt” to the constructor. Then, the `with` statement starts working on it — it calls the `__enter__` method of that `FileManager` object and assigns the returned value to the `file` variable mentioned in the `as` clause. Then, inside the `with` block, we can do whatever we want to do with the opened resource.

The other important part of the puzzle is the `__exit__` method. The `__exit__` method contains clean-up code which must be executed after we’re done with the resource, no matter what. The instructions in this method will be similar to the ones in the `finally` block we discussed before while discussing exception handling. To reiterate, the `__exit__` method contains instructions to properly close the resource handler, so that the resource is freed for further use by other programs // the OS. Now let’s take a look at how we might write this method —

```python
class FileManager:
    def __exit__(self. *exc):
        self.opened_file.close()
```

Now, whenever the instances of this class will be used in a `with` statement, this `__exit__` method will be called before the program leaves the `with` block, or before the program halts due to some exception. Now let’s look at the whole `FileManager` class so that we have a complete idea.

```python
class FileManager:
    def __init__(self, filename):
        self.filename = filename
        
    def __enter__(self):
        self.opened_file = open(self.filename)
        return self.opened_file
    
    def __exit__(self, *exc):
        self.opened_file.close()
```

Simple enough, right? We just defined the opening and cleaning-up actions in the respective magic methods, and Python will take care of resource management wherever this class might be used. That brings me to the next topic, the different ways we can use context manager classes, such as this `FileManager` class.

### Using context managers

There’s not much to explain here, so instead of writing long paragraphs, I’ll provide code-snippets in this section.

```python
file = FileManager('readme.txt')
with file as managed_file:
    text = managed_file.read()
    print(text)
```

```python
with FileManager('readme.txt') as managed_file:
    text = managed_file.read()
    print(text)
```

```python
def open_file(filename):
    file = FileManager(filename)
    return file

with open_file('readme.txt') as managed_file:
    text = managed_file.read()
    print(text)
```

You can see that the key thing to remember is,

1.  The object passed to the `with` statement must have `__enter__` and `__exit__` methods.
2. The `__enter__` method must return the resource that’s to be used in the `with` block.

__Important__ — There are some subtleties I left out, to make the discussion to-the-point. For the exact specifications of these magic methods, refer to the Python documentation [here](https://docs.python.org/3/library/stdtypes.html#context-manager-types).

### Using contextlib 

The [Zen of Python](https://www.python.org/dev/peps/pep-0020/)—Python’s guiding principle as a list of aphorisms—states that,

> ```
> Simple is better than complex.
> ```

To really drive this point home, Python developers have created a library named [`contextlib`](https://docs.python.org/3/library/contextlib.html) containing utilities regarding context managers, as if they didn’t simplify the problem of resource management enough. It contains an array of functions and decorators that can be used to make your context managers [_DRY_](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). I’m going to demonstrate only one of them briefly here, I recommend you to check out the official Python docs for more.

```python
from contextlib import contextmanager

@contextmanager
def open_file(filename):
    opened_file = open(filename)
    try:
        yield opened_file
    finally:
        opened_file.close()
```

Like the code above, we can simply define a function that `yield`s the protected resource in a `try` statement, closing it in the subsequent `finally` statement. Another way to understand it:

- All the contents you’d otherwise put in the `__enter__` method, except the `return` statement, goes before the `try` block here — basically the instructions for opening the resource.
- Instead of returning the resource, you `yield` it, inside a `try` block.
- The contents of the `__exit__` method goes inside the corresponding `finally` block.

Once we have such a function, we can decorate it using the `contextlib.contextmanager` decorator and we’re good.

```python
with open_file('readme.txt') as managed_file:
    text = managed_file.read()
    print(text)
```

As you can see, the decorated `open_file` function returns a context manager and we can use that directly. This lets us achieve the same effect as of creating the `FileManager` class, without all the hassle.

### Further reading

If you’re feeling enthusiastic and want to read more about context managers, I encourage you to check out the following links —

- https://docs.python.org/3/reference/compound_stmts.html#with
- https://docs.python.org/3/reference/datamodel.html#context-managers
- https://docs.python.org/3/library/contextlib.html
- https://rszalski.github.io/magicmethods/

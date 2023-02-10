---
date: "Fri Apr 17 2020 17:00:00 GMT+0530 (India Standard Time)"
title: "Parsing Dictionary-Like Key-Value Pairs Using Argparse in Python"
showcase: true
tags:
  - python
---

Python’s [`argparse`](https://docs.python.org/3/library/argparse.html) is a wonderful library. You can write a capable Unix-style command-line program using very few lines of code. The [docs](https://docs.python.org/3/library/argparse.html) mention how you can use `argparse` to server a variety of use-cases, it most likely covers everything one might need from an argument parser, it’s _batteries-included_ in the true sense of the term. But, there are some holes—the _battery_ isn’t there—so you have to code it up yourself.

One such case is accepting a dictionary-like list of arbitrary key-value pairs as an argument. `argparse` doesn’t support this natively, but it’s flexible enough that you can code it yourself and add it to to `argparse`. In this post, I’m going to share how I do it.

### Argparse Actions

Before we can proceed, we need to understand Actions in `argparse` and how they work. From the docs ::

> [`ArgumentParser`](https://docs.python.org/3/library/argparse.html#argparse.ArgumentParser) objects associate command-line arguments with actions. These actions can do just about anything with the command-line arguments associated with them…

Each command-line argument is passed to an associated action, as part of the standard pipeline. The action can do anything they want with the argument, and make any changes to the final `ArgumentParser` namespace (i.e. the final output) accordingly.

It should be clear by this point that we’re gonna write a custom action, an action that parses the input string argument and converts into a dictionary. From the docs ::

> You may also specify an arbitrary action by passing an Action subclass or other object that implements the same interface. The recommended way to do this is to extend [`Action`](https://docs.python.org/3/library/argparse.html#argparse.Action), overriding the `__call__` method and optionally the `__init__` method.

Like it says above, we’re going to create an action subclass, and override the `__call__` method.

### The Code

```python
import argparse

class ParseKwargs(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        setattr(namespace, self.dest, dict())
        for value in values:
            key, value = value.split('=')
            getattr(namespace, self.dest)[key] = value

parser = argparse.ArgumentParser()
parser.add_argument('-k', '--kwargs', nargs='*', action=ParseKwargs)
args = parser.parse_args()
print(args.kwargs)
```

First of all, notice that I’ve used `nargs='*'` while adding the argument via `parser.add_argument`. This makes sure that the argument is natively parsed as a list, check out the corresponding [docs](https://docs.python.org/3/library/argparse.html#nargs) here. So our action will receive a list of strings.

Now we’re assuming that each string is a key-value pair, separated by the `=` character. From this, the rest of the code should be self-explanatory. We can get the name of the argument using `self.dest`, and then edit the values using `setattr` and `getattr`. I’m splitting the string by `=` and then inserting the key and value appropriately in the dictionary.

Let’s see it in action ::

```console
sumit@HAL9000:~/Coding$ python3 kwargs.py --kwargs foo=bar fiz=biz
{'foo': 'bar', 'fiz': 'biz'}
```

It works!

Hope this post helped you in some way. Let me know in the comments if you have any questions. Cheers!!

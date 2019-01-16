---
date: 'Mon Jan 15 2019 04:04:00 GMT+0530 (India Standard Time)'
title: Demystifying @decorators in Python
showcase: true
tags:
  - Decorators
  - Python
  - Programming
---



## Introduction

Decorators are one of the most powerful tools Python has, but it may seem elusive to beginners. My first introduction to decorators was through Flask, the web framework. I didn't really delve into it at that time, just accepted it as a part of the Flask framework that I was to use mindlessly. Maybe it was that way for you too, but you’re here—that means you want to change that. So let’s do it!

## What are decorators?

Beginners may not feel comfortable with it because it goes outside “normal” procedural programming—like C—where you define functions containing blocks of code and call them, or object-oriented programming, where you define classes and instantiate objects of them. Decorators lie in neither of these paradigms, it comes from the realm of _functional programming_. But I’m getting ahead of myself, let us tackle the concepts one-by-one.

By definition, a decorator is a function that allows us to wrap another function in order to extend the behavior of the wrapped function, without permanently modifying it. This is why decorators can also be thought of as a practice of _metaprogramming_, in which computer programs have the ability to treat other programs as their data. To understand how this works, we first have to make sure that we understand how Python treats functions.

## Understanding functions

We all know what functions are, right? Don’t be so sure. There are some aspects of functions in Python that we don’t deal with very often, and subsequently they are often forgotten. Let us clear up what functions are and how are they represented in Python.

### Functions as procedures

This is the facet of functions we are most familiar with. A procedure is defined as a  series of computational steps to be carried out. Any given procedure might be called at any point during a program's execution, including by other procedures or itself. There isn’t much else to it, so I’ll move on to the next aspect of functions in Python.

### Functions as first-class objects

In Python, _everything_ is an object, not just the ones you instantiate from a class. In that sense, it embraces object-oriented programming to its core. So that means, all of the following are objects in Python

- Integers
- Strings
- Classes—yes, even classes!
- Functions—this is what we’re interested in.

You should realize that everything being objects opens up a world of endless possibility. That means we can save functions in a variable, and pass them to and return from another function even! You can also define a function in another function. In other words, functions are first-class citizens (or objects). From [Wikipedia](https://en.wikipedia.org/wiki/First-class_citizen) —

> In programming language design, a **first-class citizen** (also **type**, **object**, **entity**, or **value**) in a given programming language is an entity which supports all the operations generally available to other entities. These operations typically include being passed as an argument, returned from a function, modified, and assigned to a variable.

And that’s where functional programming comes into play, and consequently, decorators.

### Functional programming  // Higher-order functions

Python incorporates some techniques from functional programming languages, such as Haskell and OCaml. Without getting into the formal definition of what functional programming is, let me list two characteristics of it that are there in Python as well.

- Functions are treated as first-class citizens.
- Consequently, it supports _higher-order functions_.

There are some other properties of functional programming, such as its functions having no _side-effect_, but I’d be getting out of topic if I started discussing those. Let us instead focus on what’s relevant — higher-order functions. But what are higher-order functions? By the definition from [Wikipedia](https://en.wikipedia.org/wiki/Functional_programming#First-class_and_higher-order_functions)

> Higher-order functions are functions that can take other functions as arguments or return them as results.

If you know basic calculus, you know some higher-order _mathematical_ functions already, such as the differential operator $$ d/dx $$. It takes a function as input and returns another function, it’s derivative as output. Higher-order functions in a programming context work the same way, it either takes a function(s) as input or returns them as output, or both! 

### Some examples

Now that we know the theory behind all the facets of functions in Python, let us contextualize them with some example code.

```python
def hello_world():
    print('Hello world!')
```

Here’s an example function, the quintessential introductory function. You can see from the following snippet that this function, along with classes and integers—everything are objects, instances of _classes_, in Python. 

```
>>> def hello_world():
...     print('Hello world!')
...
>>> type(hello_world)
<class 'function'>
>>> class Hello:
...     pass
...
>>> type(Hello)
<class 'type'>
>>> type(10)
<class 'int'>
```

You can see that `hello_world` is of type `<class ‘function’`, that means it’s an object of the _class_ `function`. Also, classes we defined are objects of the _class_ `type`. It’s a little weird to get your head around, but once you’ve tried playing with the `type` function with different things in the Python shell it’ll click.

Next, let’s observe functions being first-class citizens.

- We can store functions in a variable.

  ```
  >>> hello = hello_world
  >>> hello()
  Hello world!
  ```

- Defining a function inside another function.

  ```
  >>> def wrapper_function():
  ...     def hello_world():
  ...             print('Hello world!')
  ...     hello_world()
  ...
  >>> wrapper_function()
  Hello world!
  ```

- Pass function as an argument to another function, and return function from another function.

  ```
  >>> def higher_order(func):
  ...     print('Received function {} as input'.format(func))
  ...     func()
  ...     return func
  ...
  >>> higher_order(hello_world)
  Received function <function hello_world at 0x032C7FA8> as input
  Hello world!
  <function hello_world at 0x032C7FA8>
  ```

The examples above combined with what we discussed before should clear how functions in Python are flexible. Keeping that in mind, we can start discussing decorators.

## Understanding decorators

Let’s reiterate the definition of a decorator

> A decorator is a function that allows us to wrap another function in order to extend the behavior of the wrapped function, without permanently modifying it. 

Now that we know how higher-order functions work, we can understand how decorators work. Let’s look at an example decorator first —

```python
def decorator_function(func):
  def wrapper():
    print('Wrapper function!')
    print('The wrapped function is: {}'.format(func))
    print('Executing wrapped function...')
    func()
    print('Exiting wrapper function')
  return wrapper
```

Here, `decorator_function` is a decorator function (duh!). As you can see, it’s a higher-order function, because it takes a function as its argument, and it also returns one. Inside `decorator_function`, we’ve defined another function, a _wrapper_ one so to speak, which _wraps_ the argument function, and subsequently modifies its behavior. The decorator returns this wrapper function. Now let’s see this decorator in action —

```
>>> @decorator_function
... def hello_world():
...     print('Hello world!')
...
>>> hello_world()
Wrapper function!
The wrapped function is: <function hello_world at 0x032B26A8>
Executing wrapped function...
Hello world!
Exiting wrapper function
```

It’s like magic! Just by adding the `@decorator_function` statement before the `def` statement for the `hello_world`, we’ve modified it. But as you may have already understood, the `@` statement is just _syntactic sugar_ for —

```python
hello_world = decorator_function(hello_world)
```

In other words, all the `@decorator_function` statement doing is calling `decorator_function` with `hello_world` as its argument, and assigning the returned function to the name `hello_world`.

While this example may have been a “whoa” moment, the decorator wasn’t really a useful one. Let’s look at some more examples, hopefully, useful ones.

```python
def benchmark(func):
    import time
    
    def wrapper():
        start = time.time()
        func()
        end = time.time()
        print('[*] Execution time: {} seconds.'.format(end-start))
    return wrapper

@benchmark
def fetch_webpage():
    import requests
    webpage = requests.get('https://google.com')

fetch_webpage()
```

Here I’ve taken created a decorator that would measure the time taken by a function to execute. It’s a fairly useful decorator, I’ve used it on a function that `GET`s the homepage of Google. As you can see, I’ve saved the time before calling the wrapped function, and after calling the wrapped function, and by subtracting those two I got the time of execution. 

On running the above I got the following output

```
[*] Execution time: 1.4326345920562744 seconds.
```

You must have started realizing how useful decorators can be. It adds functionality to a function without modifying the original code, and it gives you complete flexibility over what you want to do // modify. The possibilities are endless!

### Using arguments and return-value

In the examples we’ve looked at so far, the decorated functions were neither taking any arguments, nor they were returning anything. Let’s look expand the `benchmark` decorator to include that.

```python
def benchmark(func):
    import time
    
    def wrapper(*args, **kwargs):
        start = time.time()
        return_value = func(*args, **kwargs)
        end = time.time()
        print('[*] Execution time: {} seconds.'.format(end-start))
        return return_value
    return wrapper

@benchmark
def fetch_webpage(url):
    import requests
    webpage = requests.get(url)
    return webpage.text

webpage = fetch_webpage('https://google.com')
print(webpage)
```

 Of which the output is

```plaintext
[*] Execution time: 1.4475083351135254 seconds.
<!doctype html><html itemscope="" itemtype="http://schema.org/WebPage"........
```

You can see that the arguments of the decorated function get passed to the wrapper function, and then you’re free to do anything with it. You can modify the arguments and then pass them to the decorated function, or you can pass them unmodified, or you can discard them completely and pass whatever pleases you to the decorated function. Same goes with the returned value from the decorated function, do whatever you want with it. Here in the example, I’ve kept the arguments and the return value of the decorated function unmodified.

### Decorators with arguments

We can also define decorators which take arguments. It’d be best to look at the code in order to understand this —

```python
def benchmark(iters):
    def actual_decorator(func):
        import time
        
        def wrapper(*args, **kwargs):
            total = 0
            for i in range(iters):
                start = time.time()
                return_value = func(*args, **kwargs)
                end = time.time()
                total = total + (end-start)
            print('[*] Average execution time: {} seconds.'.format(total/iters))
            return return_value

        return wrapper
    return actual_decorator


@benchmark(iters=10)
def fetch_webpage(url):
    import requests
    webpage = requests.get(url)
    return webpage.text

webpage = fetch_webpage('https://google.com')
print(webpage)
```

Here I’ve extended the benchmark decorator so that it runs the decorated function a given number of times (specified using the `iters` parameter), and then prints out the average time taken by the function to execute. But to do this, I’ve had to use a little trick — exploiting the nature of functions in Python.

The benchmark function, which may at first look like a decorator, is not really a decorator. It’s a normal function, which accepts the argument `iters`, and _returns_ a decorator. That decorator, in turn, decorates the `fetch_webpage` function. That’s why we haven’t used the statement `@benchmark`, rather we’ve used `@benchmark(iters=10)` — meaning the `benchmark` function is getting called here (a function with parentheses after it signifies a function call) and the return value of that function is the actual decorator.

It’s admittedly a kind of tricky to understand, the following rule-of-thumb will help you

> Decorator function takes a function as an argument, and returns a function.

Here in the example, the `benchmark` function doesn’t satisfy this rule of thumb, because it doesn’t take a function as an argument. Whereas the `actual_decorator` function—which is returned by `benchmark`—is a decorator, because it satisfies the above rule-of-thumb.

### Objects as decorators

Lastly, I want to mention that not only functions but any _callable_ can also be a decorator. Class instances // objects with a [`__call__`](https://docs.python.org/3/reference/datamodel.html#object.__call__) method can be called too, so that can be used as a decorator as well. This functionality can be used to create decorators with some kind of “state”. For example, Scott Lobdell shows how he created a memoization decorator in his blog [here](http://scottlobdell.me/2015/04/decorators-arguments-python/). I’ll post the code here but won’t go into detail explaining it, you can check out his blog post for a write-up on this.

```python
from collections import deque

class Memoized(object):
    def __init__(self, cache_size=100):
        self.cache_size = cache_size
        self.call_args_queue = deque()
        self.call_args_to_result = {}

    def __call__(self, fn, *args, **kwargs):
        def new_func(*args, **kwargs):
            memoization_key = self._convert_call_arguments_to_hash(args, kwargs)
            if memoization_key not in self.call_args_to_result:
                result = fn(*args, **kwargs)
                self._update_cache_key_with_value(memoization_key, result)
                self._evict_cache_if_necessary()
            return self.call_args_to_result[memoization_key]
        return new_func

    def _update_cache_key_with_value(self, key, value):
        self.call_args_to_result[key] = value
        self.call_args_queue.append(key)

    def _evict_cache_if_necessary(self):
        if len(self.call_args_queue) > self.cache_size:
            oldest_key = self.call_args_queue.popleft()
            del self.call_args_to_result[oldest_key]

    @staticmethod
    def _convert_call_arguments_to_hash(args, kwargs):
        return hash(str(args) + str(kwargs))


@Memoized(cache_size=5)
def get_not_so_random_number_with_max(max_value):
    import random
    return random.random() * max_value
```

## Conclusion

I hope this post helped you understand the power of decorators, and also the “magic” behind it. If you have any questions, post it in the comments down below and I’ll try my best to get back to you.  



<script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML' async></script>

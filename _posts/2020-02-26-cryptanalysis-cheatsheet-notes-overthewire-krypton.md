---
title: "Cryptanalysis Cheatsheet :: Notes from Overthewire Krypton"
date: Feb 26 2020
---

I've been on a wargame streak! After doing [Leviathan](https://sumit-ghosh.com/articles/notes-overthewire-leviathan/), I jumped into [Krypton](https://overthewire.org/wargames/krypton/) and completed it; and this post is in a way a write-up of Krypton. Krypton, Leviathan, in case these words sound alien to you: well they're wargames—or Ctfs—hosted by [Overthewire.org](https://overthewire.org/wargames/). They're very internet favorite and beginners often start with them, and that's why I did exactly that. Also, instead of following the standard writeup format, this post will be more of a collection of notes for future reference.

### Cracking the Caesar cipher

As there are only 26 possible key values, we can just brute force through them and select the best key. The selection of the best key can be done manually, by checking if the corresponding plaintext is English or not. It can also be done algorithmically, but for that, we'll need some statistical measure to quantify how close the plaintext is to standard English. The following can be helpful to that end.

- Chi-squared value
- N-gram probability

### Identifying substitution cipher: monoalphabetic vs polyalphabetic

The [_index of coincidence_](http://practicalcryptography.com/cryptanalysis/text-characterisation/index-coincidence/), or IC helps us in identifying whether a ciphertext was encrypted with a monoalphabetic or a polyalphabetic substitution cipher.

- Index of coincidence captures the overall nature of the distribution curve of the letters, how _flat_ or _rough_ the distribution is; it does not capture the distribution of each individual letters. The higher the IC, the more rough// skewed the distribution of letters in the ciphertext is. Standard English has a [fairly rough distribution](https://en.wikipedia.org/wiki/Letter_frequency) of letters, thus a high IC count, approximately 0.067.
- If the IC of the ciphertext is close to that of English, it's a monoalphabetic cipher. If it's considerably smaller than that of English, it's polyalphabetic.

### Monoalphabetic substitution cipher

#### Manual cryptanalysis

1. Frequency analysis :: Find the frequencies of the characters in the ciphertext and list them in descending order. Then assume that the characters—in order—correspond to the standard frequency order of characters in English; i.e. the most frequent character of the cipher is the encrypted version of 'E', the most frequent character in English, and so on.
2. Manual inspection :: The result of the previous step won't be perfect English, but some parts of it will start to resemble English words. Identify them and keep correcting the substitution key accordingly until you reach a text in perfect English.

#### Algorithmic cryptanalysis

A standard hill-climbing algorithm can be used to crack monosubstitution ciphers. The algorithm starts with a random key and makes some small changes to it. If the changes result in a _better_ key, it keeps that and makes changes in that, and in this way it carries on until it reaches a peak, i.e. no more improvement is possible.

For this, you'll need a measure of how good your key is. As we discussed in the section on the Caesar cipher, one way to do this is to decrypt the ciphertext with the key and measure how close the resulting plaintext is to standard English. But then, you'll need a way to quantify this _closeness_. Below are some statistical measures that do exactly that:

- Chi-squared value
- N-gram probability

[Here](https://github.com/SkullTech/cryptanalysis-scripts) is a script I wrote that implements this, and it can crack all monoalphabetic substitution ciphers pretty easily.

### Cracking the Vignere cipher

#### Step 1: Finding out the key length

Once again, the index of coincidence comes to the rescue!!

Let's assume the key length is k = 3. Now, split the ciphertext into 3 parts, one containing the 1st letter of every 3 letter blocks, other containing every 2nd letter, and another containing every 3rd letter. Calculate the IC of each part and take the average. If the average IC is close to that of English, our assumed k is the correct one. If it isn't, try with some other value of k. In this way, we can brute force the value of k, starting from 2 and going up. [Here](http://practicalcryptography.com/cryptanalysis/stochastic-searching/cryptanalysis-vigenere-cipher/) is a more detailed explanation of this method.

#### Step 2: Finding out the key

Once we have the key length, we can find the key letter by letter, using the aid of chi-squared analysis. For example, the 1st letter of the key can be found out by ::

1. Creating a string containing the 1st letter of every block of the ciphertext.
2. Now, as all the letters of this string were encrypted with a single letter of the key, the problem reduces to that of a caesar cipher. We can brute force all the letters of the alphabet and find the letter which yields the best plaintext, i.e. the one with the best chi-squared value.

We can run the above two steps k times to get all the letters of the key.

[Here](https://github.com/SkullTech/cryptanalysis-scripts) is a script that implements the above both of the above steps, and thus automates the entire process of cracking a Vignere cipher.

### Cryptanalysis of LFSR encryption

LFSR is not an encryption technique, rather, it's an algorithm for generating pseudorandom numbers. The sequence of pseudorandom numbers generated by an LFSR can be used as the one-time pad for an encryption algorithm. However, it has a major weakness: the numbers generated are periodic, and an attacker can figure out the key using a known plaintext attack.

Berlekamp–Massey algorithm is the algorithm for cracking LFSR sequences.

- [Practical Cryptography article](http://practicalcryptography.com/cryptanalysis/modern-cryptanalysis/lfsrs-and-berlekampmassey-algorithm/)
- [Wikipedia article](https://en.wikipedia.org/wiki/Berlekamp%E2%80%93Massey_algorithm)

The challenge on Krypton, however, is very simple and does not necessitate the Berlekamp–Massey algorithm.

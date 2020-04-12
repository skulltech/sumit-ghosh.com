Basic Challenges
________________


Challenge 1 :: Find the password in the page
Look at source code in inspector, look for password, it's an HTML comment.

Challenge 2 :: Break a JavaScript protected login form.
Again, the username and password is in plain-text in the source. The JS is just checking if the strings are equal.

Challenge 3 ::
Didn't get the part about C99 files. Moving on.
The URLs are in the form https://thisislegal.com/challenge3/index.php?file=about
Seems like it might be vulnerable to some form of path injection.
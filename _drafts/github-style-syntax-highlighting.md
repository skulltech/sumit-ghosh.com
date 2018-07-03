I love the syntax highlighting scheme github uses, so I've been trying to look into it, how can it be implemented in my blog. Little did I know, this would lead me down a rabbit hole of markdown engines and licensing issues.

First I started looking at the source code of the code blocks in github's webpages. First thing I noticed is, The syntax highligting classes they used were somewhat different from the standard ones. For example, they all start with the prefix `-pl`. To confirm this, I looked around a lot, looking at differnet syntax highlighting CSS files, and differnet markdown parsers. Then I confirmed that github doesn't use the standard convention. I did stumble upon the stylesheets used by github for syntax highlighting tho, but unless I was able to generate the corresponding HTML it would be of no use.


### Using rougify and pygmentise to generate stylesheets

- Github Pages __Only__ supports __kramdown__ - https://help.github.com/articles/updating-your-markdown-processor-to-kramdown/
- Github syntax theme stlysheets (generator) - https://github.com/primer/github-syntax-theme-generator
- Issue https://github.com/isaacs/github/issues/922
- Issue on Prettylights development - https://github.com/github/pages-gem/issues/160
- Relevant Issue - https://github.com/jekyll/jekyll/issues/4265
- Custom Markdown Engine - https://jekyllrb.com/docs/configuration/#custom-markdown-processors
- Why markdown sucks - https://joearms.github.io/published/2016-03-21-Why-Markdown-Sucks.html
- Linguist - https://github.com/github/linguist
- Most relevant Issue - https://github.com/github/linguist/issues/1984
- Github doc - https://help.github.com/articles/creating-and-highlighting-code-blocks/
- Solarized stylesheets
    - https://gist.github.com/nicolashery/5765395
    - https://github.com/gthank/solarized-dark-pygments

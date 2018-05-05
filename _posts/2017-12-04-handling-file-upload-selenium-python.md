---
title: Handling File Upload Through Selenium Python
subtitle: 'A necessary rite of passage for Selenium programmers'
tags:
  - Programming
  - Selenium
  - Python
  - Automation
date: '2017-12-04'
---

Once you start playing around with Selenium, sooner or later you're gonna face the problem of handling file uploads. It's like a rite of passage every Selenium programmers must go through. The problem with file upload is, once you click the upload button, the select file dialog box which opens up is a owned by the OS, not the browser, so you cannot control it using Selenium, meaning we have to find our way around it. There are different ways this can be accomplished.

## Directly passing file path to the `input` element

In this approach, we are going to bypass the select-file dialog box completely, passing the file-path to the webpage without ever opening it. We know that if the webpage is handling a file-upload, it must be having an `input` tag with `type=file` in it. Firstly you should check if Selenium can access this `input` tag and modify it. For that, try the following code

```python
file_input = driver.find_element_by_id('theFileInputElement')
file_input.send_keys('/path/to/file')
```

As you can see, we are selecting the `input` element, and then passing the path of the to-be-uploaded file to it using the `send_keys` method. An example page on which this approach would work is the [image upload page of _Imgur_](https://imgur.com/upload). It contains a `input` tag like the below mentioned HTML snippet - 

```html
<input type="file" id="global-files-button" class="nodisplay" name="files[]" multiple-accept=".jpg,.jpeg,.png,.gif,.apng,.tiff,.tif,.bmp,.pdf,.xcf,.webp,.mp4,.mov">
```

Which can be handled by
```python
driver.find_element_by_id('global-files-button').send_keys('/path/to/image/file')
```

But this approach doesn't always work. Sometimes this code will throw an error stating that the element is not accessible. Usually this happens when the webpage handles file upload through some Javascript sorcery, instead of going the usual way. In that case, you'll have to first modify the input element and make it accessible to Selenium. Check the following code - 

```python
file_input = driver.find_element_by_css_selector('input.dz-hidden-input')
driver.execute_script('arguments[0].style = ""; arguments[0].style.display = "block"; arguments[0].style.visibility = "visible";', file_input)
```

In the second line of the above code sample, we are running a javascript snippet which modifies the inaccessible `<input>` tag, making it visible and accessible. After this, we can send the file-path to it using `send_keys`, like we did above.

## Controlling the file-upload dialogue (Not recommended)

Another way you could do this is, use some scripting tool to control the select-file dialog box. This is not recommended at all, as there doesn't exist any cross-platform solution to do this. For windows, you could take a look at [__`AutoIt`__](https://www.autoitscript.com/site/autoit/). But as it's not cross-platform, I won't recommend it.

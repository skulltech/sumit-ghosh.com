---
comments: true
date: 2016-12-31 15:26:50+00:00
slug: email-structure-and-how-to-trace-it
title: Email | Structure and How to Trace it
wordpress_id: 589
categories:
- Email
- Hacking
- Networking
tags:
- Email
- Headers
- Tracing
---

We all have received fake spam mail telling us that we’ve won million dollars at some point in our life. Maybe one day you receive a threatening email or a simple phishing mail, and you want to find out who did it so that you can hack him in return. To do that you need to know the IP address of the mail server sending the email. In this article I’m gonna show you how to do that, after introducing you to the basics of the structure of an _Internet Message_ or simply, _Email_.

Email is one of oldest mode of communication through a computer network (usually the Internet) which is still popular today. The Email which we are familiar with was standardized and came into popular usage in the early 1970s, and it has been a core foundation of the Internet since then. Nowadays we all use a fancy web interface or mobile app to send and view received emails, so we don’t have to worry about how is it working. But that isn’t enough for a hacker, is it? If we don’t know the detailed intricacies of its mechanism, how can we exploit it or do something advanced with it? So, keep reading!



## The Internet Message Format



The current Email format is defined in [RFC 5322](https://tools.ietf.org/html/rfc5322). Multimedia Email attachments’ format is defined in [RFC 2045](https://tools.ietf.org/html/rfc2045) through [RFC 2049](https://tools.ietf.org/html/rfc2049), and this format is called Multimedia Internet Mail Extensions or simply MIME. You can read those RFC articles to get a fully detailed formal documentation of the structure and format of email, but it’s not necessary as I will discuss it in short here. Nevertheless, if you are interested to learn more, you can check them out after reading this post of mine.

At the most basic level, an email is a series of ASCII characters. It consists of line of characters, lines ending with ASCII ‘CRLF’ (carriage return and line feed). The entire email can be divided into two parts, the Header section and the Body. Let’s see an example email to get an idea of what we are talking about.


``` 
Delivered-To: john.doe@gmail.com
Received: by 10.200.55.226 with SMTP id e31csp1128773qtc;
Tue, 18 Oct 2016 09:50:19 -0700 (PDT)
X-Received: by 10.107.131.213 with SMTP id n82mr2118112ioi.125.1476809419401;
Tue, 18 Oct 2016 09:50:19 -0700 (PDT)
Return-Path: 
Received: from o6.em.email.accounts.autodesk.com (o6.em.email.accounts.autodesk.com. [167.89.4.107])
by mx.google.com with ESMTPS id g126si21395826ioa.252.2016.10.18.09.50.19
for 
(version=TLS1_2 cipher=ECDHE-RSA-AES128-GCM-SHA256 bits=128/128);
Tue, 18 Oct 2016 09:50:19 -0700 (PDT)
Received-SPF: pass (google.com: domain of bounces+1621835-f4d2-john.doe=gmail.com@em.email.accounts.autodesk.com designates 167.89.4.107 as permitted sender) client-ip=167.89.4.107;
Authentication-Results: mx.google.com;
dkim=pass header.i=@email.accounts.autodesk.com;
dkim=pass header.i=@sendgrid.info;
spf=pass (google.com: domain of bounces+1621835-f4d2-john.doe=gmail.com@em.email.accounts.autodesk.com designates 167.89.4.107 as permitted sender) smtp.mailfrom=bounces+1621835-f4d2-john.doe=gmail.com@em.email.accounts.autodesk.com
DKIM-Signature: v=1; a=rsa-sha1; c=relaxed; d=email.accounts.autodesk.com; h=mime-version:from:to:reply-to:subject:content-type:content-transfer-encoding; s=smtpapi; bh=yheKlMFCWTtON78IXgxVWyAUb78=; b=I8q38u7TFdqinW6Y02 AM+ifHWAvTihYfBs5GSZl8JDnuc1BlMffeS8KUkWyRJjLY+B0ch4uPXBvCHdCZ75 VGkMp0jmmQRyVzQ4hfvAeTYVJ0fDzB89cHKyTzLTpd/ak9D0OAcc+6TJFqCgURMH CSrAzDL/ejxBTOEgepL8Y3Feg=
DKIM-Signature: v=1; a=rsa-sha1; c=relaxed; d=sendgrid.info; h=mime-version:from:to:reply-to:subject:content-type:content-transfer-encoding:x-feedback-id; s=smtpapi; bh=yheKlMFCWTtON78IXgxVWyAUb78=; b=YK6zoBmBYxE2GRUFIh Qze6EJGuxLw1UtO+NGfdmUgSmtNVLUt8p/N+CS9nPNONFESaVo2Ebk0iV8OBXqs0 EhPaOVOIiAcnSI/fwzd8A/dN+y3gqNquU3ysc9Gyk3kDcFSI8nj9yC4uhAs4fpMv AC/2kWdHjFjHBiTRYcL07C46M=
Received: by filter0958p1mdw1.sendgrid.net with SMTP id filter0958p1mdw1.2775.580652C7AF
2016-10-18 16:50:15.915852162 +0000 UTC
Received: from ECPRID2AWEB004 (ec2-52-4-196-162.compute-1.amazonaws.com [52.4.196.162]) by ismtpd0006p1iad1.sendgrid.net (SG) with ESMTP id aIawJW2DTFi0CgbichcKJg for ; Tue, 18 Oct 2016 16:50:15.917 +0000 (UTC)
MIME-Version: 1.0
From: Autodesk 
To: john.doe@gmail.com
Reply-To: noreply@mail.accounts.autodesk.com
Date: 18 Oct 2016 16:50:15 +0000
Subject: Verify your Autodesk account
Content-Type: text/html; charset=utf-8
Content-Transfer-Encoding: base64
Message-ID: 
X-SG-EID: iimKsBOu00eJI3OJPONMulw6aZ/yjiemm1SqdEDLcTZBP1eHyN3Qr32i1Vdhd5J7BwflVrWhRCLr0j woo/OKUHaIA1bGmnv8Qd2DfN0OSocqGDQ8DK7afms0hcjbrNUG/S3Bsv7fJWCR15UEaoJ/qfJtpdgG gZSAdl3d07GxUEWB0KHMNBmsfHLUEhfyzWPfn5IBYcQ334wRxcWBQ/eu31XQd8fIXETIiBgrd19ic6 SiLuZKRyxs7mVzCv46+9G/
X-Feedback-ID: 1621835:SZNY+iwS6efjfOV9JjNuzvzTddPNBc3FolKu4zujGFA=:SZNY+iwS6efjfOV9JjNuzvzTddPNBc3FolKu4zujGFA=:SG
    
PGh0bWw+DQo8aGVhZD4NCjxsaW5rIGhyZWY9Imh0dHA6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9j
c3M/ZmFtaWx5PU9wZW4rU2Fuczo0MDAsMzAwLDcwMCIgcmVsPSJzdHlsZXNoZWV0IiB0eXBlPSJ0
ZXh0L2NzcyIgLz4NCjxzdHlsZT4NCiAgICAgICBAaW1wb3J0IHVybChodHRwOi8vZm9udHMuZ29v
Z2xlYXBpcy5jb20vY3NzP2ZhbWlseT1PcGVuK1NhbnM6NDAwLDMwMCw3MDApOw0KCSAgIFtzdHls
ZSo9Ik9wZW4gU2FucyJdIHsNCiAgICBmb250LWZhbWlseTogJ09wZW4gU2FucycsIEFyaWFsLCBz
YW5zLXNlcmlmICFpbXBvcnRhbnQNCn0NCg0KYXsNCnRleHQtZGVjb3JhdGlvbjpub25lICFpbXBv
cnRhbnQ7DQpjb2xvcjojMDY5NkQ3ICFpbXBvcnRhbnQ7DQp9DQphOmhvdmVyew0KdGV4dC1kZWNv
cmF0aW9uOnVuZGVybGluZSAhaW1wb3J0YW50Ow0KDQp9DQo8L3N0eWxlPg0KPC9oZWFkPg0KICA8
Ym9keSBzdHlsZT0icGFkZGluZzozMnB4IDEwJTsgbWFyZ2luOjBweDsgZm9udC1mYW1pbHk6J09w
ZW4gU2FucycsICdIZWx2ZXRpY2EgTmV1ZScsIEhlbHZldGljYSxBcmlhbCwgU2Fucy1TZXJpZjtj
b2xvcjogIzMzMzsgYmFja2dyb3VuZC1jb2xvcjogI0ZGRkZGRjsiPg0KICAgIDx0YWJsZSAgc3R5
bGU9ImJvcmRlcjoxcHggc29saWQgI2NjYzsiICA+DQogICAgICAgPHRyICA+DQogICAgICAgICA8
dGQgc3R5bGU9InBhZGRpbmc6MHB4O21hcmdpbjozMnB4O21hcmdpbi1ib3R0b206MHB4OyIgYWxp
Z249ImxlZnQiPg0KICAgICAgICAgICAgPGltZyBzdHlsZT0ibWFyZ2luOjMycHg7bWFyZ2luLWJv
dHRvbTowcHgiIHNyYz0iaHR0cHM6Ly9hcGkuYXV0b2Rlc2suY29tL2NvbnRlbnQvaWRlbnRpdHkv
MS4wLjIxMTguMzg4MTU5LjEwMjMvei9Db250ZW50L2ltYWdlcy9sYXlvdXQvYXV0b2Rlc2stZW1h
aWwtbG9nby5wbmciIGFsdD0iQXV0b2Rlc2siLz4NCiAgICAgICAgIDwvdGQ+DQogICAgICA8L3Ry
Pg0KICAgICAgPHRyID4NCiAgICAgICAgPHRkIHN0eWxlPSJwYWRkaW5nOjMycHg7Ij4NCiAgICAg
ICAgICA8dGFibGUgYm9yZGVyPSIwIiBjZWxsc3BhY2luZz0iMCIgY2VsbHBhZGRpbmc9IjAiIHdp
ZHRoPSIxMDAlIiBzdHlsZT0id2lkdGg6IDEwMCU7Ij4NCiAgICAgICAgICAgIDx0ciBzdHlsZT0i
bWFyZ2luOjMycHg7bWFyZ2luLWxlZnQ6MHB4Ij4NCiAgICAgICAgICAgICAgPHRkPg0KCQkJICAg
IDx0YWJsZSBib3JkZXI9IjAiIGNlbGxzcGFjaW5nPSIwIiBjZWxscGFkZGluZz0iMCIgc3R5bGU9
ImZvbnQtZmFtaWx5OiAnT3BlbiBTYW5zJywnSGVsdmV0aWNhIE5ldWUnLCBIZWx2ZXRpY2EsQXJp
YWwsIFNhbnMtU2VyaWYiPg0KCQkJCSAgICA8dHI+DQoJCQkJCSAgICA8dGQgIHN0eWxlPSJmb250
LWZhbWlseTogJ09wZW4gU2FucycsJ0hlbHZldGljYSBOZXVlJywgSGVsdmV0aWNhLEFyaWFsLCBT
YW5zLVNlcmlmIj4NCgkJCQkgICAgICAgICAgICA8cCBzdHlsZT0iZm9udC1zaXplOiAyMnB4O21h
cmdpbjowcHg7cGFkZGluZzowcHg7Zm9udC13ZWlnaHQ6NDAwIj4NCgkJCQkgICAgICAgICAgICAg
SGkgU3VtaXQgR2hvc2gsDQoJCQkJICAgICAgICAgICAgPC9wPg0KCQkJCSAgICAgICAgICAgIDxw
IHN0eWxlPSJmb250LXNpemU6IDE0cHg7bWFyZ2luOjBweDtwYWRkaW5nOjBweDttYXJnaW4tdG9w
OjE2cHg7Zm9udC1mYW1pbHk6J09wZW4gU2FucycsJ0hlbHZldGljYSBOZXVlJywgSGVsdmV0aWNh
LGFyaWFsO2ZvbnQtd2VpZ2h0OjQwMDtsaW5lLWhlaWdodDoxLjYiPg0KCQkJCQkgICAgICAgICAg
IFdlbGNvbWUgdG8gQXV0b2Rlc2shDQoJCQkJICAgICAgICAgICAgPC9wPg0KCQkJCQkJCSA8cCBz
dHlsZT0iZm9udC1zaXplOiAxNHB4O2NvbG9yOiMzMzM7dGV4dC1kZWNvcmF0aW9uOm5vbmU7cGFk
ZGluZzowcHg7bWFyZ2luOjBweDtmb250LWZhbWlseTonT3BlbiBTYW5zJywnSGVsdmV0aWNhIE5l
dWUnLCBIZWx2ZXRpY2EsYXJpYWw7Zm9udC13ZWlnaHQ6NDAwO2xpbmUtaGVpZ2h0OjEuNiI+DQoJ
CQkJCSAgICAgICAgICAgUGxlYXNlIGNvbXBsZXRlIHlvdXIgYWNjb3VudCBieSB2ZXJpZnlpbmcg
eW91ciBlbWFpbCBhZGRyZXNzLg0KCQkJCSAgICAgICAgICAgIDwvcD4NCgkJCQkgICAgICAgICAg
ICA8cCA+DQoJCQkJCQkJICA8IS0tW2lmIG1zb10+DQoJCQkJCQkJICAgIDxwIHN0eWxlPSJtYXJn
aW4tdG9wOjE2cHg7bWFyZ2luLWJvdHRvbTozMnB4OyI+DQogICAgICAgICAgICAgICAgICAgICAg
ICAgICAgICAgICAgIDx2OnJvdW5kcmVjdCB4bWxuczp2PSJ1cm46c2NoZW1hcy1taWNyb3NvZnQt
Y29tOnZtbCIgeG1sbnM6dz0idXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTpvZmZpY2U6d29yZCIg
aHJlZj0iaHR0cHM6Ly9hY2NvdW50cy5hdXRvZGVzay5jb206NDQzL3VzZXIvdmVyaWZ5ZW1haWwv
MzlkYzYwNjhiYTgwMzc2ZTVhY2ZhN2NiOWE3ZDUwZDM3MTM3NGMyMz9yZWZlcnJlcj1odHRwJTNB
JTJGJTJGd3d3LmF1dG9kZXNrLmNvbSUyRmVkdWNhdGlvbiUyRmZyZWUtc29mdHdhcmUlMkZpbnZl
bnRvci1wcm9mZXNzaW9uYWwmcHJvZHVjdG5hbWU9ZG90Y29tJnVpdHlwZT1lZHVjYXRpb24iIHN0
eWxlPSJoZWlnaHQ6NTBweDt3aWR0aDogMjAwcHg7di10ZXh0LWFuY2hvcjptaWRkbGU7d2lkdGg6
YXV0bzt0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyIgYXJjc2l6ZT0iMCUiICBzdHJva2U9ImYi
IGZpbGxjb2xvcj0iIzA2OTZENyI+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg
ICA8dzphbmNob3Jsb2NrLz4NCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8
Y2VudGVyIHN0eWxlPSJjb2xvcjojZmZmZmZmO2ZvbnQtZmFtaWx5OidPcGVuIFNhbnMnLCdIZWx2
ZXRpY2EgTmV1ZScsIEhlbHZldGljYSxhcmlhbDtmb250LXNpemU6MTlweCI+DQogICAgICAgICAg
ICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWRVJJRlkgRU1BSUwNCiAgICAgICAgICAgICAg
ICAgICAgICAgICAgICAgICAgICAgICAgPC9jZW50ZXI+DQogICAgICAgICAgICAgICAgICAgICAg
ICAgICAgICAgICAgIDwvdjpyb3VuZHJlY3Q+DQoJCQkJCQkJCSAgIDwvcD4NCiAgICAgICAgICAg
ICAgICAgICAgICAgICAgICAgPCFbZW5kaWZdLS0+DQogICAgICAgICAgICAgICAgICAgICAgICAg
ICAgIDwhW2lmICFtc29dPg0KCQkJCQkJCSAgICAgPHRhYmxlIGJvcmRlcj0iMCIgc3R5bGU9Im1h
cmdpbi10b3A6MzJweDttYXJnaW4tYm90dG9tOjQ4cHg7d2lkdGg6IDEwMCU7IiBjZWxsc3BhY2lu
Zz0iMCIgY2VsbHBhZGRpbmc9IjAiIHdpZHRoPSIxMDAlIiA+DQogICAgICAgICAgICAgICAgICAg
ICAgICAgICAgICAgICAgICA8dHIgPg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg
ICAgPHRkID4NCgkJCQkJCQkgICAgICAgICAgPHRhYmxlIGFsaWduPSJsZWZ0IiBzdHlsZT0idGV4
dC1hbGlnbjogY2VudGVyO3ZlcnRpY2FsLWFsaWduOmNlbnRlcjsgY29sb3I6ICNmZmY7IGRpc3Bs
YXk6IGJsb2NrOyI+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+DQog
ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+DQogICAgICAgICAgICAgICAg
ICAgICAgICAgICAgICAgICAgPGEgc3R5bGU9ImNvbG9yOiNmZmYgIWltcG9ydGFudDtwYWRkaW5n
OiAxNnB4O2hlaWdodDo1MHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiMwNjk2RDc7Zm9udC1zaXplOjE5
cHg7dGV4dC1kZWNvcmF0aW9uOm5vbmU7dGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtmb250LWZh
bWlseTogJ09wZW4gU2FucycsJ0hlbHZldGljYSBOZXVlJywgSGVsdmV0aWNhLEFyaWFsLCBTYW5z
LVNlcmlmIiBocmVmPSJodHRwczovL2FjY291bnRzLmF1dG9kZXNrLmNvbTo0NDMvdXNlci92ZXJp
ZnllbWFpbC8zOWRjNjA2OGJhODAzNzZlNWFjZmE3Y2I5YTdkNTBkMzcxMzc0YzIzP3JlZmVycmVy
PWh0dHAlM0ElMkYlMkZ3d3cuYXV0b2Rlc2suY29tJTJGZWR1Y2F0aW9uJTJGZnJlZS1zb2Z0d2Fy
ZSUyRmludmVudG9yLXByb2Zlc3Npb25hbCZwcm9kdWN0bmFtZT1kb3Rjb20mdWl0eXBlPWVkdWNh
dGlvbiI+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWRVJJRlkgRU1B
SUwNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT4NCiAgICAgICAgICAgICAg
ICAgICAgICAgICAgICAgICAgPC90ZD4NCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg
IDwvdHI+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPg0KCQkJCQkJCSAg
ICA8L3RkPg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj4NCiAgICAgICAg
ICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+DQogICAgICAgICAgICAgICAgICAgICAgICAg
ICA8IVtlbmRpZl0+DQoJCQkJCQkgICA8L3A+DQoJCQkJICAgICAgICAgICANCgkJCQkgICAgICAg
ICAgICA8cCBzdHlsZT0id29yZC13cmFwOmJyZWFrLXdvcmQ7IGRpc3BsYXk6IGJsb2NrO2ZvbnQt
c2l6ZTogMTJweDtmb250LWZhbWlseTogJ09wZW4gU2FucycsJ0hlbHZldGljYSBOZXVlJywgSGVs
dmV0aWNhLEFyaWFsLCBTYW5zLVNlcmlmO2ZvbnQtd2VpZ2h0OjQwMDtsaW5lLWhlaWdodDoxLjYi
Pg0KCQkJCQkgICAgICAgICAgICBJZiB0aGUgbGluayBhYm92ZSBkb2Vzbid0IHdvcmssIHlvdSBj
YW4gY29weSBhbmQgcGFzdGUgdGhlIGZvbGxvd2luZyBpbnRvIHlvdXIgYnJvd3Nlcjo8YnIvPg0K
CQkJCQkgICAgICAgICAgICBodHRwczovL2FjY291bnRzLmF1dG9kZXNrLmNvbTo0NDMvdXNlci92
ZXJpZnllbWFpbC8zOWRjNjA2OGJhODAzNzZlNWFjZmE3Y2I5YTdkNTBkMzcxMzc0YzIzP3JlZmVy
cmVyPWh0dHAlM0ElMkYlMkZ3d3cuYXV0b2Rlc2suY29tJTJGZWR1Y2F0aW9uJTJGZnJlZS1zb2Z0
d2FyZSUyRmludmVudG9yLXByb2Zlc3Npb25hbCZwcm9kdWN0bmFtZT1kb3Rjb20mdWl0eXBlPWVk
dWNhdGlvbg0KCQkJCSAgICAgICAgICAgIDwvcD4NCiAgICAJCQkgICAgICAgIDwvdGQ+DQogICAg
ICAgICAgICAgICAgICAgICAgPC90cj4NCiAgICAgICAgICAgICAgICAgIDwvdGFibGU+DQogICAg
ICAgICAgICAgIDwvdGQ+DQogICAgICAgICAgICA8L3RyPg0KICAgICAgICAgIDwvdGFibGU+DQog
ICAgICAgIDwvdGQ+DQoJPC90cj4NCiAgICA8L3RhYmxlPg0KCTx0YWJsZT4NCgk8dHI+DQogICAg
ICAgIDx0ZCBzdHlsZT0iY29sb3I6ICM5OTk7IGZvbnQtc2l6ZTogMTJweDsgZm9udC1mYW1pbHk6
J09wZW4gU2FucycsICdIZWx2ZXRpY2EgTmV1ZScsIEhlbHZldGljYSxBcmlhbCwgU2Fucy1TZXJp
Zjtmb250LXdlaWdodDo0MDA7bGluZS1oZWlnaHQ6MS42Ij4NCiAgICAgICAgPHAgc3R5bGU9Im1h
cmdpbi10b3A6IDE2cHg7IHBhZGRpbmctdG9wOiAwO21hcmdpbi1ib3R0b206MHB4Ij4NCiAgICAg
ICAgICAgICAgQXV0b2Rlc2sgcmVzcGVjdHMgeW91ciBwcml2YWN5LiAgRm9yIG1vcmUgaW5mb3Jt
YXRpb24sIHBsZWFzZSByZXZpZXcgb3VyIDxhIGhyZWY9Imh0dHA6Ly91c2EuYXV0b2Rlc2suY29t
L3ByaXZhY3kvIj5Qcml2YWN5IFBvbGljeTwvYT4uDQogICAgICAgPC9wPg0KCSAgIDxwICBzdHls
ZT0ibWFyZ2luLXRvcDogMDttYXJnaW4tYm90dG9tOiAwOyBwYWRkaW5nLXRvcDogMDtjb2xvcjog
Izk5OTsgZm9udC1zaXplOiAxMnB4OyBmb250LWZhbWlseTonT3BlbiBTYW5zJywgJ0hlbHZldGlj
YSBOZXVlJywgSGVsdmV0aWNhLEFyaWFsLCBTYW5zLVNlcmlmO2ZvbnQtd2VpZ2h0OjQwMDtsaW5l
LWhlaWdodDoxLjYiPg0KCSAgICA8cCBzdHlsZT0icGFkZGluZzogMDsgbWFyZ2luOiAwOyI+DQog
ICZjb3B5OyBDb3B5cmlnaHQgMjAxNiBBdXRvZGVzaywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVk
Lg0KPC9wPgkgICA8L3A+DQogICAgICAgIDwvdGQ+DQogICAgICA8L3RyPg0KCTwvdGFibGU+DQog
IDwvYm9keT4NCjwvaHRtbD4=
```


The part before the first empty line is the header of this email, and after that the rest is body. Here you can see that the body part looks like some incomprehensible garbage, that’s because it is a MIME message, and the garbage part is actually HTML data encoded by Base64 encoding. You can decode it using any of the Base64 decoder found online and get the HTML data. Anyway, we are going to focus on the header part, because all other critical information resides in there, the body part contains just the message.

We can see the header part consists of header fields, each header field consisting of a field name and field value separated by a colon ‘:’.  for example a header field of this email is

```
Delivered-To: john.doe@gmail.com
```

Where ‘Delivered-To’ is the field name and ‘john.doe@gmail.com’ is the field value. Just to be clear, I replaced my original email ID with ‘john.doe@gmail.com’ here.

The header section can contain any number of information in this format, there is no restriction. So there can be different header fields in various emails. But there are certain fields that are mandatory, and those contain the information we need to trace the mail. You can read about various email header fields [here on Wikipedia](https://en.wikipedia.org/wiki/Email#Header_fields).



## Tracing an Email



Now that we know the basics of the _[Internet Message Format](https://tools.ietf.org/html/rfc5322)_, it’s time we dive into the fun stuff, tracing the email. For that, we need to concentrate on the _Trace fields_, so to speak. They contain the information needed to trace it, obviously. The trace fields are:

- _Received_
- _Return-Path_
- _Authentication-Results_
- _Received-SPF_
- _Auto-Submitted_
- _VBR-Info_



Among these, the _Received_ field is the most important and most reliable. When an SMTP server receives a message it inserts this header at the top of the message. And as most emails go through several SMTP servers in the journey from the sender to receiver, it contains several Received fields, each one inserted by different SMTP servers. In the example email the Received fields are:


Received: by 10.200.55.226 with SMTP id e31csp1128773qtc;
        Tue, 18 Oct 2016 09:50:19 -0700 (PDT)




```
X-Received: by 10.107.131.213 with SMTP id n82mr2118112ioi.125.1476809419401;
        Tue, 18 Oct 2016 09:50:19 -0700 (PDT)
Received: from o6.em.email.accounts.autodesk.com (o6.em.email.accounts.autodesk.com. [167.89.4.107])
        by mx.google.com with ESMTPS id g126si21395826ioa.252.2016.10.18.09.50.19
        for 
        (version=TLS1_2 cipher=ECDHE-RSA-AES128-GCM-SHA256 bits=128/128);
        Tue, 18 Oct 2016 09:50:19 -0700 (PDT)
Received: by filter0958p1mdw1.sendgrid.net with SMTP id filter0958p1mdw1.2775.580652C7AF
        2016-10-18 16:50:15.915852162 +0000 UTC    
Received: from ECPRID2AWEB004 (ec2-52-4-196-162.compute-1.amazonaws.com [52.4.196.162]) by ismtpd0006p1iad1.sendgrid.net (SG) with ESMTP id aIawJW2DTFi0CgbichcKJg for ; Tue, 18 Oct 2016 16:50:15.917 +0000 (UTC)
```


As SMTP servers insert the Received field at the top of the email when they receive it, if we read them from top to bottom we can trace the path through the email has travelled. The field value of the Received header field generally contains the host name or IP address of itself and the host name or IP of the server from which it received the mail.

Another thing to note here, I’ve also listed the_ X-Received_ header field. Any field starting with_ X_ is a non-standard header and it cannot be trusted. It’s used by mail servers for their own benefit, generally a servers won’t trust X headers inserted by any other server. Anyway, I’ve still included this because it may give us some additional information, keeping in mind that it is not very reliable. So from the _Received_ (and _X-Received_) fields of the example mail, we can trace the route of the mail, and it would look like this


- `ec2-52-4-196-162.compute-1.amazonaws.com [52.4.196.162]`
- `ismtpd0006p1iad1.sendgrid.net`
- `filter0958p1mdw1.sendgrid.net`
- `o6.em.email.accounts.autodesk.com`
- `mx.google.com`
- `10.107.131.213`
- `10.200.55.226`


The email went through these servers in this order. So the mail server that actually sent the email is the first one, and if you were after that one for reasons, you can focus on that.


## Automating the Tracing of an Email


Although it’s good or maybe essential for a hacker to know how to manually trace an email, you don’t have to do it every time. There are many tools in the Internet that automate this process. You just have to paste the email header in those tools and they will trace the route of it. Just search email header analyser in Google and you’ll get a lot of tools like this. There’s [one made by Google](https://toolbox.googleapps.com/apps/messageheader/) itself, you can get it [here](https://toolbox.googleapps.com/apps/messageheader/). Happy hacking!

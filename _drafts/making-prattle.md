We will need to figure out and build the following components.

- __Video__
    - Video recording from web-cam
    - Showing video, either from the web-cam or received through the network.

- __Audio__
    - Audio recording from microphone.
    - Playing audio received through the network.

- __Networking__
    - Sending audio and video data over sockets live, as they're being recorded.
    - Receiving live audio and video data from the network, and playing them.


Let's start by building the Video components. We will be using OpenCV for this, the most popular open-source image and video processing library.

When playing with videos in OpenCV, one thing you have to keep in mind is a video is nothing but a stream of images, called frames.

Let's start with a very simple example. This function opens a small window showing the live feed from your web-cam.
```python3
import cv2 as cv


def display():
    cap = cv.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        cv.imshow('Live Web-Cam Feed', frame)

        key = cv.waitKey(1)
        if key in [27, 81, 113]:
            break

    cap.release()
    cv.destroyAllWindows()
```

Let's break this code down line-by-line. In the first line, we import the OpenCV library. The library comes with the name _cv2_, but we're importing it with the name _cv_ for convenience.

Then we start writing the code of the function `display`. _Displaying_ the web-cam involves a few steps. Firstly, to read frames from a video source, we need to create a `VideoCapture` object. The argument to the constructor indicates the which camera you want to use in case you have multiple web-cams, but for most people this argument will be 0. So, we create a VideoCapture object like this
```python3
cap = cv.VideoCapture(0)
```

Now, remember that a video is nothing but a stream of frames, i.e. images. So naturally, displaying a video involves

1. Extracting the individual frames of the video.
2. Showing the frames one by one. 

Crucial for this part are two functions, the `read` function of the capture object, and the `cv.imshow` function from the OpenCV library.

As evident from the name, the `read` function of a video _capture_ object gives us a frame of video stream. In case of a web-cam feed, it returns the frame captured from the webcam at the moment the function is called. And then by passing this frame to `cv.imshow` function, we display it on our screen! So the most basic code for this part would be
```python3
while True:
    ret, frame = cap.read()
    cv.imshow('Live Web-Cam Feed', frame)
```

Here as you can see, the `cap.read` function returns something else along with the frame, which I'm putting into the `ret` variable. It's a boolean value, indicating whether the _read_ operation was succesfull or not. Also, the `cv.imshow` function takes the title of the window to be shown as it's first argument, and the image to be shown as its second argument.

We have put the two lines inside a _while_ loop as we want to repeat these steps in rapid succession, resulting in a continuous video stream. 

> A hint for the upcoming content, the first step in this loop, i.e. extracting a frame from a video stream, this can be replaced by any other method, such as receiving them over the network. All the `cv.imshow` function cares about is getting the frame, however you can manage to get it. We are going to utilize this when we send and receive video over the network.

Now you may be getting curious about this part of the code
```python3
while True:
    ...
    key = cv.waitKey(1)
    if key in [27, 81, 113]:
        break
```

This is an important part as it would let us get out of the while loop, and thus, exit the program gracefully. The `cv.waitKey` function waites for a key press event, and returns the `ASCII` value of the key pressed. Then we check if that corresponds to any of the keys `q`, `Q` or `ESC`. If it is, we break out of the loop.

And the final lines of the code does the clean-up work.
```python3
cap.release()
cv.destroyAllWindows()
```

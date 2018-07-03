I'm gonna discuss how I configured my USB drive so that I can use it as a Kali Live USB and a standard storage medium, at the same time.

The problem with live USBs are, once you start using it as such, it is not really usable as a general storage medium anymore. The files crucial to the live OS are visible to a general user, and they can delete them by mistake, just think of a _tech-normie_ friend of yours who borrowed your pendrive for something. There is a way we can avoid this, and make both of the use-cases of the USB drive as seamless as possible.

## Overall Approach

The overall approach we'll be going with is as below.

- Partition the pendrive into 2 partitions.
- Make the _second_ partition bootable, and install the live OS onto that partition.

Using the _second_ partition for the live OS is important because Windows only recongnizes the first partition for USB drives, so we have to keep that ready for storage purposes. Most of the modern BIOSes will look for bootable partitions among all of the partitions of the pendrive, so live booting won't face any problem too.

### File-systems

Another thing we will have to consider is the file system we will goin

## Hands-on

We're going to use _Gparted_ for partioning and formatting, if you don't already have it, [install it](https://gparted.org/download.php).

2 partitions.

1. Storage partition. Also working as persistence for Live OS. // 
2. Live OS partition.

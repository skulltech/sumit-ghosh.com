---
date: 'Fri Sep 11 2020 10:00:00 GMT+0530 (India Standard Time)'
title: 'Creating a VM using Libvirt, Cloud Image and Cloud-Init'
showcase: true
tags:
  - Sysadmin
  - Linux
  - Virtualization
---

In this post, we’re going to see how we can create virtual machines in seconds, the way it’s done in modern cloud infrastructures such as EC2 and Digital Ocean. This is kind of a continuation of [my previous post](/articles/virtualization-hypervisors-explaining-qemu-kvm-libvirt/), where I explain the basics of virtualization and create a virtual machine in the old-school way. So let’s dive right into it!

The old-school, traditional way of creating virtual machines goes like the following.

1. Create a VM from scratch by allocating a newly created blank disk image to it.
2. Install an OS on the VM, from either an ISO or using PXE network boot.

In the second step, the OS installation wizard usually needs many manual inputs, which is not ideal for automation purposes. Here’s how automated installation tools like [Preseed](https://en.wikipedia.org/wiki/Preseed) for Debian and derivatives, and [Kickstart](https://en.wikipedia.org/wiki/Kickstart_(Linux)) for RHEL and [Ubuntu](https://help.ubuntu.com/community/KickstartCompatibility) comes into play. A sysadmin can pre-generate a file containing all the required configuration options, and these tools can read that file at install time, skipping the need for manual inputs. In this way, the whole VM creation process can be automated.

But still, the installation takes quite some time, which is unacceptable in the age of cloud computing. If you’ve used cloud platforms such as EC2 and Digital Ocean, you know how fast they can provision a VM. You just select an OS, the disk size, number of CPUs, RAM, and provide an SSH key—and you get a VM up and running in less than a minute. We’re gonna see how they do that, and how we can do the same in our machine. 

## How It Works

In the old-school way, we created a blank disk image, and installed the OS in that. The installation step is the bottleneck, but there’s a straightforward way to skip that step entirely: import a disk that already has the OS installed in it. This kind of disk image is called a _cloud image_. You can understand what a cloud image is by understanding how it’s usually created

1. Create a VM with a blank disk image.
2. Install a minimal version of the OS in that VM.
3. Create a snapshot of the disk just after the installation.

So, a _cloud image_ is different than a normal _installation image_. Most OS vendors provide both an installation image and a cloud image of their OS; you can find the Ubuntu cloud images [here](http://cloud-images.ubuntu.com/). As you can imagine, once we have a cloud image, we can just _import_ that and create a new VM using that image as the root disk, skipping the need for installation as the OS is already installed in that image.

### Cloud-Init

Creating a VM using a cloud image is cool, but there’s a problem with this approach, we didn’t get any chance to customize the installation. All the configurations that are usually done in install time—setting the hostname, username, password, importing SSH key, we didn’t get to do any of that. Kickstart used to take care of this in the old paradigm; can we use Kickstart here too? Well, Kickstart comes into action at install time, it’s a feature of the installation wizard; we skipped the installation process entirely, so no, we can’t use Kickstart. 

Canonical—the parent company behind Ubuntu—developed a solution to this problem called [cloud-init](https://cloud-init.io/). Their official website pitches cloud-init like the following

> Cloud images are operating system templates and every instance starts out as an identical clone of every other instance. It is the user data that gives every cloud instance its personality and cloud-init is the tool that applies user data to your instances automatically.
>
> #### Use cloud-init to configure:
>
> - Setting a default locale
> - Setting the hostname
> - Generating and setting up SSH private keys
> - Setting up ephemeral mount points

As we can see, this is exactly what we want. Now let’s understand how cloud-init works.

Cloud-init is a program that runs after every boot. What it does is the following.

1. Fetch two configuration files, `user-data` and `meta-data`, from some pre-defined locations called [datasources](https://cloudinit.readthedocs.io/en/latest/topics/datasources.html). The most commonly datasources are the following
  - Hosting the files on an HTTP endpoint and hardcoding the endpoint URL into the cloud image. Most public cloud providers use some variation of this method.
  - Attaching an ISO disk named `cidata` to the VM, containing the two config files. Cloud-init will look for a disk with the volume label `cidata`, and if it finds one, it’ll fetch the files from that disk. This datasource is called [NoCloud](https://cloudinit.readthedocs.io/en/latest/topics/datasources/nocloud.html), and we’re going to go with this one as it’s a lot simpler and suitable for a smaller-scale homelab.
2. Set the configuration options according to the two aforementioned configuration files.

As we discussed, cloud-init needs two config files.

- `meta-data` contains some basic metadata about the system, such as hostname and instance id.
- `user-data` is much more flexible; it can be anything ranging from a YAML config file to a bash script. You can find all the valid `user-data` formats [here](https://cloudinit.readthedocs.io/en/latest/topics/format.html).

Now that we have a basic idea of cloud-init and how it works, let’s get our hands dirty and create a VM using cloud image and cloud-init.

### Creating a VM Using Cloud Image and Cloud-Init

### Prerequisites

First of all, we need to install the virtualization essentials: the complete Libvirt distribution with all relevant dependencies and utilities, and `virtinst`.
```console
$ sudo apt install libvirt-daemon-system virtinst
```

The `libvirt-daemon-system` package contains the Libvirt C libraries, the Libvirt daemon, CLI utilites to interact with the daemon, and QEMU-KVM as the default hypervisor. The `virtinst` package contains additional helper programs such as `virt-inst`, `virt-viewer`, `genisoimage`, etc. If you’re unfamiliar with what these are and how they interact, check out [my previous post](/articles/virtualization-hypervisors-explaining-qemu-kvm-libvirt/).

Next, we need to download the cloud image we want. I’m going to go with the [latest cloud image of Ubuntu](http://cloud-images.ubuntu.com/focal/current/focal-server-cloudimg-amd64.img). You can get all the Ubuntu cloud images [here](http://cloud-images.ubuntu.com/). A quick tip: in the following command, just replacing `focal` with the distribution name you want should also work. 

```console
$ wget http://cloud-images.ubuntu.com/focal/current/focal-server-cloudimg-amd64.img
```

### Creating a Disk Image

Now that we have a cloud image—which is almost like a template we want to build our VM's disk image from—the next would be creating the disk image itself. Before we do that, we need to understand some of the optimizations the QCOW image format has

- QCOW uses a disk storage optimization strategy that delays allocation of storage until it is actually needed. This allows smaller file sizes than a raw disk image in cases when the image capacity is not totally used up.  Let’s see this hands-on

    ```console
    $ qemu-img convert -f qcow2 -O raw focal-server-cloudimg-amd64.img focal-server-cloudimg-amd64.raw
    $ ls -lh
    total 1.8G
    -rw-rw-r-- 1 libvirt-qemu kvm   520M Sep  7 18:58 focal-server-cloudimg-amd64.img
    -rw-r--r-- 1 sumit        sumit 2.2G Sep 12 12:17 focal-server-cloudimg-amd64.raw
    ```

    As you can see above, `qemu-img` is the program we’re using to create, modify, and inspect disk images. I already had the `focal-server-cloudimg-amd64.img` image which is of the QCOW2 format, and I created a RAW copy of it. From the last `ls -lh` command, we can clearly see how these two formats differ—the file size of the RAW image is 2.2 GB, while the QCOW2 image takes up only 520MB, despite both having the same contents and the same _virtual_ size. This is because the QCOW2 image only allocated the storage which is actually needed, and it will grow the image as more and more space is being used. Without using copy on write—as you can imagine—with every VM we create, we would have redundant copies of the original base image, and those would've eaten up our disk space.

- QCOW stands for _QEMU Copy On Write_; as evident from the name, another key optimization it has is its ability to use a base image in a _copy on write_ mode. From [Wikipedia](https://en.wikipedia.org/wiki/Qcow)

  > The qcow format also allows storing changes made to a read-only base image on a separate qcow file by using [copy on write](https://en.wikipedia.org/wiki/Copy-on-write). This new qcow file contains the path to the base image to be able to refer back to it when required. When a particular piece of data has to be read from this new image, the content is retrieved from it if it is new and was stored there; if it is not, the data is fetched from the base image.

  We’ll be using this feature of QCOW, as it will save a lot of storage in case we create a lot of VMs. We’ll see how this works shortly.

Now that we understand how QCOW works, let’s create a disk image for our VM.

```console
$ qemu-img create -b focal-server-cloudimg-amd64.img -f qcow2 -F qcow2 hal9000.img 10G
Formatting 'hal9000.img', fmt=qcow2 size=10737418240 backing_file=focal-server-cloudimg-amd64.img backing_fmt=qcow2 cluster_size=65536 lazy_refcounts=off refcount_bits=16
```

Here, we used the cloud image `focal-server-cloudimg-amd64.img` as the base image for our new image `hal9000.img`. At first, the new image will contain only a reference to the base image, nothing else. As long as the blocks in the new image are being _read_, QCOW will fetch those blocks directly from the base image and serve them. Only when some block in the new image is _written_ to, it will _copy_ the block contents from the base image into itself and make the _writes_// changes there. In this way, _copy on write_ saves only the modifications or _writes_ in the new image, keeping the image size small. We can verify this by checking their file sizes

```console
sumit@HAL9000:~/images/base$ ls -lh
total 520M
-rw-rw-r-- 1 libvirt-qemu kvm   520M Sep  7 18:58 focal-server-cloudimg-amd64.img
-rw-r--r-- 1 sumit        sumit 193K Sep 12 12:39 hal9000.img
```

The new image takes up only 193KB! This will keep growing as make writes to the image, but it’s still a huge storage optimization.

### Creating Cloud-Init Configuration Files

As we know, cloud-init uses two configuration files, `user-data` and `meta-data`. Below is the `meta-data` we’ll be using

```yaml
instance-id: hal9000
local-hostname: hal9000
```

It’s a YAML file with a unique instance id and hostname.

Next, we’re going to create a `user-data`

```yaml
#cloud-config

users:
  - name: sumit
    ssh_authorized_keys:
      - ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDDzMSSuEky2HWKy3/p01BXURLkYhDkJ+Wpd45kU7s0737LXx9zhRqWyX0pnUcGf1A5uKpy6JiaHNjRT/PBKMye0ej1CSurPZXOEyjSSK4MlW8NkRAHiLBuBAhetG3jANWKxcvsvsp172XdK8yP81B0w4qlKQz7J5GbALuwSwFEQu01tjf4aErEvV8xXxl2y1O8DMxjTiXT2WLTeoUDQldBm3m56ogtajnJz7USiZPePUZHcm6DMp9/2+ucef3/1AAtK0adQzwhnj6W+0eCTqdQz+DF9erqsMkd7QoRaQ0/ZK/rqljMwdbux6NySA1U5Zx2JaNUlClmfqxlkBm8TbY7 sumit@sumit-ghosh.com
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    groups: sudo
    shell: /bin/bash
```

User-data is very versatile and supports [many different formats](https://cloudinit.readthedocs.io/en/latest/topics/format.html); we’re using the cloud-config format, which is the most convenient. A cloud-config user-data is basically a YAML file that begins with  `#cloud-config`. The above user-data should be mostly self-explanatory.

- I’m creating a user with the username “sumit” using `name: sumit`, you name the user whatever you want.
- A list of authorized SSH public keys can be supplied using the `ssh_authorized_keys` array; I’m putting my SSH public key there, you should put yours.
- We’re giving the user password-less `sudo` privileges using the `sudo: sudo: ['ALL=(ALL) NOPASSWD:ALL']` line.
- We’re adding the user to the `sudo` group.
- The default shell of the user is set to `/bin/bash`.

Finally, we need to create an ISO image with the volume label `cidata` containing these two files; you should recall this is how the NoCloud data source works.

```console
$ genisoimage -output cidata.iso -V cidata -r -J user-data meta-data
I: -input-charset not specified, using utf-8 (detected in locale settings)
Total translation table size: 0
Total rockridge attributes bytes: 331
Total directory bytes: 0
Path table size(bytes): 10
Max brk space used 0
183 extents written (0 MB)
```

The above `genisoimage` command should create a file named `cidata.iso` containing the user-data and meta-data files we created earlier. Notice that we’re setting the volume label to `cidata` using the `-V cidata` argument.

### Creating the VM

Just like [before](/articles/virtualization-hypervisors-explaining-qemu-kvm-libvirt/#creating-a-vm), we’re gonna use `virt-install` to create our VM.

```console
$ virt-install --name=hal9000 --ram=2048 --vcpus=1 --import --disk path=hal9000.img,format=qcow2 --disk path=cidata.iso,device=cdrom --os-variant=ubuntu20.04 --network bridge=virbr0,model=virtio --graphics vnc,listen=0.0.0.0 --noautoconsole

Starting install...
Domain creation completed.
```

Most of the CLI parameters should be self-explanatory, although there are some that you should pay attention to

 - The VM name is set to be “hal9000” using the `name` parameter.
 -  The VM is allocated 2 GB of RAM using the `ram` parameter and a single-core virtual CPU using the `vcpus` parameter.
 -  Using the `---import` argument, we’re letting `virt-install` know that we’re _importing_ an image which has the OS already installed within. 
 - We’re attaching both of the images we created using the `disk` parameter, the QCOW image `hal9000.img` to be used as the storage, and the ISO image `cidata.iso` as a datasource for cloud-init.
 - Mentioning the `os-variant` helps it make some OS-specific optimizations.
 - We’re mentioning a network interface using the `network` parameter as we want our VM to have network connectivity. Using a bridge network interface is the simplest networking model we can have, and that’s what we’re going with.
- Using the `--graphics vnc,listen=0.0.0.0` argument, we’re setting a virtual console in the guest, and exposing it as a VNC server in the host. We can connect to the VM console using this VNC server later on if we want.
- Finally, on using the `--noautoconsole` argument, `virt-install` doesn’t open a console to the guest VM after creation, it just exits. This is essential for automation.

After creation, give it 10-20 seconds to boot up. Then get the newly created VM’s IP address using the following command.

```console
$ virsh net-dhcp-leases default
 Expiry Time           MAC address         Protocol   IP address           Hostname   Client ID or DUID
------------------------------------------------------------------------------------------------------------------------------------------------
 2020-09-12 14:50:17   52:54:00:e5:0e:65   ipv4       192.168.122.103/24   hal9000    ff:56:50:4d:98:00:02:00:00:ab:11:db:1f:d2:8c:42:8a:75:70

```

As you can see, in my case, the IP address allocated to the `hal9000` VM is `192.168.122.103`. Now I can simply SSH into the VM

```console
$ ssh sumit@192.168.122.103
```

And I have access to a brand new VM, created under a minute! You can automate the whole process using a script, such as [this Ansible playbook](https://github.com/SkullTech/scripts/blob/master/create-vm.yml) I wrote.

## Conclusion

Hopefully this post was helpful to you. If you any questions, feedback, or suggestion, please leave it in the comments down below. You can also reach me via email or on Twitter. Thanks for reading!


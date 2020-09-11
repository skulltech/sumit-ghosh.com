---
date: 'Tue Sep 08 2020 15:00:00 GMT+0530 (India Standard Time)'
title: 'Virtualization and Hypervisors :: Explaining QEMU, KVM, and Libvirt'
showcase: true
tags:
  - Sysadmin
  - Linux
  - Virtualization
---

In this post, I will explore some core concepts and terminologies regarding virtualization in Linux systems. I intend it to serve as a reference, especially for beginners who are just getting started with virtualization and system administration in general.

## Hypervisors

Virtualization, i.e., creating and running virtual machines, is handled by something called a hypervisor, which can either be software, firmware or hardware. The system on which the hypervisor runs virtual machines is called the _host_ system, and the virtual machines themselves are called _guest_ systems.  The hypervisor manages and provides resources to the guest OS, and it translates system calls of the guest OS to suitable system calls or hardware interrupts in the host system.

Hypervisors can be generally categorized into two types.

1. __Type 1 hypervisor:__ These run on bare metal and typically leverage features of the CPU specifically built for virtualization, for example, AMD-V and Intel VT-x. Examples of type 1 hypervisor are:
   - KVM, which is a Linux kernel module and part of the official Linux kernel.
   - VMWare ESXi. 

2. __Type 2 hypervisor:__ These run on top of a host OS, and thus it translates system calls made by the guest OS to system calls made to the host OS. Examples include:
	- QEMU.
	- VMWare Workstation.
	- VirtualBox.

### Differences: Advantages and Drawbacks

- In general, type 1 hypervisors are a lot faster than type 2 hypervisor.
- Type 1 hypervisors can only emulate the same architecture as of the host CPU. For example, it can only create VMs with x86 architecture if the machine has an x86 CPU. Type 2 hypervisors, on the other hand, emulate any and all architectures regardless of the host CPU, at least in theory.


## QEMU and KVM

When considered separately as standalone software, QEMU is a type 2 hypervisor, and KVM is a type 1 hypervisor, just like we already discussed. But in the specific case when,

- The guest OS and the host OS has the same architecture.
- The host CPU supports bare-bones virtualization extensions, such as AMD-V or Intel VT-x.
- The host OS has KVM installed.

QEMU can use KVM to translate the calls made to the CPU and the memory, thus turning that part of the virtualization process bare-bones or type 1. The rest of the system calls, such as calls to IO devices and disk drives, are routed through the OS, in the usual type 2 fashion. As CPU and memory calls are the most critical system calls, using KVM to handle them makes the whole process a lot faster and smoother. In this way, QEMU-KVM works in tandem to bring the best of both worlds.

## Libvirt

Libvirt is an open-source set of software and libraries which provide a single way to manage multiple different hypervisors, such as the QEMU, KVM, Xen, LXC, OpenVZ, VMWare ESXi, etc. It consists of a stable C API, a daemon, and command-line utilities to work with the Libvirt API. The [Arch wiki page on Libvirt](https://wiki.archlinux.org/index.php/libvirt) has much useful information, keep in mind that the packages and commands may not correspond well with other Linux distributions.


### Installing Libvirt with QEMU-KVM

The following `apt` packages are essential for creating and managing virtual machines using Libvirt with QEMU-KVM in an Ubuntu system.

- `libvirt-daemon-system`: The complete Libvirt distribution, i.e., the C libraries and the Libvirt daemon `libvirtd`. It also installs the following helper packages
	- `libvirt-clients`, which is a collection of CLI utilities to interface with the Libvirt daemon.
	- `bridge-utils` for networking.
	- `qemu-kvm` as the default hypervisor.
- `virtinst`: For the `virt-install` and `virt-viewer` helper utils.

Running the following command would install the above
```console
$ sudo apt install libvirt-daemon-system virtinst
```

## Creating a VM

Now that we have installed Libvirt with QEMU and KVM, I will show how we can create a VM using this. This is mostly for demonstration purposes, so I’m going to keep the process as simple and minimal as possible.

1. Firstly, we’ll have to create a disk image file which is to be used by the VM as its _secondary storage_ or disk. The format can be either RAW, or QCOW2—which has some very useful optimizations. For now, we’re going to go with RAW.

   ```console
   $ qemu-img create -f raw -o size=10G vol.raw
   Formatting 'vol.raw', fmt=raw size=10737418240
   ```

   As you can see, we mentioned the image format using the `-f raw` argument, made it have 10 GB of storage using the `size=10G` argument, and we named the image file `vol.raw`.

2. Once we have a disk image, we can create the VM with the disk image as its storage using the `virt-install` command. We’ll also have to pass an installation media for installing an OS in the VM—you can use any installer image you have, I’m going to use the installer for Ubuntu Budgie 18.04.

   ```console
   sumit@HAL9000:~/Coding$ virt-install --name=vm1 --ram=2048 --vcpus=1 --disk path=vol.raw --cdrom=/home/sumit/Downloads/ubuntu-budgie-18.04.3-desktop-i386.iso --os-variant ubuntu18.04 --network bridge=virbr0,model=virtio
   
   Starting install...
   
   ```

   The CLI parameters are mostly self-explanatory.

   - The VM name is set to be _vm1_ using the `name` parameter.
   -  The VM is allocated 2 GB of RAM using the `ram` parameter and a single-core virtual CPU using the `vcpus` parameter.
   - The disk image and installation image is supplied using the `disk` and `cdrom` parameters.
   - Mentioning the `os-variant` helps it make some OS-specific optimizations.
   - Finally, we have to mention a network interface using the `network` parameter so that the VM has network connectivity. Using a bridge network interface is the simplest networking model we can have, and that’s what we went with.

Once you run the `virt-install` command like above, a `virt-viewer` window should pop up with the installer running, go ahead and follow the installation wizard to install the OS. You can open the VM anytime later by running the following command.

```console
$ virt-viewer vm1
```

  Shutting down, starting, and rebooting is very easy too!

```console
$ virsh shutdown vm1
$ virsh start vm1
$ virsh reboot vm1
```

## Conclusion

I hope this post helped you understand the basics of virtualization and get started with it. I plan to post more tutorials exploring specific use-cases; until then, have fun tinkering around! Feel free to leave a comment below if you have any questions or feedback. You can also always drop me an e-mail or contact me on Twitter if you want to talk. Cheers!
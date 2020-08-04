---
date: 'Fri Apr 14 2020 16:00:00 GMT+0530 (India Standard Time)'
title: 'Virtualization and Hypervisors :: Explaining QEMU, KVM, and Libvirt'
published: false
tags:
  - Sysadmin
  - Linux
  - Virtualization
---

## Hypervisors

Virtualization, i.e. creating and running virtual machines, is handled by something called hypervisor, which can either be software, firmware or hardware. The system on which the hypervisor runs virtual machines is called the _host_ system, and the virtual machines themselves are called _guest_ systems.  Hypervisor manages and provides resources to the guest OS, and it translates system calls of the guest OS to suitable system calls or hardware interrupts.

Hypervisors can be generally categorised into two types

1. Type 1 hypervisor :: These run on bare metal, and typically leverage features of the CPU specifically built for virtualization, for example AMD-V and Intel VT-x. Examples of type 1 hypervisor are:
   - KVM, which is a Linux kernel module and part of the official Linux kernel.
   - VMWare ESXi. 

2. Type 2 hypervisor :: These run on top of a host OS, and thus it translates system calls made by the guest OS to system calls made to the host OS. Examples include:
	- QEMU.
	- VMWare Workstation.
	- VirtualBox.

### Differences: Advantages and Drawbacks

- In general, type 1 hypervisors are a lot faster than type 2 hypervisor.
- Type 1 hypervisors can only emulate the same architecture as of the host CPU. For example, it can only create VMs with x86 architecture if the machine has an x86 CPU. Type 2 hypervisors, on the other hand, emulate any and all architectures regardless of the host CPU, at least in theory.


## QEMU and KVM

When considered separately as standalone software, QEMU is a type 2 hypervisor, and KVM is a type 1 hypervisor, just like we already discussed. But in the specific case when —

- The guest OS and the host OS has the same architecture.
- The host CPU supports bare-bones virtualization extensions, such as AMD-V or Intel VT-x.
- The host OS has KVM installed.

QEMU can use KVM to translate the calls made to the CPU and the memory, thus turning that part of the virtualization process bare-bones// type 1. The rest of the system calls, such as calls to IO devices and disk drives, are routed through the OS, in usual type 2 fashion. As CPU and memory calls are the most critical system calls, using KVM to handle them makes the whole process a lot faster and smoother. In this way, QEMU-KVM works in tandem to bring the best of both worlds.

## Libvirt

Libvirt is an open-source set of software and libraries which provide a single way to manage multiple different hypervisors, such as the QEMU, KVM, Xen, LXC, OpenVZ, VMWare ESXi, etc. It consists of a stable C API, a daemon and command-line utlities to work with the libvirt API. The [Arch wiki page on Libvirt](https://wiki.archlinux.org/index.php/libvirt) has many useful information, keep in mind that the packages and commands may not correspond well with other Linux distributions.


### Installing Libvirt with QEMU-KVM

The following `apt` packages are essential for creating and managing virtual machines using Libvirt with QEMU-KVM in an Ubuntu system.

- `libvirt-daemon-system`: The complete libvirt distribution, i.e. the C libraries, the libvirtd daemon. It also install `libvirt-clients` consisting of the CLI utilities, `bridge-utils` for networking, and `qemu-kvm` as the default hypervisor.
- `virtinst`: For the `virt-install` and `virt-viewer` utils.


### Creating a VM

1. Create a disk image which is to be used by the VM. The format can be either RAW, or QCOW2—which has some optimizations.
2. Create the VM, using the disk image as the storage. As for installation media, we can use either CDROM or PXE. We'll also have to specify the correct network bridge interface.

```console
$ qemu-img create -f raw -o size=20G vol.raw
$ virt-install --name=budgie --ram=2048 --vcpus=1 --disk path=/home/sumit/Minor/vol.raw --cdrom=/home/sumit/Downloads/ubuntu-budgie-18.04.3-desktop-i386.iso --os-variant ubuntu18.04 --network bridge=virbr0,model=virtio
```

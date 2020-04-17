---
date: 'Fri Apr 14 2020 16:00:00 GMT+0530 (India Standard Time)'
title: 'Virtualization and Hypervisors :: Explaining QEMU, KVM, and Libvirt'
showcase: false
tags:
  - Sysadmin
  - Linux
  - Virtualization
---

## Hypervisors

Virtualization, i.e. creating and running virtual machines, is handled by something called hypervisor, which can either be software, firmware or hardware. The system on which the hypervisor runs virtual machines is called the _host_ system, and the virtual machines themselves are called _guest_ systems.  Hypervisor manages  and provides resources to the guest OS, and it translates system calls of the guest OS to suitable system calls or hardware interrupts.

Hypervisors can be generally categorised into two types

1. Type 1 hypervisor :: These run on bare metal, and typically leverage features of the CPU specifically built for virtualization, for example AMD-V and Intel VT-x. Examples of type 1 hypervisor are:
   - KVM, which is a Linux kernel module and part of the official Linux kernel.
   - VMWare ESXi. 

2. Type 2 hypervisor :: These run on top of a host OS, and thus it translates system calls made by the guest OS to system calls made to the host OS. Examples include:
	- QEMU.
	- VMWare Workstation.
	- VirtualBox.

### Differences: advantages and drawbacks

- In general, type 1 hypervisors are a lot faster than type 2 hypervisor.
- Type 1 hypervisors can only emulate the same architecture as of the host CPU. For example, it can only create VMs with x86 architecture if the machine has an x86 CPU. Type 2 hypervisors, on the other hand, emulate any and all architectures regardless of the host CPU, at least in theory.


## QEMU-KVM

QEMU can work as a standalone type 2 hypervisor. But in the specific case when —

- The guest OS and the host OS has the same architecture.
- The host CPU supports bare-bones virtualization extensions, such as AMD-V or Intel VT-x.
- The host OS has KVM installed.

It can use KVM to translate the calls made to the CPU and the memory, thus turning that part of the virtualization process bare-bones// type 1. The rest of the system calls, such as calls to IO devices and disk drives, are routed through the OS, in usual type 2 fashion. As CPU and memory calls are the most critical system calls, using KVM to handle them makes the whole process a lot faster and smoother.

### Installing QEMU-KVM

The following `apt` packages are essential for creating and managing virtual machines using QEMU-KVM in an Ubuntu system.

- `qemu-kvm`: The base package, the backend.
- `libvirt-daemon-system`: The base `libvirt` C libraries and the `libvirtd` daemon.
- `libvirt-clients`: Various CLI applications for VM management using `libvirt`.
- `bridge-utils`: For networking.
- `virtinst`: For the `virt-install` and `virt-viewer` utils.

Actually, `libvirt-daemon-system` has `qemu-kvm`, `libvirt-clients` and `bridge-utils` as dependencies, so if you install that first, you won't have to install the others.


### Creating a VM

1. Create a disk image which is to be used by the VM. The format can be either RAW, or QCOW2—which has some optimizations.
2. Create the VM, using the disk image as the storage. As for installation media, we can use either CDROM or PXE. We'll also have to specify the correct network bridge interface.

```console
$ qemu-img create -f raw -o size=20G vol.raw
$ virt-install --name=budgie --ram=2048 --vcpus=1 --disk path=/home/sumit/Minor/vol.raw --cdrom=/home/sumit/Downloads/ubuntu-budgie-18.04.3-desktop-i386.iso --os-variant ubuntu18.04 --network bridge=virbr0,model=virtio
```


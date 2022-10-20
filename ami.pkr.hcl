packer {
  required_plugins {
    git = {
      version = ">=v0.3.2"
      source  = "github.com/ethanmdavidson/git"
    }
  }
}

variable "aws_region" {
  type        = string
  description = "Configured AWS Region"
  default     = "us-east-1"
}

variable "source_ami" {
  type        = string
  description = "Default Ubuntu AMI to build our custom AMI"
  default     = "ami-08c40ec9ead489470" # Ubuntu 22.04 LTS
}

variable "ssh_username" {
  type        = string
  description = "username to ssh into the AMI Instance"
  default     = "ubuntu"
}

variable "subnet_id" {
  type        = string
  description = "Subnet of the default VPC."
  default     = "subnet-03d1bcaedaf95a150"
}

variable "ubuntu_version" {
  type        = string
  description = "Version of the custom AMI"
  default     = "22_04_LTS"
}

locals {
  truncated_sha = substr(data.git-commit.cwd-head.hash, 0, 8)
  version       = data.git-repository.cwd.head == "master" && data.git-repository.cwd.is_clean ? var.ubuntu_version : "${var.ubuntu_version}-${local.truncated_sha}"
  timestamp     = regex_replace(timestamp(), "[- TZ:]", "")
}

data "git-repository" "cwd" {}
data "git-commit" "cwd-head" {}

source "amazon-ebs" "ec2" {
  # ami_name = "${regex_replace("EC2-AMI-${local.version}", "[$&+,:;=?@#|'<>.-^*()%!]", "")}"
  # ami_name        = "EC2-AMI-${substr(data.git-commit.commit.hash, 0, 8)}"
  # ami_name        = "EC2-AMI-{{ ${substr(data.git-commit.cwd-head.hash, 0, 8)} }}"
  region          = "${var.aws_region}"
  ami_name        = "EC2-AMI-${local.timestamp}"
  ami_description = "EC2 AMI for CSYE 6225 built by ${data.git-commit.cwd-head.author}"
  ami_users = [
    "057919684206", # dev account ID
    "235271618064", # prod account ID
  ]
  tags = {
    Name        = "EC2-AMI-${local.version}"
    Base_AMI_ID = "${var.source_ami}"
    OS_Version  = "Ubuntu"
    Release     = "22.04 LTS"
    Author      = "${data.git-commit.cwd-head.author}"
  }
  ami_regions = [
    "us-east-1",
  ]

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type = "t2.micro"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"
  subnet_id     = "${var.subnet_id}"

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/sda1"
    volume_size           = 50
    volume_type           = "gp2"
  }
}

build {
  sources = ["source.amazon-ebs.ec2"]

  # https://www.packer.io/docs/provisioners/file#uploading-files-that-don-t-exist-before-packer-starts
  provisioner "file" {
    source      = "webapp.zip"   # path in local system to a tar.gz file
    destination = "~/webapp.zip" # path in the AMI to store the webapp
  }

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1"
    ]
    scripts = [
      "install.sh",
    ]
  }
}

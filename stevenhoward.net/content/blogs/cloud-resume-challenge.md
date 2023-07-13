---
title: "Cloud Resume Challenge"
date: 2023-07-10T15:20:15+09:00
draft: false
author: Steven Howard
image: /images/cloud-resume-diagram.png
tags:
    - "AWS"
    - "Terraform"
    - "IaC"
    - "CI/CD"
    - "Python"
    - "Javascript"
    - "HTML/CSS"
---
## Introduction

The Cloud. It's referenced constantly in tech circles. It's the future, and the future is now. But me being a general on-prem enterprise network guy, I couldn't really tell you what the Cloud was outside of "someone else's computer," or the place my iPhone's photo library is backed up to.

I began my Cloud journey with the AWS Cloud Practitioner Certification. I was overwhelmed with the flood of cloud services with strange names like Kineses, DynamoDB, Aurora, and the list goes on... I felt that 80% of that exam consisted of linking the existing IT concepts I was familiar with to those strange marketing terms Amazon chose to name their services. But that experience sparked something in me. This Cloud thing is powerful. Extremly powerful. I could spin up an entire enterprise-level infrastructure on someone else's hardware in a matter of minutes by pushing code to GitHub!? My mind was blown.

Cloud Engineering. Dev Ops. Whatever the title may be, I wanted to replace what I'd been doing in disparate GUIs across multiple vendors... with code. Before IT, I had planned on being a web developer. But due to the lack of roles in my area, I transitioned to an area where there was a need. Now that cloud adoption (and remote-work) is wide-spread, I have another chance to make a living with my code editor. For me, a career in the Cloud is the perfect marriage of the things I love. IT Infrastructure and Automation.

Enter the [Cloud Resume Challenge](https://cloudresumechallenge.dev/docs/the-challenge/aws/), a project prompt created by well-known internet man Forrest Brazeal, designed to showcase the necessary skills any Cloud Engineer should possess. As I studied for (and earned!) my AWS Solutions Architect Associate Certification, I dove into this project. This article details my journey, including my struggles and excitement when I finally got all these things to work together.

## Building the Front-End

### AWS Account Creation

I started by creating an AWS account that ultimately became the root account for the AWS Organization that I created for all of my projects. I created a child account for the Cloud Resume project, and I set up SSO for that account to simplify logging into the console and AWS CLI.

### Simple Resume in HTML / CSS

I hadn’t opened a code editor and built a webpage in years. My resume was a Word document, and I aimed to replicate it, formatting and all, using code. I wanted the resume to appear as a floating piece of A24 paper, so I put the contents of the resume on a `div` with a white background and gave it a box-shadow to give it a 3D effect. It felt great dusting off my old CSS skills. All in all, the HTML and CSS part of the project took me an hour or two, and I had a blast doing it.

<div class="alert alert-light" role="alert">

<h3> Links </h3>

[Resume's HTML Source Code](https://github.com/sp-howard/cloud-resume-front-end/blob/main/stevenhoward.net/resume/index.html)

[Resume's CSS Source Code](https://github.com/sp-howard/cloud-resume-front-end/blob/main/stevenhoward.net/resume/style.css)
</div>

### Registering the Domain Name

I purchased the domain name, “stevenhoward.net,” directly from AWS using Route53. The purchase failed initially, as my account had to be reviewed by AWS Support before the purchase could be approved. My account was approved within 24 hours of submitting a ticket. I made the mistake of purchasing the domain using my root account isneta dof my project account. I was able to use the domain, just needing to do the extra step of taking the Name Server addresses of the Route53 hosted zone in my project account and replacing the Name Servers of the registered domain in my root account with them. I also requested a domain transfer, but had to wait 2 weeks for that to be approved. I was glad I started that process, because having my registerted domain connected to my project account proved invaualble when recreating my infrastructure using Terraform.

### Static Website Hosting with S3

Configuring static web hosting in AWS is surprisingly simple. Here’s a quick guide:

*S3 Bucket Permissions*

<div class="instructions">

1. Properties > Enable Static Site Hosting > Set `index` and `error` HTML files
2. Permissions > Set “Block all public access” setting to Off
3. Bucket Policy > Allow ALL Principals using the following bucket policy:

</div>

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::{BUCKET_NAME_HERE}/*"
        }
    ]
}
```

### CloudFront

When attempting to create a CloudFront distribution to secure the site, I received an error like the one I received when purchasing my domain. I was using a newly created account, and I needed to contact AWS Support to approve my account for the creation for a CloudFront distribution. They approved my request within 24 hours, and I was able to create a distribution with HTTP to HTTPS redirection and use it as the destination on an A record for "stevenhoward.net."

### DNS Problem

I discovered an issue with my DNS configuration when I attempted to show off my website to a friend. I asked him to go to “stevenhoward.net,” but when he did, the following error was generated:

<www.stevenhoward.net> works just fine, but the root domain (stevenhoward.net) doesn’t. Research indicated that a CNAME cannot be created for a root domain. At one time, using the root domain for a Static S3 website wasn’t supported, but luckily, I was able to find the official S3 documentation that outlined the process:

KEY TAKEWAYS:
• Account for the time it takes AWS Support’s approval process for registering domains and creating CloudFront endpoints.
• Always doublecheck which account you’re logged into, and which region you have selected.

## Building the Back-End

With the simple resume created, hosted in an S3 bucket, and accessible over the web by a regsitered domain name, it's time to add some logic in the form of a visit counter. Here's a quick rundown of how this works:

1. A JavaScript file is referenced at the bottom of the resume page.
2. The JS file makes an API GET call using the URL of an API Gateway stage.
3. The API Gateway stage's GET function is connected to a Lambda resource.
4. The Lambda function is in this case is a piece of Python code that gets the current `visit_count` value from a DynamoDB table, increments it by 1, writes it back to the DB, and returns the updated value in JSON form.
5. The `view_count` element on the resume page displays the current value.

<div class="alert alert-light" role="alert">

<h3> Links </h3>

[API Call in JavaScript](https://github.com/sp-howard/cloud-resume-front-end/blob/main/stevenhoward.net/resume/visitcount.js)

[Lambda Function in Python](https://github.com/sp-howard/cloud-resume-back-end/blob/main/lambda-function.py)

</div>

### API with Javascript

It had also been quite awhile since I used Javascript. Oh how I missed those curly braces. 

### CORS

Getting CORS to work turned out to be a beast of a task. I had made the mistake of creating my API as an HTTP one, and not REST. I realized this was the case after 3+ hours of troubleshooting the HTTP API. I added the custom CORS headers to my Lambda function, but they weren’t being returned. I went through the CORS options and allowed absolutely everything (‘*’), but nothing worked. 

### Lesson Learned

Billing
I accidentally incurred ~$30 in costs over WAFs that were created by test CloudFront distributions. After deleting those tests, the WAF Web ACLs persisted and racked up costs over the course of a month and a half. I was sure I’d set up a Budget to alert me after $10 per month. Sure enough, the budget was there, but I had a typo in my email address under Notification preferences. Another valuable lesson learned!

## Terraform

Using Terraform Cloud for the state file.
The first “terraform plan” I tried failed due to AWS CLI not being installed on my WSL instance. While following AWS’ Linux installation instructions, I ran into an error related to the “unzip” command. After installing unzip (sudo apt install unzip), I  was able to extract and install the AWS-CLI install files. I configured the CLI tool with my SSO account that I’d previously been using: <https://docs.aws.amazon.com/cli/latest/userguide/sso-configure-profile-token.html#sso-configure-profile-token-auto-sso>
However, “terraform plan” still threw a “no valid credential sources” error.
  
I verified that my new SSO profile was working by connecting to S3

Researching the error led me to adding the following command:
export AWS_PROFILE=”sph-sso”

<https://discuss.hashicorp.com/t/using-credential-created-by-aws-sso-for-terraform/23075/8>

Finally, I was apply to “terraform plan” and “terraform apply!”

### CORS

<https://www.linkedin.com/pulse/terraform-amazon-api-gateway-cors-ahmad-ferdaus-abd-razak/?trk=pulse-article_more-articles_related-content-card>

Trouble with uploading S3 objects w/ terraform.
S3 assigns a content type of binary/octet-stream by default to any uploaded files.
Had to specify:
content_type = "text/html"

## Infrastructure as Code

## CI/CD and Testing

## Final Thoughts

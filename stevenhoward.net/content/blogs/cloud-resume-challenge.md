---
title: "Cloud Resume Challenge"
date: 2023-07-10T15:20:15+09:00
draft: false
author: Steven Howard
image: /images/crc-diagram.png
tags:
    - "AWS"
    - "Terraform"
    - "IaC"
    - "CI/CD"
    - "Python"
    - "Javascript"
    - "HTML/CSS"
---


## Chunk 1:
Account Creation
I have a personal account that serves as the management account for my organization. Each project I work on has its own AWS account. I created a new account for the Cloud Resume Challenge. To access the Cloud Resume account, I set up SSO for the management account and switched role into the Resume account, which has full administrator access. 

### HTML and CSS
I hadn’t opened a code editor and built a HTML/CSS in years. My resume was a Word document, and I aimed to replicate it formatting and all using code. I wanted the resume to appear as a floating piece of A24 paper, so I put the contents of the resume on a div with a white background and gave it a box-shadow to give it a 3D effect. It felt great dusting off my old CSS skills. There were some things I needed a refresher on, mainly some display attributes like inline-block, and floating the element left or right to match the formatting in the Word document. All in all, the HTML and CSS part of the project took me an hour or two, and I had a blast doing it.  

### Domain
I purchased the domain name, “stevenhoward.net,” directly from AWS using Route53. The purchase failed initially, as my account had to be reviewed by AWS Support before the purchase of a domain name could be approved. I submitted a Support ticket, and my account was approved within 24 hours. When I was able to complete the purchase, I made the mistake of purchasing it using my management account, not the Cloud Resume AWS account I had set up specifically for this project. This required an extra step of creating taking the Name Server addresses of the Route53 hosted zone in my Cloud Resume AWS Account and using them to replace the name servers of the stevenhoward.net domain located in my management account. This was good experience, as it’s common for domain names to be purchased through third-party registrars, and changing the name servers to AWS hosted ones is common.

### Static S3
Configuring static website hosting in AWS is surprisingly simple. Here’s the quick configuration for static website hosting using S3.
S3 Bucket Permissions
Properties > Enable Static Site Hosting > Set index and error HTML files
Permissions > Set “Block all public access” setting to Off
Bucket Policy > Allow ALL principals using the following bucket policy:
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
When attempting to create a CloudFront distribution to secure the site, I received an error like the one I received when purchasing my domain. I was using a newly created account, and I needed to contact AWS Support to approve my account for the creation for a CloudFront distribution. They approved my request within 24 hours, and I was able to create a distribution with HTTP to HTTPS redirection and use it as the destination on an A record for stevenhoward.net and www.stevenhoward.net.

### DNS Problem
I discovered an issue with my DNS configuration when I attempted to show off my website to a friend. I asked him to go to “stevenhoward.net,” but when he did, the following error was generated:
 
www.stevenhoward.net works just fine, but the root domain (stevenhoward.net) doesn’t. Research indicated that a CNAME cannot be created for a root domain. At one time, using the root domain for a Static S3 website wasn’t supported, but luckily, I was able to find the official S3 documentation that outlined the process: 
KEY TAKEWAYS:
•	Account for the time it takes AWS Support’s approval process for registering domains and creating CloudFront endpoints.
•	Always doublecheck which account you’re logged into, and which region you have selected.

### CORS
Getting CORS to work turned out to be a beast of a task. I had made the mistake of creating my API as an HTTP one, and not REST. I realized this was the case after 3+ hours of troubleshooting the HTTP API. I added the custom CORS headers to my Lambda function, but they weren’t being returned. I went through the CORS options and allowed absolutely everything (‘*’), but nothing worked. That is until I found the following video: https://www.youtube.com/watch?v=O3wWjWjvM6A&t=939s

### Lesson Learned:
Billing
I accidentally incurred ~$30 in costs over WAFs that were created by test CloudFront distributions. After deleting those tests, the WAF Web ACLs persisted and racked up costs over the course of a month and a half. I was sure I’d set up a Budget to alert me after $10 per month. Sure enough, the budget was there, but I had a typo in my email address under Notification preferences. Another valuable lesson learned!


## Terraform
Using Terraform Cloud for the state file. 
The first “terraform plan” I tried failed due to AWS CLI not being installed on my WSL instance. While following AWS’ Linux installation instructions, I ran into an error related to the “unzip” command. After installing unzip (sudo apt install unzip), I  was able to extract and install the AWS-CLI install files. I configured the CLI tool with my SSO account that I’d previously been using: https://docs.aws.amazon.com/cli/latest/userguide/sso-configure-profile-token.html#sso-configure-profile-token-auto-sso
However, “terraform plan” still threw a “no valid credential sources” error.
  

I verified that my new SSO profile was working by connecting to S3
 
Researching the error led me to adding the following command:
export AWS_PROFILE=”sph-sso”
 
https://discuss.hashicorp.com/t/using-credential-created-by-aws-sso-for-terraform/23075/8

Finally, I was apply to “terraform plan” and “terraform apply!”


### CORS
https://www.linkedin.com/pulse/terraform-amazon-api-gateway-cors-ahmad-ferdaus-abd-razak/?trk=pulse-article_more-articles_related-content-card

Trouble with uploading S3 objects w/ terraform.
S3 assigns a content type of binary/octet-stream by default to any uploaded files.
Had to specify:
content_type = "text/html"

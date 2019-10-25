# GitHub Issue Notifier

[![GitHubMarketplace](https://img.shields.io/badge/GitHub%20Marketplace-issue--notifier-green?logo=github)](https://github.com/marketplace/actions/github-issue-notifier)

While yes you can subscribe to a GitHub Issue for notifications, this is only after the Issue has been created.  And sometimes you don't want all the details.  This was designed to monitor a specific label when it is applied to an issue (like a breaking change notification) and notify a set of recipients with the details of the issue.

## Requirements
The following variables are required to be set:
- API Key for SendGrid (Get [free](https://sendgrid.com/free/) API key).  Set this in environment variable as ```SENDGRID_API_KEY```.  I recommend putting this in your repos Settings > Secrets and using like below.

## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: timheuer/issue-notifier@v1
env:
  SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
with:
  fromMailAddress: 'no-reply@example.com'
  toMailAddress: 'example@example.com'
  subject: 'A new issue was labeled'
  labelsToMonitor: 'breaking-change,major-bug'
```

const core = require('@actions/core');
const github = require('@actions/github');
const sendgrid = require('@sendgrid/mail');
const moment = require('moment');
const md = require('remarkable').Remarkable;

var shouldNotify = false;

// most @actions toolkit packages have async methods
async function run() {
  try { 
    // set SendGrid API Key
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    // get all the input variables
    var fromEmail = core.getInput('fromMailAddress');
    var toEmail = core.getInput('toMailAddress');
    var subject = core.getInput('subject');
    var verbose = core.getInput('verbose');
    var labelsToMonitor = core.getInput('labelsToMonitor');

    // check to make sure we match any of the labels first
    var context = github.context;
    var issue = context.issue;
    var issueLabels = issue.labels;
    if (verbose) 
    {
      console.log(issue);
      console.log('TO:' + toEmail);
      console.log('FROM:' + fromEmail);
      console.log('SUBJECT:' + subject);
      console.log('LABELS:' + labelsToMonitor);
    }

    issueLabels.forEach(function(label) {
      labelsToMonitor.forEach(function(monitor) {
        if (monitor == label.name) 
        {
          shouldNotify = true;// TODO: no need to continue, we found a match
        }
      });
    });

    // if we found a match, continue, otherwise we are done
    if (shouldNotify) {
      var posted_date = moment(issue.created_at).format("dddd, MMMM Do YYYY, h:mm:ss a");
      var issueBodyPlain = 'Posted at ' + posted_date + '\nAnnouncement URL: ' + issue.html_url + '\n\n' + issue.body;
      var issueBodyHtml = 'Posted at ' + posted_date + '<br/>Announcement URL: <a href=' + issue.html_url + '></a><br/><br/>' + md.render(issue.body);

      if (verbose) {
        console.log(issueBodyHtml);
      }
      
      var msg = {
        to: toEmail,
        from: fromEmail,
        subject: subject,
        text: issueBodyPlain,
        html: issueBodyHtml
      }

      sendgrid
        .send(msg)
        .then(function () { return console.log('Mail queued successfully'); })["catch"](function (error) { return console.error(error.toString()); });
    }
    else {
      console.log('No matching label was applied');
    }

  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()

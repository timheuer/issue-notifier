var core = require('@actions/core');
var github = require('@actions/github');
var sendgrid = require('@sendgrid/mail');
var moment = require('moment');
var Remarkable = require('remarkable').Remarkable;
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
    var labelsToMonitor = core.getInput('labelsToMonitor').split(",");
    var subjectPrefix = core.getInput('subjectPrefix');

    // check to make sure we match any of the labels first
    var context = github.context;
    var issue = context.payload.issue;
    var issueLabels = issue.labels;
    if (verbose) 
    {
      console.log(issue);
      console.log('TO:' + toEmail);
      console.log('FROM:' + fromEmail);
      console.log('SUBJECT:' + subject);
      console.log('SUBJECT PREFIX:' + subjectPrefix);
      console.log('LABELS TO MONITOR:' + labelsToMonitor);
      console.log('LABELS:' + issueLabels);
    }

    // check to see if we found a label
    shouldNotify = issueLabels.map(i => i.name).some(item => labelsToMonitor.includes(item));
    if (verbose) console.log('SHOULD NOTIFY: ' + shouldNotify);

    // if we found a match, continue, otherwise we are done
    if (shouldNotify) {
      var md = new Remarkable({html:true});
      var posted_date = moment(issue.created_at).format("dddd, MMMM Do YYYY, h:mm:ss a");
      var issueBodyPlain = 'Posted at ' + posted_date + '\nAnnouncement URL: ' + issue.html_url + '\n\n' + issue.body;
      var issueBodyHtml = 'Posted at ' + posted_date + '<br/>Announcement URL: <a href=' + issue.html_url + '>' + issue.html_url + '</a><br/><br/>' + md.render(issue.body);

      // construct the right subject line
      if (!subjectPrefix.startsWith('__NONCE__')) {
        subject = subjectPrefix + ' ' + issue.title;
      }

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

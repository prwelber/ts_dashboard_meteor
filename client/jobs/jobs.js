if (Meteor.isClient) {

    let myJobs = JobCollection('myJobQueue');

    Meteor.startup(function () {
        Meteor.subscribe('allJobs');

    // Because of the server settings, the code below will
    // only work if the client is authenticated.
    // On the server, all of it would run unconditionally.

        let job = new Job(myJobs, 'sendEmail', //type of job
        // Job data that you define, including anything the job
        // needs to complete. May contain links to files, etc...
            {
                address: "prwelber@gmail.com",
                subject: "Meteor job testing",
                message: "are jobs in Meteor working?"
            }
        );
        // Set some properties of the job and then submit it
        job.priority('normal')
            .retry({ retries: 5,
                wait: 5*60*1000})  // 5 minutes btwn attemps
            .delay(2*60*1000)      // wait 2 mins before first try
            .save();              // commit to server

        // Now that it's saved, this job will appear as a document
        // in the myJobs Collection, and will reactively update as
        // its status changes, etc.

        // Any job document from myJobs can be turned into a Job object
        job = new Job(myJobs, myJobs.findOne({}));

        // Or a job can be fetched from the server by _id
        myJobs.getJob(_id, function (err, job) {
            // If successful, job is a Job object corresponding to _id
          // With a job object, you can remotely control the
          // job's status (subject to server allow/deny rules)
          // Here are some examples:
          job.pause();
          job.cancel();
          job.remove();
        });
    });
};

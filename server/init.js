import { Meteor } from 'meteor/meteor';
import { UploadServer } from 'meteor/tomi:upload-server'

Meteor.startup(function () {
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads',
    checkCreateDirectories: true,
    getDirectory: function(fileInfo, formFields) {
      // create a sub-directory in the uploadDir based on the content type (e.g. 'images')
      return '/initiatives/' + formFields.initiative + '/';
    },
    getFileName: function (fileInfo, formFields) {
      console.log('GETFILENAME formFields', formFields)
      console.log('GETFILENAME fileInfo', fileInfo)
      return fileInfo.name;
    },
    finished: function(fileInfo, formFields) {
      // perform a disk operation
      console.log('FINISHED', fileInfo, formFields)
    },
    cacheTime: 100,
    mimeTypes: {
        "xml": "application/xml",
        "vcf": "text/x-vcard"
    }
  });
});

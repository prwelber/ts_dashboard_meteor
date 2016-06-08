import { Meteor } from 'meteor/meteor';
import Uploads from '/collections/Uploads';
import Initiatives from '/collections/Initiatives';
import { UploadServer } from 'meteor/tomi:upload-server'

Meteor.methods({
  insertUpload: (fileInfo) => {
    Uploads.insert(fileInfo);
    return "success";
  },
  deleteUpload: (uploadId) => {
    const upload = Uploads.findOne(uploadId);

    if (upload == null) {
      throw new Meteor.Error(404, 'Upload not found'); // maybe some other code
    }

    Uploads.remove(uploadId); // remove from Mongo collection
    UploadServer.delete(upload.path); // remove actual file
    return "success";
  }
});

Meteor.publish('Uploads', function (options) {
  const init = Initiatives.findOne({_id: options._id})
  return Uploads.find({initiative: init.name});
});

// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient({
    keyFilename: './app/configs/ImageClassifier-ed1d46e7fd7b.json'
  });
  
//Image classifier
module.exports.imageClassify = function(req, res){
    // Performs label detection on the image file
    var file = req.files.file;
    var tags = [];
    var scores = [];
    client
      .labelDetection(file.path)
      .then(results => {
        const labels = results[0].labelAnnotations;
        labels.forEach(label => tags.push(label.description));
        labels.forEach(label => scores.push(((label.score*100).toFixed(0).toString())));
        //This is no longer used to send the response
        var data = {
          tags: tags,
          scores: scores
        };
        res.status(200).json([tags,scores]);
        console.log('Someone just uploaded an image');
      })
      .catch(err => {
        console.error('ERROR:', err);
        res.status(500).json(err);
      });
};
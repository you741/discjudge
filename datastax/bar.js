const fs = require('fs');
const fsPromises = fs.promises;

require('dcp-client').initSync();
const compute = require('dcp/compute');

// A number appended at the end of filename to ensure uniqueness
var writeCount = 0;

async function getHexRepresentation(buff) {
  var i; 
  var curHex = '0x';
  var bin = buff.data;
  for (i = 0; i < bin.length; ++i) {
    progress(i / bin.length);
    var curbyte = bin[i]; 
    // A '0' is padded in the front so that 0 will be string '00'
    curHex += curbyte.toString(16).padStart(2, '0'); 
  }
  progress(1.0);
  return curHex;
}

async function readMediaFiles(fileList)
{
  var readPromises = []; // An array of read file promises
  var hexStrList; // An array of hex value blob corresponding to each file
  var fileType = []; // An array containing the file type of each file

  var i;

  for (i = 0; i < fileList.length; ++i) {
    // Read each file asynchronously. 
    readPromises.push(fsPromises.readFile(fileList[i]));

    // Extract the extension from filename to obtain the file type
    fileType.push(fileList[i].split('.')[1]);
  }

  // Wait until all asynchronous file reads are completed
  var binList = await Promise.all(readPromises);

  // Convert BufferArray containing the binary content of each file 
  // to CQL blob in the format of hexadecimal strings

  const job = compute.for(binList, getHexRepresentation);

  job.on('accepted', () => console.log('Job accepted', job.id));
  job.on('complete', () => console.log('Job complete!'));

  job.on('status', (status) => {
        console.log('STATUS:');
        console.log(
            status.total + ' slices posted, ' +
            status.distributed + ' slices distributed, ' +
            status.computed + ' slices computed.'
        );
    });

  const results = await job.localExec();
 
  hexStrList = results.values();

  return [hexStrList, fileType];
}

async function getBufferFromStrHex(hexStrList, fileType)
{
  var fileList = []; // An array containing the names of files created 
  var writePromises = []; // An array of write promises to write asynchronously

  var i, j;

  // Translate a list of CQL blob in the format of hexadecimal string to files 
  for (i = 0; i < hexStrList.length; ++i) {
    var intArr = []; // An array in integer each corresponding to a byte
    var filename;
    var buff; 

    for (j = 2; j < hexStrList[i].length; j += 2) {
      var curByte = parseInt(hexStrList[i].slice(j, j + 2), 16);
      intArr.push(curByte);
    }

    buff = Buffer.from(intArr);

    // Create a write promise 
    filename = 'file' + writeCount + '.' + fileType[i];
    writePromises.push(fsPromises.writeFile(filename, buff));

    fileList.push(filename);

    ++writeCount; 
  }

  // Wait for the asynchronous file writes to finish
  await Promise.all(writePromises);

  return fileList;
}

async function main() 
{
  var strList;
  var fileList;
  var fileType;
  var readResult;
  var i;

  fileList = ['test1.bmp', 'test2.bmp', 'test3.bmp', 'test4.bmp', 'test5.bmp', 'foo.js'];

  readResult = await readMediaFiles(fileList);
  strList = readResult[0];
  fileType = readResult[1];

  // Each entry in the array of strList corresponds to a media file. 

  var fileList = await getBufferFromStrHex(strList, fileType);
  
  console.log(fileList);
}

main();

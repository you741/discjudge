require("dotenv").config()
const file_p = require("./file_p.js")
const b64toBlob = require('b64-to-blob');
const { createClient } = require("@astrajs/rest");
const axios = require('axios');

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true
}));
// create an Astra client

(async() => {
    const astraClient = await createClient({
      astraDatabaseId: process.env.ASTRA_DB_ID,
      astraDatabaseRegion: process.env.ASTRA_DB_REGION,
      applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
    });

    const path = `/api/rest/v1/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/tables/movies_and_tv/rows`;
    //console.log(astraClient)
    /*
    // get a single user by document id
    const { data, status } = await astraClient.get(`${basePath}/cliff@wicklow.com`);

    // get a subdocument by path
    const { data, status } = await astraClient.get(
      `${basePath}/cliff@wicklow.com/blog/comments`
    );*/

    // search a collection of documents
    const options = {
        method: 'GET',
        url: `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/test_data_o`,
        headers: {
            'X-Cassandra-Token': `${process.env.ASTRA_DB_APPLICATION_TOKEN}`
        },
        params: {
            where: {
            },
        },
        validateStatus: false,
    }

    const tableCreationOptions = {
        method: 'POST',
        url: `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2/schemas/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/tables`,
        headers: {
            'X-Cassandra-Token': `${process.env.ASTRA_DB_APPLICATION_TOKEN}`
        },
        data: {
            name: "test_media5",
            columnDefinitions: [{
                name: "code",
                typeDefinition: "blob"
            }, {
                name: "file_type",
                typeDefinition: "text"
            }],
            primaryKey: {
                partitionKey: ["code"]
            }
        },
        validateStatus: false,
    }

    let fileList = ['husky.mov']
    let [hexList, fileTypeList] = await file_p.readMediaFiles(fileList);
    //console.log(hexList[0])

    const uploadOptions = {
        method: 'POST',
        url: `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/test_data_o`,
        headers: {
            'X-Cassandra-Token': `${process.env.ASTRA_DB_APPLICATION_TOKEN}`
        },
        data: {
            "id": 4,
            "q_stmt": "What's the name of the dog in the video?",
            "is_mc": "y",
            "c_1": "Golden Retriever",
            "c_2": "Husky",
            "c_3": "Labrador",
            "c_4": "Border Collie",
            "ans": "B",
            "media_data": hexList[0],
            "media_type": fileTypeList[0]
        },
        validateStatus: false
    }

    const response = await axios.request(options);
    console.log(response.data)

    //file_p.getBufferFromStrHex([response.data.data[0].code],[response.data.data[0].file_type])
    console.log(response.data)
})()

/*
// create a new user without a document id
const { data, status } = await astraClient.post(basePath, {
  name: "cliff",
});

// create a new user with a document id
const { data, status } = await astraClient.put(
  `${basePath}/cliff@wicklow.com`,
  {
    name: "cliff",
  }
);

// create a user subdocument
const { data, status } = await astraClient.put(
  `${basePath}/cliff@wicklow.com/blog`,
  {
    title: "new blog",
  }
);

// partially update user
const { data, status } = await astraClient.patch(
  `${basePath}/cliff@wicklow.com`,
  {
    name: "cliff",
  }
);

// delete a user
const { data, status } = await astraClient.delete(
  `${basePath}/cliff@wicklow.com`
);
*/

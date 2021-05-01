require("dotenv").config()
const { createClient } = require("@astrajs/rest");

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
    const response = await astraClient.get(path);

    console.log(response)
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

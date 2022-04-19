const functions = require("firebase-functions")
const cors = require("cors")
const axios = require("axios")

exports.formStat = functions
// Make the secret available to this function
  .runWith({secrets: ["JOTFORM_API"]})
  .https.onRequest((request, response) => {
    cors()(request, response, async () => {
      const formID = request.path.replace(/^\//, "")

      if (/\D/.test(formID)) {
        response.status(400).send(`Invalid form ID "${formID}"`)
        return
      }

      let content = await axios.get(`https://eu-api.jotform.com/form/${formID}`, {
        params: {
          apiKey: process.env.JOTFORM_API,
        },
      })
      const count = parseInt(content.data.content.count)

      content = await axios.get(
        `https://eu-api.jotform.com/form/${formID}/properties/limitSubmission`,
        {
          params: {
            apiKey: process.env.JOTFORM_API,
          },
        },
      )
      const limit = parseInt(content.data.content.limitSubmission)

      response.json({
        count: count,
        limit: limit,
        available: limit - count,
      })
    })
  })

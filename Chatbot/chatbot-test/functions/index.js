
"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");
const { SessionsClient } = require("dialogflow");
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./flights-chatbot-uonm-ccc1d7d8a57d copy.json");
const cors = require("cors")({ origin: true });
const mod = require("./helper/getIATA");
const axios = require("axios");

const token = "duffel_test_T1p2vDBiOUjZmk4BLQqQjiXkrHgvwNxz2jGCY1UTGSF";

let destination;
let departure;
let departureDate;
let returnDate;
let numberOfPassengers;
let numberOfChildrens;
let childrensAge = [];
let passengers = [];

const getPassengers = () => {
  for (let i = 0; i < numberOfPassengers; i++) {
    passengers.push({ type: "adult" });
  }
  for (let j = 0; j < childrensAge.length; j++) {
    passengers.push({ age: childrensAge[j] });
  }
};

const getFlights = async () => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Duffel-Version": "beta",
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip",
    },
  };

  const bodyParameters = {
    data: {
      slices: [
        {
          origin: departure[0],
          destination: destination[0],
          departure_date: departureDate,
        },
        {
          origin: destination[0],
          destination: departure[0],
          departure_date: returnDate,
        },
      ],
      passengers: passengers,
      cabin_class: "business",
    },
  };
  let res = await axios.post(
    "https://api.duffel.com/air/offer_requests",
    bodyParameters,
    config
  );
  return res.data;
};

// }
//   let res = await axios.post('https://api.duffel.com/air/offer_requests',{
//     "data": {
//         "slices": [
//             {
//                 "origin": "NYC",
//                 "destination": "ATL",
//                 "departure_date": "2022-06-23"
//             },
//             {
//                 "origin": "ATL",
//                 "destination": "NYC",
//                 "departure_date": "2022-07-21"
//             }
//         ],
//         "passengers": [
//             {
//                 "type": "adult"
//             },
//             {
//                 "type": "adult"
//             },
//             {
//                 "age": 1
//             }
//         ],
//         "cabin_class": "business"
//     }
// },{ headers: {"Authorization" : `Bearer ${token}`,"Duffel-Version":"beta", "Accept":"application/json", "Content-Type":"application/json","Accept-Encoding":"gzip"} });
// console.log(res)
// }

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://chatbot-test-bbcb1-default-rtdb.firebaseio.com/",
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    cors(request, response, async () => {
      const { queryInput, sessionId } = request.body;
      const SessionClient = new SessionsClient({ credentials: serviceAccount });
      const session = SessionClient.sessionPath(
        "flights-chatbot-uonm",
        sessionId
      );
      const responses = await SessionClient.detectIntent({
        session,
        queryInput,
      });
      const result = responses[0].queryResult;
      const test = request.body.queryResult;
      //  console.log(result.parameters.fields.to.structValue.fields.city)

      switch (result.intent.displayName) {
        case "flight - context:flight - comment:to":
          destination = mod.getIATA(
            result.parameters.fields.destination.stringValue
          );
          console.log(destination);
          break;
        case "flight - context:flight - comment:from":
          departure = mod.getIATA(
            result.parameters.fields.departure.stringValue
          );
          console.log(departure);
          break;
        case "flight - context:flight - comment:departure-date":
          departureDate = result.parameters.fields.departure.stringValue.slice(
            0,
            10
          );
          console.log(departureDate);
          break;
        case "flight - context:flight - comment:return-date":
          returnDate = result.parameters.fields.return.stringValue.slice(0, 10);
          break;
        case "number of passengers":
          numberOfPassengers = result.parameters.fields.number.numberValue;
          passengers = [];
          result.summary = {
            destination,
            departure,
            departureDate,
            returnDate,
            numberOfPassengers,
          };
          console.log(numberOfPassengers);
          break;
        case "number of children":
          numberOfChildrens = result.parameters.fields.number.numberValue;
          childrensAge = [];
          if (numberOfChildrens === 0) {
            getPassengers();

            let offers = await getFlights(
              destination,
              departure,
              departureDate,
              returnDate
            );
            result.offers = offers;
          }

          //console.log(numberOfChildrens)
          break;
        case "number of children - age":
          console.log(
            result.parameters.fields.age.structValue.fields.amount.numberValue
          );
          childrensAge.push(
            result.parameters.fields.age.structValue.fields.amount.numberValue
          );
          //console.log(childrensAge)
          if (childrensAge.length === numberOfChildrens) {
            getPassengers();
            console.log(passengers);
            let offers = await getFlights(
              destination,
              departure,
              departureDate,
              returnDate
            );
            result.offers = offers;
          }

          break;
        default:
        // code block
      }

      response.send(result);
    });
  }
);

// const handelDestinationFlight=(input)=>{
//   const destination =
// }

//   exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
//   const agent = new WebhookClient({ request, response });
//   console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
//   console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
//   const result=request.body.queryResult

//   function welcome(agent) {
//     agent.add(`Welcome to my agent!`);
//   }

//   function fallback(agent) {
//     agent.add(`I didn't understand`);
//     agent.add(`I'm sorry, can you try again?`);

//     let intentMap = new Map();
//   intentMap.set('Default Welcome Intent', welcome);
//   intentMap.set('Default Fallback Intent', fallback);
//   // intentMap.set('your intent name here', yourFunctionHandler);
//   // intentMap.set('your intent name here', googleAssistantHandler);
//   agent.handleRequest(intentMap);
//   }})
// ///////////////////////////////////////////////////////////////////
//   // // Uncomment and edit to make your own intent handler
//   // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
//   // // below to get this function to be run when a Dialogflow intent is matched
//   // function yourFunctionHandler(agent) {
//   //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
//   //   agent.add(new Card({
//   //       title: `Title: this is a card title`,
//   //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
//   //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
//   //       buttonText: 'This is a button',
//   //       buttonUrl: 'https://assistant.google.com/'
//   //     })
//   //   );
//   //   agent.add(new Suggestion(`Quick Reply`));
//   //   agent.add(new Suggestion(`Suggestion`));
//   //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
//   // }

//   // // Uncomment and edit to make your own Google Assistant intent handler
//   // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
//   // // below to get this function to be run when a Dialogflow intent is matched
//   // function googleAssistantHandler(agent) {
//   //   let conv = agent.conv(); // Get Actions on Google library conv instance
//   //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
//   //   agent.add(conv); // Add Actions on Google library responses to your agent's response
//   // }
//   // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
//   // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

//   // Run the proper function handler based on the matched Dialogflow intent name
//   /////////////////////////////////////////////////////////////////////////////////////

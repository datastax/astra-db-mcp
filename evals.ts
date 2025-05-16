//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const GetCollectionsEval: EvalFunction = {
    name: "GetCollections Tool Evaluation",
    description: "Evaluates retrieving all collections from the Astra DB database",
    run: async () => {
        const result = await grade(openai("gpt-4"), "What collections exist in my Astra DB database?");
        return JSON.parse(result);
    }
};

const CreateCollectionEval: EvalFunction = {
  name: "CreateCollection Tool Evaluation",
  description: "Evaluates the creation of a new collection in the database",
  run: async () => {
    const result = await grade(openai("gpt-4"), "Please create a new vector collection named 'my_test_collection' with dimension 1024 in the database.");
    return JSON.parse(result);
  }
};

const UpdateCollectionEval: EvalFunction = {
    name: "UpdateCollection Tool Evaluation",
    description: "Evaluates the ability to update an existing collection in the database",
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please rename the collection named 'myOldCollection' to 'myNewCollection'.");
        return JSON.parse(result);
    }
};

const DeleteCollectionEval: EvalFunction = {
    name: "DeleteCollection Tool Evaluation",
    description: "Evaluates the tool's ability to delete a specified collection from the database",
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please delete the 'TestCollection' collection from the database.");
        return JSON.parse(result);
    }
};

const ListRecordsEval: EvalFunction = {
    name: "ListRecords Tool Evaluation",
    description: "Evaluates the listing of records from a collection in the database",
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please list up to 5 records from the 'users' collection using the 'ListRecords' tool.");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [GetCollectionsEval, CreateCollectionEval, UpdateCollectionEval, DeleteCollectionEval, ListRecordsEval]
};
  
export default config;
  
export const evals = [GetCollectionsEval, CreateCollectionEval, UpdateCollectionEval, DeleteCollectionEval, ListRecordsEval];
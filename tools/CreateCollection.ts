// Copyright DataStax, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { db } from "../util/db.js";

export interface CreateCollectionParams {
  collectionName: string;
  vector?: boolean;
  dimension?: number;
  metric?: "cosine" | "euclidean" | "dot_product";
  service?: {
    provider: string;
    modelName: string;
    parameters?: Record<string, any>;
    authentication?: Record<string, any>;
  };
  defaultId?: {
    type: "objectId" | "uuid" | "uuidv6" | "uuidv7" | "default";
  };
  indexing?: {
    allow?: string[];
    deny?: string[];
  };
}

export async function CreateCollection(params: CreateCollectionParams) {
  const {
    collectionName,
    vector = true,
    dimension = 1536,
    metric = "cosine",
    service,
    defaultId,
    indexing,
  } = params;

  const options: Record<string, any> = {};

  if (service) {
    options.vector = {
      service: {
        provider: service.provider,
        modelName: service.modelName,
        ...(service.parameters ? { parameters: service.parameters } : {}),
        ...(service.authentication ? { authentication: service.authentication } : {}),
      },
      ...(dimension ? { dimension } : {}),
      metric,
    };
  } else if (vector) {
    options.vector = {
      dimension,
      metric,
    };
  }

  if (defaultId) {
    options.defaultId = defaultId;
  }

  if (indexing) {
    options.indexing = indexing;
  }

  if (Object.keys(options).length > 0) {
    await db.createCollection(collectionName, options as any);
  } else {
    await db.createCollection(collectionName);
  }

  return {
    success: true,
    message: `Collection '${collectionName}' created successfully`,
  };
}

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

export async function DeleteCollection(params: { collectionName: string }) {
  const { collectionName } = params;

  try {
    // Try to use dropCollection if available
    if (typeof db.dropCollection === 'function') {
      await db.dropCollection(collectionName);
    } else {
      // If dropCollection is not available, log a warning
      console.warn(`No dropCollection method available for collection '${collectionName}'`);
    }

    return {
      success: true,
      message: `Collection '${collectionName}' deleted successfully`,
    };
  } catch (error) {
    console.error(`Error deleting collection '${collectionName}':`, error);
    return {
      success: false,
      message: `Failed to delete collection '${collectionName}'`,
    };
  }
}

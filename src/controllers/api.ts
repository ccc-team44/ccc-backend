"use strict";

import { Response, Request, NextFunction } from "express";
import db, { nano } from "../db";

/**
 * GET /api
 * List of API examples.
 */
export const getApi = (req: Request, res: Response) => {
    res.render("api/index", {
        title: "API Examples"
    });
};
export const allCoordinates = async (req: Request, res: Response) => {
    const viewId = "coordinate-cluster";
    const data = await db.view(viewId, viewId, {
        group: true
    }).then((body: any) => {

        return body.rows.filter((r: { value: number }) => r.value > 1).map((r: { key: any[]; value: any }) => ({
            lng: r.key[1],
            lat: r.key[0],
            count: r.value
        }));
    }).catch(console.log);

    res.json(data);
};

export const langCount = async (req: Request, res: Response) => {
    const designId = "lang";
    const viewId = "lang-count";
    const data = await db.view(designId, viewId, {
        group: true
    }).then((body: {
        rows: any[];
    }) => body.rows).catch(console.log);

    res.json(data);
};

const handleDocs = async (db, docs: any[]) => {
    return await Promise.all(docs.map(doc=> {
        return db.insert({...doc.doc, _id: doc.id}).catch(console.log)
    }));
};

export const stream = async (req: Request, res: Response) => {
    const dbName = "tweets";
    const classifiedDbName = `classified_${dbName}`;
    await nano.db.get(classifiedDbName).catch(err => {
        console.log(err);
        nano.db.create(classifiedDbName).then(() => {
            console.log("database created!");
        });
    });
    const classifiedDb = nano.use(classifiedDbName);
    const last = await classifiedDb.list({limit:10,descending: true}).then(body => body && body.rows && body.rows.find && body.rows.find(el => !el.id.startsWith("_") ));

    let run = true;
    let startKey = last ? last.id  : null;
    console.log(startKey);
    const params = {
        include_docs: true,
        limit: 10
    };

    let i = 0;
    while(run)
    {
        if(startKey) {
            params.start_key_doc_id = startKey;
        }
        const docs = await db.list(params)
          .then(body => {
              if(body.rows.length){
                  startKey = body.rows[body.rows.length -1].id;
              }
              else{
                  run = false;
              }



              if(i > 0) run = false;
              i+=1;

              return body.rows;

          });
        if(docs)
            await handleDocs(classifiedDb, docs)
    }

    res.json({});
};

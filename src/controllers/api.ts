"use strict";

import { Response, Request, NextFunction } from "express";
import db, { nano } from "../db";
import axios from "axios";
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

export const scomoLocation = async (req: Request, res: Response) => {
    const designId = "scomo";
    const viewId = "scomo";
    const data = await db.view(designId, viewId, {
        group: true
    }).then((body: {
        rows: any[];
    }) => body.rows.filter((r: { value: number }) => r.value > 1).map((r: { key: any[]; value: any }) => ({
        lng: r.key[1],
        lat: r.key[0],
        count: r.value
    }))).catch(console.log);

    res.json(data);
};

export const scomo = async (req: Request, res: Response) => {
    const dbId = "morrison_output";
    const docId = "792eb77e25fcc87dd30f2b022fbd08f7";
    const data = await nano.use(dbId).get(docId).then((doc: any) => doc).catch(console.log);
    res.json(data);
};

export const retweet = async (req: Request, res: Response) => {
    const dbId = "retweet_output";
    const docId = "retweet";
    const data = await nano.use(dbId).get(docId).then((doc: any) => doc).catch(console.log);
    res.json(data);
};

export const lang = async (req: Request, res: Response) => {
    const dbId = "lang_output";
    const docId = "lang";
    const data = await nano.use(dbId).get(docId).then((doc: any) => doc).catch(console.log);
    res.json(data);
};

const handleDocs = async (classifiedDb: any, docs: any[]) => {
    return await Promise.all(docs.map(async doc=> {
        await axios.post("http://172.26.130.31:8502/predict", `{ "instances": [ { "tweet": "${doc.doc.text}" }] }`,{
            headers: { "Content-Type": "text/plain" }
        }).then(res=> {
            const predictions = res?.data?.predictions
            if(predictions!== undefined){
                const newDoc = {...doc.doc, _id: doc.id, predictions}
                delete newDoc._rev
                return classifiedDb.insert(newDoc).catch(console.log);
            }
        });

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
        limit: 10,
        start_key_doc_id: undefined
    } as  any;

    // let i = 0;
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


              //
              // if(i > 0) run = false;
              // i+=1;

              return body.rows;

          });
        if(docs)
            await handleDocs(classifiedDb, docs);
    }

    res.json({});
};

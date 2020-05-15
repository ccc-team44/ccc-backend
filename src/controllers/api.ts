"use strict";

import { Response, Request, NextFunction } from "express";
import db from "../db";

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

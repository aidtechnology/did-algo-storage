import express, { Express, Request, Response } from "express";
import algosdk from "algosdk";
import morgan from "morgan";
import { getAlgodClient, getAccount } from "./utils";
import {
  resolveDID,
  uploadDIDDocument,
  deleteDIDDocument,
  updateDIDDocument,
} from "./index";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeBox(buf: Buffer): any {
  try {
    return JSON.parse(buf.toString("utf-8"));
  } catch (e: unknown) {
    return { error: "invalid box contents" };
  }
}

async function runServer() {
  // setup agent
  const algod = getAlgodClient();
  const sender = getAccount();
  const app: Express = express();
  app.use(express.json());
  app.use(morgan("dev"));

  // reachability check
  app.get("/v1/ping", (req: Request, res: Response) => {
    res.send({ pong: true });
  });

  // availability check
  app.get("/v1/ready", (req: Request, res: Response) => {
    res.send({ ready: true });
  });

  // get algod status
  app.get("/v1/algod_status", async (req: Request, res: Response) => {
    const status = await algod.status().do();
    res.send(status);
  });

  // resolve an existing DID
  // GET /v1/:addr/:appId
  app.get("/v1/:addr/:appId", async (req: Request, res: Response) => {
    try {
      const box: Buffer = await resolveDID(
        `did:algo:${req.params.addr}-${req.params.appId}`,
        algod
      );
      res.send(decodeBox(box));
    } catch (e: unknown) {
      // report any issues as "bad request"
      res.status(400).send({ error: errorMessage(e) });
    }
  });

  // upload a new DID document
  // POST /v1/:addr/:appId
  app.post("/v1/:addr/:appId", async (req: Request, res: Response) => {
    try {
      const pk = algosdk.decodeAddress(req.params.addr).publicKey;
      await uploadDIDDocument(
        Buffer.from(JSON.stringify(req.body)),
        Number(req.params.appId),
        pk,
        sender,
        algod
      );
      res.send({ ok: true });
    } catch (e: unknown) {
      // report any issues as "bad request"
      res.status(400).send({ error: errorMessage(e) });
    }
  });

  // update/replace an existing DID document
  // PUT /v1/:addr/:appId
  app.put("/v1/:addr/:appId", async (req: Request, res: Response) => {
    try {
      const pk = algosdk.decodeAddress(req.params.addr).publicKey;
      await updateDIDDocument(
        Buffer.from(JSON.stringify(req.body)),
        Number(req.params.appId),
        pk,
        sender,
        algod
      );
      res.send({ ok: true });
    } catch (e: unknown) {
      // report any issues as "bad request"
      res.status(400).send({ error: errorMessage(e) });
    }
  });

  // delete an existing DID document
  // DELETE /v1/:addr/:appId
  app.delete("/v1/:addr/:appId", async (req: Request, res: Response) => {
    try {
      const pk = algosdk.decodeAddress(req.params.addr).publicKey;
      await deleteDIDDocument(Number(req.params.appId), pk, sender, algod);
      res.send({ ok: true });
    } catch (e: unknown) {
      // report any issues as "bad request"
      res.status(400).send({ error: errorMessage(e) });
    }
  });

  // start server
  app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("server listening on port 3000");
  });
}

runServer();
